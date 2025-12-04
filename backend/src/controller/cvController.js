import db from "../configs/data.js"; // Pool MySQL

// --- HELPER FUNCTIONS (Đưa lên đầu để tránh lỗi ReferenceError) ---

// Hàm parse chung để chuyển đổi dữ liệu JSON từ DB sang Object
const parseCVData = (cv) => {
  const parseSafe = (jsonString) => {
    try {
      return typeof jsonString === "string"
        ? JSON.parse(jsonString)
        : jsonString;
    } catch (e) {
      return [];
    }
  };

  const parseMeta = (jsonString) => {
    try {
      return typeof jsonString === "string"
        ? JSON.parse(jsonString)
        : jsonString;
    } catch (e) {
      return {};
    }
  };

  return {
    ...cv,
    education: parseSafe(cv.education),
    experience: parseSafe(cv.experience),
    skills: parseSafe(cv.skills),
    certifications: parseSafe(cv.certifications),
    meta_data: parseMeta(cv.meta_data),
  };
};

/**
 * ✅ TẠO MỚI CV (Sử dụng Stored Procedure)
 */
export const saveCVBuilder = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res
        .status(401)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    const {
      title,
      summary,
      experience,
      education,
      skills,
      certifications,
      file_url,
      meta_data,
    } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Tiêu đề CV là bắt buộc" });
    }

    const formatJSON = (data) =>
      typeof data === "string" ? data : JSON.stringify(data || []);

    await db.execute(`CALL sp_create_user_cv(?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      user_id,
      title.trim(),
      summary?.trim() || "",
      formatJSON(experience),
      formatJSON(certifications),
      formatJSON(education),
      formatJSON(skills),
      file_url || null,
      typeof meta_data === "object"
        ? JSON.stringify(meta_data)
        : meta_data || "{}",
    ]);

    return res.status(201).json({
      success: true,
      message: "🎉 CV đã được lưu thành công!",
      data: { user_id, title },
    });
  } catch (err) {
    console.error("Error in saveCVBuilder:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi khi lưu CV", error: err.message });
  }
};

/**
 * ✅ LẤY DANH SÁCH CV CỦA USER
 */
export const getUserCV = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const [rows] = await db.execute(
      `SELECT * FROM cv WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );

    const cvList = rows.map((cv) => parseCVData(cv));

    return res.status(200).json({ success: true, data: cvList });
  } catch (err) {
    console.error("Lỗi lấy danh sách CV:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};

/**
 * ✅ CẬP NHẬT CV
 */
export const updateCV = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const cv_id = req.params.cv_id;

    if (!user_id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const [checkCV] = await db.execute(
      `SELECT user_id FROM cv WHERE cv_id = ?`,
      [cv_id]
    );
    if (checkCV.length === 0 || checkCV[0].user_id !== user_id) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền cập nhật" });
    }

    const {
      title,
      summary,
      experience,
      education,
      skills,
      certifications,
      file_url,
      meta_data,
    } = req.body;

    const formatJSON = (data) =>
      typeof data === "string" ? data : JSON.stringify(data || []);

    await db.execute(
      `UPDATE cv SET 
        title = ?, summary = ?, experience = ?, education = ?, skills = ?,
        certifications = ?, file_url = ?, meta_data = ?  
       WHERE cv_id = ? AND user_id = ?`,
      [
        title?.trim(),
        summary?.trim() || "",
        formatJSON(experience),
        formatJSON(education),
        formatJSON(skills),
        formatJSON(certifications),
        file_url || null,
        typeof meta_data === "object"
          ? JSON.stringify(meta_data)
          : meta_data || "{}",
        cv_id,
        user_id,
      ]
    );

    return res
      .status(200)
      .json({ success: true, message: "CV đã được cập nhật", data: { cv_id } });
  } catch (err) {
    console.error("Lỗi cập nhật CV:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};

/**
 * ✅ XÓA CV
 */
export const deleteCV = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const cv_id = req.params.cv_id;

    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const [checkCV] = await db.execute(
      `SELECT user_id FROM cv WHERE cv_id = ?`,
      [cv_id]
    );

    if (checkCV.length === 0 || checkCV[0].user_id !== user_id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await db.execute(`DELETE FROM cv WHERE cv_id = ? AND user_id = ?`, [
      cv_id,
      user_id,
    ]);

    return res.status(200).json({ success: true, message: "CV đã được xóa" });
  } catch (err) {
    console.error("Lỗi xóa CV:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * ✅ [PRIVATE] LẤY CHI TIẾT CV (Dành cho chủ sở hữu xem/sửa)
 */
export const getCVDetail = async (req, res) => {
  try {
    const cv_id = req.params.cv_id;
    const user_id = req.user?.user_id;

    if (!user_id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const [rows] = await db.execute(
      `SELECT * FROM cv WHERE cv_id = ? AND user_id = ?`,
      [cv_id, user_id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "CV không tồn tại" });
    }

    return res.status(200).json({
      success: true,
      data: parseCVData(rows[0]),
    });
  } catch (err) {
    console.error("Lỗi lấy chi tiết CV:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// =======================================================
// 6. [PUBLIC] XEM CHI TIẾT CV (KHÔNG CẦN AUTH)
// Dùng cho: Recruiter xem CV, Chia sẻ link CV
// =======================================================
export const getCVByIdPublic = async (req, res) => {
  try {
    // Lấy ID từ params (hỗ trợ cả /:id và /:cv_id)
    const cv_id = req.params.id || req.params.cv_id;

    // ⚠️ SQL AN TOÀN:
    // 1. KHÔNG check user_id (để ai có link cũng xem được)
    // 2. KHÔNG lấy address/avatar từ bảng users (vì bảng users của bạn không có cột này)
    // 3. Chỉ lấy các trường cơ bản từ users: full_name, email, phone
    const sql = `
      SELECT cv.*, users.full_name, users.email, users.phone 
      FROM cv 
      LEFT JOIN users ON cv.user_id = users.user_id
      WHERE cv.cv_id = ?
    `;

    const [rows] = await db.execute(sql, [cv_id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "CV không tồn tại hoặc đã bị xóa" });
    }

    const cvData = rows[0];
    const parsedData = parseCVData(cvData);

    // Bổ sung thông tin cá nhân cho Frontend hiển thị:
    // Logic: Ưu tiên dữ liệu trong meta_data (do người dùng nhập trong CV Builder).
    // Nếu thiếu thì mới lấy fallback từ tài khoản User (full_name, email...).
    const metaPersonalInfo = parsedData.meta_data?.personalInfo || {};

    parsedData.personalInfo = {
      fullName: metaPersonalInfo.fullName || cvData.full_name,
      email: metaPersonalInfo.email || cvData.email,
      phone: metaPersonalInfo.phone || cvData.phone,
      address: metaPersonalInfo.address || "", // Lấy từ meta_data của CV
      avatar: metaPersonalInfo.avatar || "", // Lấy từ meta_data của CV
      title: metaPersonalInfo.title || parsedData.title, // Job title trong CV
    };

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (err) {
    console.error("Lỗi getCVByIdPublic:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};
