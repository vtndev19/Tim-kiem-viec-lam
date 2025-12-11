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
 * HELPER: GỬI THÔNG BÁO CHO RECRUITER (Khi có người ứng tuyển)
 * =================================================================
 */
const notifyRecruiters = async (io, jobId, applicationId, candidateName) => {
  try {
    // Tìm tất cả HR (Active) của công ty đang đăng Job này
    const findRecruitersSql = `
      SELECT cm.user_id, j.title AS job_title
      FROM jobs j
      JOIN company_members cm ON j.company_id = cm.company_id
      WHERE j.job_id = ? AND cm.status = 'Active'
    `;
    const [recruiters] = await db.execute(findRecruitersSql, [jobId]);

    if (recruiters.length === 0) return;

    const jobTitle = recruiters[0].job_title;
    const message = `Ứng viên ${candidateName} vừa nộp hồ sơ vào vị trí ${jobTitle}`;
    const createdAt = new Date();

    for (const rec of recruiters) {
      // 1. Lưu DB Notification
      await db.execute(
        "INSERT INTO notifications (user_id, type, reference_id, message, created_at) VALUES (?, 'application', ?, ?, ?)",
        [rec.user_id, applicationId, message, createdAt]
      );

      // 2. Bắn Socket Real-time
      if (io) {
        io.to(`room_user_${rec.user_id}`).emit("new_notification", {
          type: "application",
          message,
          job_title: jobTitle,
          application_id: applicationId,
          candidate_name: candidateName,
          created_at: createdAt,
          is_read: 0,
        });
      }
    }
  } catch (error) {
    console.error("[Notify Recruiter Error]:", error);
  }
};

/**
 * =================================================================
 * HELPER: GỬI THÔNG BÁO CHO CANDIDATE (Khi trạng thái hồ sơ thay đổi)
 * =================================================================
 */
const notifyCandidateStatusChange = async (
  io,
  applicationId,
  status,
  jobTitle,
  candidateId
) => {
  try {
    let message = "";
    if (status === "reviewed")
      message = `Hồ sơ ứng tuyển vị trí "${jobTitle}" của bạn đã được nhà tuyển dụng xem.`;
    else if (status === "accepted")
      message = `Chúc mừng! Hồ sơ vị trí "${jobTitle}" của bạn đã được CHẤP NHẬN. Vui lòng kiểm tra Email.`;
    else if (status === "rejected")
      message = `Rất tiếc, hồ sơ vị trí "${jobTitle}" của bạn chưa phù hợp lúc này.`;
    else return; // Pending không cần báo

    const createdAt = new Date();

    // 1. Lưu DB Notification cho Ứng viên
    await db.execute(
      "INSERT INTO notifications (user_id, type, reference_id, message, created_at) VALUES (?, 'status_update', ?, ?, ?)",
      [candidateId, applicationId, message, createdAt]
    );

    // 2. Bắn Socket tới Ứng viên
    if (io) {
      io.to(`room_user_${candidateId}`).emit("new_notification", {
        type: "status_update",
        message,
        job_title: jobTitle,
        application_id: applicationId,
        status: status,
        created_at: createdAt,
        is_read: 0,
      });
    }
  } catch (error) {
    console.error("[Notify Candidate Error]:", error);
  }
};

/**
 * =================================================================
 * 1. NỘP ĐƠN ỨNG TUYỂN (CANDIDATE)
 * - Logic: Candidate nộp đơn -> Email gửi về cho Recruiter/Công ty -> Bắn Notification
 * =================================================================
 */
export const applyJob = async (req, res) => {
  const userId = req.user?.user_id;
  const io = req.app.get("io"); // 🔥 Lấy socket io instance
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
      INSERT INTO applications (user_id, job_id, cv_id, email, phone, cover_letter, status, applied_at) 
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;
    const [result] = await db.execute(insertSql, [
      userId,
      job_id,
      cv_id,
      email,
      phone,
      cover_letter || "",
    ]);

    const newAppId = result.insertId; // Lấy ID vừa tạo

    // BƯỚC 2: Tăng bộ đếm trong bảng jobs
    const updateCountSql = `
      UPDATE jobs SET application_count = application_count + 1 WHERE job_id = ?
    `;
    await db.execute(updateCountSql, [job_id]);

    // BƯỚC 3: Phản hồi Client NGAY LẬP TỨC
    res.status(201).json({
      success: true,
      message: "Ứng tuyển thành công",
    });

    // BƯỚC 4: Xử lý Background (Email & Notification)
    (async () => {
      try {
        const infoSql = `
          SELECT 
            j.title, 
            c.contact_email as recruiter_email,
            u.full_name as user_name -- Tên ứng viên
          FROM jobs j
          JOIN companies c ON j.company_id = c.company_id
          JOIN users u ON u.user_id = ? -- Lấy tên user đang login
          WHERE j.job_id = ?
        `;
        const [jobData] = await db.execute(infoSql, [userId, job_id]);

        if (jobData.length > 0) {
          const info = jobData[0];

          // Task A: Gửi Email
          if (info.recruiter_email) {
            await sendApplicationEmails(
              { name: info.user_name, email, phone, coverLetter: cover_letter },
              { title: info.title },
              info.recruiter_email
            );
          }

          // Task B: Gửi Notification Real-time cho HR 🔥
          await notifyRecruiters(io, job_id, newAppId, info.user_name);
        }
      } catch (bgError) {
        console.error("[Background Task] Lỗi xử lý sau ứng tuyển:", bgError);
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
    // Check quyền: User phải là thành viên 'Active' của công ty sở hữu Job này
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
      return res.status(403).json({
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
    const parse = (data) => parseJSON(data);

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
 * - Logic: Cập nhật DB -> Gửi Mail -> Gửi Notification cho ứng viên
 * =================================================================
 */
export const updateApplicationStatus = async (req, res) => {
  const userId = req.user.user_id;
  const io = req.app.get("io"); // 🔥 Lấy socket io instance
  const { application_id } = req.params;
  const { status } = req.body;

  if (!VALID_APPLICATION_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    // 1. Kiểm tra quyền và lấy thông tin cần thiết
    const verifySql = `
      SELECT 
        a.application_id, 
        a.user_id AS candidate_id, -- Lấy ID ứng viên để bắn noti
        a.email, 
        u.full_name AS candidate_name, 
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
      return res.status(403).json({
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

    // 4. Background Task (Email & Notification)
    (async () => {
      // A. Gửi Email (nếu là Accepted/Rejected)
      if (status === "accepted" || status === "rejected") {
        sendResultEmail(
          appData.email,
          appData.candidate_name,
          appData.job_title,
          status
        ).catch((err) =>
          console.error("Lỗi gửi email kết quả (Background):", err)
        );
      }

      // B. Gửi Notification cho Ứng viên 🔥
      await notifyCandidateStatusChange(
        io,
        application_id,
        status,
        appData.job_title,
        appData.candidate_id
      );
    })();
  } catch (error) {
    console.error("[Application] Lỗi updateStatus:", error);
    if (!res.headersSent) res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
