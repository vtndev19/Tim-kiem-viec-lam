import db from "../configs/data.js";
import {
  sendApplicationEmails,
  sendResultEmail,
} from "../../services/emailService.js";

const VALID_APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "accepted",
  "rejected",
];

// Helper: Parse JSON an toàn
const parseJSON = (data) => {
  if (!data) return [];
  try {
    if (typeof data === "object") return data;
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

/**
 * =================================================================
 * 1. NỘP ĐƠN ỨNG TUYỂN (CANDIDATE)
 * - Logic: Candidate nộp đơn -> Email gửi về cho Recruiter/Công ty
 * =================================================================
 */
export const applyJob = async (req, res) => {
  const userId = req.user?.user_id;
  const { job_id, cv_id, email, phone, cover_letter } = req.body;

  if (!job_id || !cv_id || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc (job_id, cv_id, email, phone)",
    });
  }

  try {
    // BƯỚC 1: INSERT vào bảng applications
    const insertSql = `
      INSERT INTO applications (user_id, job_id, cv_id, email, phone, cover_letter) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.execute(insertSql, [
      userId,
      job_id,
      cv_id,
      email,
      phone,
      cover_letter || "",
    ]);

    // BƯỚC 2: Tăng bộ đếm trong bảng jobs
    const updateCountSql = `
      UPDATE jobs SET application_count = application_count + 1 WHERE job_id = ?
    `;
    await db.execute(updateCountSql, [job_id]);

    // BƯỚC 3: Phản hồi Client
    res.status(201).json({
      success: true,
      message: "Ứng tuyển thành công",
    });

    // BƯỚC 4: Gửi Email Background
    (async () => {
      try {
        // 🟢 Cập nhật: Lấy email liên hệ của công ty (contact_email)
        const infoSql = `
          SELECT 
            j.title, 
            c.contact_email as recruiter_email, -- Cột mới trong DB là contact_email
            u.full_name as user_name
          FROM jobs j
          JOIN companies c ON j.company_id = c.company_id
          JOIN users u ON u.user_id = ?
          WHERE j.job_id = ?
        `;
        const [jobData] = await db.execute(infoSql, [userId, job_id]);

        if (jobData.length > 0) {
          const info = jobData[0];
          // Nếu không có email công ty, có thể fallback gửi cho người đăng job (nếu cần logic phức tạp hơn)
          if (info.recruiter_email) {
            await sendApplicationEmails(
              { name: info.user_name, email, phone, coverLetter: cover_letter },
              { title: info.title },
              info.recruiter_email
            );
          }
        }
      } catch (bgError) {
        console.error("[Background Email] Lỗi gửi email ứng tuyển:", bgError);
      }
    })();
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã ứng tuyển công việc này rồi",
      });
    }
    console.error("[Application] Lỗi applyJob:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
  }
};

/**
 * =================================================================
 * 2. LẤY DANH SÁCH ỨNG VIÊN CỦA 1 JOB (RECRUITER)
 * - Logic: Check quyền qua bảng company_members
 * =================================================================
 */
export const getJobApplicants = async (req, res) => {
  const userId = req.user.user_id;
  const { job_id } = req.params;

  try {
    // 🔴 SỬA LỖI: Check quyền thông qua bảng company_members
    // User phải là thành viên 'Active' của công ty sở hữu Job này
    const checkSql = `
      SELECT j.job_id 
      FROM jobs j
      JOIN company_members cm ON j.company_id = cm.company_id
      WHERE j.job_id = ? 
      AND cm.user_id = ? 
      AND cm.status = 'Active'
    `;
    const [jobCheck] = await db.execute(checkSql, [job_id, userId]);

    if (jobCheck.length === 0)
      return res
        .status(403)
        .json({
          message:
            "Bạn không có quyền xem danh sách này (hoặc Job không tồn tại)",
        });

    // 2. Query lấy danh sách
    const querySql = `
      SELECT 
        a.application_id, 
        a.status, 
        a.applied_at,
        a.email AS contact_email, 
        a.phone AS contact_phone,
        
        -- Thông tin User
        u.full_name AS candidate_name,
        u.avatar,
        
        -- Thông tin CV cơ bản
        c.cv_id, 
        c.title AS cv_title, 
        c.file_url,
        c.summary
      FROM applications a
      JOIN users u ON a.user_id = u.user_id
      JOIN cv c ON a.cv_id = c.cv_id
      WHERE a.job_id = ?
      ORDER BY a.applied_at DESC
    `;

    const [rows] = await db.execute(querySql, [job_id]);

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("[Application] Lỗi getJobApplicants:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

/**
 * =================================================================
 * 3. LẤY CHI TIẾT 1 ĐƠN ỨNG TUYỂN (RECRUITER - DETAIL)
 * - Logic: Join company_members để validate quyền
 * =================================================================
 */
export const getApplicationDetail = async (req, res) => {
  const userId = req.user.user_id;
  const { application_id } = req.params;

  try {
    // 🔴 SỬA LỖI: Thay thế `comp.user_id` bằng `company_members` check
    const sql = `
      SELECT 
        -- 1. THÔNG TIN ỨNG TUYỂN
        a.application_id, a.status, a.applied_at, a.cover_letter,
        
        -- Thông tin User
        u.full_name, u.email, u.phone, u.avatar,
        
        -- Thông tin Job
        j.title AS job_title,

        -- 2. THÔNG TIN CV
        c.cv_id, 
        c.title AS cv_title, 
        c.file_url AS pdf_url,
        c.summary,
        c.skills, 
        c.experience, 
        c.education, 
        c.certifications,
        c.meta_data
        
      FROM applications a
      JOIN jobs j ON a.job_id = j.job_id
      JOIN users u ON a.user_id = u.user_id
      JOIN cv c ON a.cv_id = c.cv_id
      
      -- KIỂM TRA QUYỀN
      JOIN company_members cm ON j.company_id = cm.company_id
      
      WHERE a.application_id = ? 
      AND cm.user_id = ? 
      AND cm.status = 'Active'
    `;

    const [rows] = await db.execute(sql, [application_id, userId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hồ sơ hoặc bạn không có quyền xem." });
    }

    const raw = rows[0];
    const parse = (data) => parseJSON(data); // Sử dụng helper ở trên

    // TÁCH BIỆT DỮ LIỆU TRẢ VỀ
    const responseData = {
      application_context: {
        id: raw.application_id,
        status: raw.status,
        applied_at: raw.applied_at,
        cover_letter: raw.cover_letter,
        job_title: raw.job_title,
        cv_id: raw.cv_id,
        candidate: {
          name: raw.full_name,
          email: raw.email,
          phone: raw.phone,
          avatar: raw.avatar,
        },
        pdf_url: raw.pdf_url,
      },
      cv_data: {
        personal_info: {
          fullName: raw.full_name,
          email: raw.email,
          phone: raw.phone,
          avatar: raw.avatar,
          summary: raw.summary,
          title: raw.cv_title,
          address: parse(raw.meta_data)?.address || "",
        },
        skills: parse(raw.skills),
        experiences: parse(raw.experience),
        educations: parse(raw.education),
        certifications: parse(raw.certifications),
        projects: [],
      },
    };

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Lỗi lấy chi tiết:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * =================================================================
 * 4. CẬP NHẬT TRẠNG THÁI (RECRUITER - APPROVE/REJECT)
 * =================================================================
 */
export const updateApplicationStatus = async (req, res) => {
  const userId = req.user.user_id;
  const { application_id } = req.params;
  const { status } = req.body;

  if (!VALID_APPLICATION_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    // 🔴 SỬA LỖI: Kiểm tra quyền qua company_members
    const verifySql = `
      SELECT 
        a.application_id, 
        a.email, 
        u.full_name, 
        j.title as job_title
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.job_id
      INNER JOIN users u ON a.user_id = u.user_id
      -- Check quyền
      INNER JOIN company_members cm ON j.company_id = cm.company_id
      WHERE a.application_id = ? 
      AND cm.user_id = ? 
      AND cm.status = 'Active'
    `;

    const [rows] = await db.execute(verifySql, [application_id, userId]);

    if (rows.length === 0)
      return res
        .status(403)
        .json({
          message: "Không tìm thấy đơn hoặc bạn không có quyền duyệt đơn này",
        });

    const appData = rows[0];

    // 2. Update Database
    await db.execute(
      "UPDATE applications SET status = ? WHERE application_id = ?",
      [status, application_id]
    );

    // 3. Phản hồi Client
    res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái: ${status}`,
    });

    // 4. Gửi email background
    if (status === "accepted" || status === "rejected") {
      sendResultEmail(
        appData.email,
        appData.full_name,
        appData.job_title,
        status
      ).catch((err) =>
        console.error("Lỗi gửi email kết quả (Background):", err)
      );
    }
  } catch (error) {
    console.error("[Application] Lỗi updateStatus:", error);
    if (!res.headersSent) res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
