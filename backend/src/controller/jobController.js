import db from "../configs/data.js";
import axios from "axios";

// ================================================
// LAY DANH SACH NGANH
// ================================================
export const getIndustries = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT industry_id, name
      FROM industries
      ORDER BY name
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching industries:", error.message);
    res.status(500).json({ message: "Lỗi khi truy vấn industries" });
  }
};

// ================================================
// LAY DANH SACH CONG VIEC
// ================================================
export const getAllJobs = async (req, res) => {
  try {
    // Cap nhat SQL: Lay location va job_type truc tiep tu bang jobs
    const sql = `
      SELECT 
        j.job_id AS id,
        j.title,
        c.company_name AS company,
        j.location,
        j.salary_range AS salary,
        j.job_type AS type,
        j.posted_date,
        j.description,
        j.requirements,
        j.benefits,
        i.industry_id,
        i.name AS industry_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      LEFT JOIN industries i ON j.industry_id = i.industry_id
      ORDER BY j.posted_date DESC
    `;

    const [jobs] = await db.query(sql);

    const jobsWithExtras = jobs.map((job) => ({
      ...job,
      requirements: job.requirements
        ? job.requirements
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean)
        : [],
      benefits: job.benefits
        ? job.benefits
            .split(/[;\n,]+/)
            .map((b) => b.trim())
            .filter(Boolean)
        : [],
    }));

    res.json(jobsWithExtras);
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({ message: "Lỗi khi truy vấn jobs" });
  }
};

// ================================================
// LAY CHI TIET CONG VIEC THEO ID
// ================================================
export const getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT 
        j.job_id AS id,
        j.title,
        c.company_name AS company,
        j.location,
        j.salary_range AS salary,
        j.job_type AS type,
        j.posted_date,
        j.description,
        j.requirements,
        j.benefits
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.job_id = ?
    `;

    const [jobs] = await db.query(sql, [id]);

    if (jobs.length === 0)
      return res.status(404).json({ message: "Không tìm thấy công việc" });

    const rawJob = jobs[0];
    const job = {
      ...rawJob,
      requirements: rawJob.requirements
        ? rawJob.requirements
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean)
        : [],
      benefits: rawJob.benefits
        ? rawJob.benefits
            .split(/[;\n,]+/)
            .map((b) => b.trim())
            .filter(Boolean)
        : [],
    };

    res.json(job);
  } catch (error) {
    console.error("Error fetching job detail:", error.message);
    res.status(500).json({ message: "Lỗi khi truy vấn chi tiết công việc" });
  }
};

// =========================================
// API DU DOAN MUC LUONG
// =========================================
export const predictJobSalaries = async (req, res) => {
  try {
    // 1. Lay du lieu tu DB (Loai bo join locations va job_types thua)
    const sql = `
      SELECT 
        j.job_id,
        c.company_name,
        j.title,
        j.description,
        j.location,
        j.views,
        j.job_type AS formatted_work_type,
        j.remote_allowed,
        j.experience_level AS formatted_experience_level,
        j.skills_desc,
        j.sponsored,
        j.application_type
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      ORDER BY j.posted_date DESC
      LIMIT 50
    `;

    const [jobs] = await db.query(sql);

    if (jobs.length === 0) {
      return res.status(404).json({ message: "Không có job để dự đoán" });
    }

    // 2. Chuan hoa du lieu cho Model
    const normalizedJobs = jobs.map((job) => ({
      job_id: job.job_id,
      company_name: job.company_name || "Unknown",
      title: job.title || "",
      description: job.description || "",
      location: job.location || "Remote",
      views: job.views || 0,
      formatted_work_type: job.formatted_work_type || "Full-time",
      remote_allowed: job.remote_allowed ? 1 : 0,
      formatted_experience_level:
        job.formatted_experience_level || "Entry Level",
      skills_desc: job.skills_desc || "",
      sponsored: job.sponsored ? 1 : 0,
      application_type: job.application_type || "Simple",
    }));

    // 3. Goi API Machine Learning
    const mlUrl = "http://127.0.0.1:8000/predict_batch";
    const mlResponse = await axios.post(mlUrl, { jobs: normalizedJobs });
    const predictions = mlResponse.data?.predictions || [];

    // 4. Luu ket qua vao DB
    for (const p of predictions) {
      await db.query(
        `INSERT INTO predicted_salaries (job_id, predicted_salary)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE predicted_salary = VALUES(predicted_salary)`,
        [p.job_id, p.predicted_salary]
      );
    }

    // 5. Tra ve ket qua da duoc cap nhat
    const [finalResult] = await db.query(`
      SELECT 
        j.job_id,
        j.title,
        c.company_name,
        ps.predicted_salary
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      LEFT JOIN predicted_salaries ps ON j.job_id = ps.job_id
      ORDER BY j.job_id DESC
      LIMIT 50
    `);

    return res.json({
      message: "Dự đoán thành công!",
      total: finalResult.length,
      items: finalResult,
    });
  } catch (err) {
    console.error("Error predictJobSalaries:", err.message);
    return res.status(500).json({
      message: "Lỗi khi dự đoán từ mô hình ML",
      error: err.message,
    });
  }
};

// ============================================================
// THEM JOB MOI (Updated: Sử dụng Procedure mới)
// ============================================================
export const createJobUsingProcedure = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    const {
      title,
      industry_id,
      city,
      salary_range,
      type_name,
      description,
      requirements,
      benefits,
    } = req.body;

    if (!user_id || !title || !industry_id || !city || !type_name) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu dữ liệu bắt buộc (Tiêu đề, Ngành nghề, Địa điểm, Loại hình)",
      });
    }

    // Procedure mới sẽ tự tìm company_id trong bảng company_members
    const sql = `CALL createJobByUser(?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      user_id,
      industry_id,
      title,
      salary_range || "Thỏa thuận",
      city,
      type_name,
      description || "",
      requirements || "",
      benefits || "",
    ];

    const [resultSets] = await db.query(sql, params);
    const newJobData = resultSets[0] ? resultSets[0][0] : null;
    const newJobId = newJobData ? newJobData.new_job_id : null;

    if (!newJobId) {
      throw new Error("Không lấy được ID công việc sau khi tạo.");
    }

    return res.status(201).json({
      success: true,
      message: "🎉 Đăng tin tuyển dụng thành công!",
      job_id: newJobId,
      data: {
        job_id: newJobId,
        user_id,
        title,
        city,
      },
    });
  } catch (error) {
    console.error("Error creating job:", error.message);

    // Xử lý lỗi từ Procedure (Nếu user không phải member Active)
    if (error.sqlState === "45000") {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lưu công việc.",
      error: error.message,
    });
  }
};

