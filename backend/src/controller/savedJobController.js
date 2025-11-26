// controller/savedJobController.js
import db from "../configs/data.js";

// ✅ Lưu công việc đã chọn cho người dùng hiện tại
export const saveJob = async (req, res) => {
  try {
    const userId = req.user?.user_id; // 🧩 Lấy user_id từ token
    const { jobId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
    }

    if (!jobId) {
      return res.status(400).json({ message: "Thiếu ID công việc." });
    }

    // 🔍 Kiểm tra xem đã lưu chưa
    const [existing] = await db.query(
      "SELECT * FROM saved_jobs WHERE user_id = ? AND job_id = ?",
      [userId, jobId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Công việc này đã được lưu." });
    }

    // 💾 Lưu mới
    await db.query("INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)", [
      userId,
      jobId,
    ]);

    return res.status(201).json({ message: "Đã lưu công việc thành công." });
  } catch (error) {
    console.error("❌ Lỗi khi lưu công việc:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lưu công việc.",
      error: error.message,
    });
  }
};

// ✅ Lấy danh sách công việc đã lưu của người dùng hiện tại
// ======================================================
export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
    }

    const [rows] = await db.query(
      `
      SELECT 
        j.job_id AS id,
        j.title,
        c.company_name AS company,
        l.city AS location,
        j.salary_range AS salary,
        jt.type_name AS type,
        j.posted_date,
        j.description,
        j.requirements,
        j.benefits,
        i.name AS industry_name,
        s.saved_at
      FROM saved_jobs s
      JOIN jobs j ON s.job_id = j.job_id
      JOIN companies c ON j.company_id = c.company_id
      JOIN locations l ON j.location_id = l.location_id
      JOIN job_types jt ON j.job_type_id = jt.job_type_id
      JOIN industries i ON j.industry_id = i.industry_id
      WHERE s.user_id = ?
      ORDER BY s.saved_at DESC
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        message: "Bạn chưa lưu công việc nào.",
        savedJobs: [],
      });
    }

    // 🔧 Định dạng lại dữ liệu cho frontend
    const savedJobs = rows.map((job) => ({
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

    return res.status(200).json({
      message: "Lấy danh sách công việc đã lưu thành công.",
      savedJobs,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách công việc đã lưu:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi tải công việc đã lưu.",
      error: error.message,
    });
  }
};
// ✅ Xóa công việc khỏi danh sách đã lưu
export const deleteSavedJob = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { jobId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Người dùng chưa đăng nhập." });
    }

    const [result] = await db.query(
      "DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?",
      [userId, jobId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc này trong danh sách đã lưu.",
      });
    }

    res.json({ success: true, message: "Đã bỏ lưu công việc thành công." });
  } catch (error) {
    console.error("❌ Lỗi khi xóa công việc đã lưu:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi bỏ lưu công việc.",
    });
  }
};