// ============================================================
// LAY DANH SACH JOB CUA NGUOI DUNG (Updated: Logic Mới)
// ============================================================
export const getJobsByCurrentUser = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Không xác định được người dùng." });
    }

    // 🔴 UPDATE LOGIC QUAN TRỌNG:
    // Join với bảng `company_members` để biết user thuộc công ty nào
    // Sau đó Join `jobs` dựa trên `company_id` tìm được
    // Và Join `companies` để lấy tên công ty
    const sql = `
      SELECT 
        j.job_id,
        j.title,
        c.company_name, 
        i.name AS industry_name,
        j.location,
        j.job_type,
        j.salary_range,
        j.posted_date,
        j.description,
        cm.role AS my_role_in_company  -- Lấy thêm vai trò để hiển thị nếu cần
      FROM jobs j
      JOIN company_members cm ON j.company_id = cm.company_id
      JOIN companies c ON j.company_id = c.company_id
      LEFT JOIN industries i ON j.industry_id = i.industry_id
      WHERE cm.user_id = ?
      ORDER BY j.job_id DESC
    `;

    const [rows] = await db.query(sql, [user_id]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      jobs: rows,
    });
  } catch (error) {
    console.error("Error getting user jobs:", error.message);
    return res.status(500).json({
      message: "Lỗi server khi tải danh sách bài đăng.",
      error: error.message,
    });
  }
};
// ============================================================
// LAY RECOMMENDATION CACHE
// ============================================================
export const getRecommendCache = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: "Token không hợp lệ" });
    }

    // Query don gian, chi can dam bao bang recommendation_cache ton tai
    const [rows] = await db.execute(
      `
      SELECT 
         job_id, 
         title, 
         location, 
         salary,
         updated_at
      FROM recommendation_cache
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 3;
      `,
      [user_id]
    );

    if (rows.length === 0) {
      return res.json({
        idJobs: [],
        recommendations: [],
        message: "Chưa có dữ liệu gợi ý",
      });
    }

    const idJobs = rows.map((r) => r.job_id);

    return res.json({
      idJobs,
      recommendations: rows,
    });
  } catch (err) {
    console.error("Error get cache:", err.message);
    return res.status(500).json({ error: "Lỗi server khi lấy cache" });
  }
};
// ============================================================
// LAY CHI TIET JOB + SO LUONG UNG TUYEN (Optimized)
// ============================================================
export const getJobDetailWithCount = async (req, res) => {
  const { id } = req.params;

  try {
    // Chúng ta lấy thêm cột j.application_count
    const sql = `
      SELECT 
        j.job_id AS id,
        j.title,
        c.company_name AS company,
        c.logo AS company_logo,      -- Thêm logo cho đẹp
        j.location,
        j.salary_range AS salary,
        j.job_type AS type,
        j.posted_date,
        j.description,
        j.requirements,
        j.benefits,
        j.application_count AS total_applicants-- <--- CỘT QUAN TRỌNG
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.job_id = ?
    `;

    const [jobs] = await db.query(sql, [id]);

    if (jobs.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy công việc" });
    }

    const rawJob = jobs[0];

    // Xử lý dữ liệu thô (String -> Array)
    const job = {
      ...rawJob,
      // Đảm bảo số lượng luôn là số (tránh null)
      total_applicants: rawJob.total_applicants || 0,

      requirements: rawJob.requirements
        ? rawJob.requirements
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean)
        : [],

      benefits: rawJob.benefits
        ? rawJob.benefits
            .split(/[;\n,]+/)
            .map((b) => b.trim())
            .filter(Boolean)
        : [],
    };

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error fetching job detail with count:", error.message);
    res.status(500).json({ message: "Lỗi khi truy vấn chi tiết công việc" });
  }
};
