import db from "../configs/data.js"; // Pool MySQL

export const saveCVBuilder = async (req, res) => {
  try {
    console.log("🔧 saveCVBuilder received request");
    console.log(
      "📦 Request body:",
      JSON.stringify(req.body, null, 2).substring(0, 500)
    );
    console.log("👤 User from JWT:", req.user);

    const user_id = req.user?.user_id; // lấy từ JWT middleware

    if (!user_id) {
      console.log("❌ No user_id from JWT");
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    const {
      title,
      summary,
      personalInfo,
      education,
      experience,
      skills,
      style,
    } = req.body;

    // Validate dữ liệu bắt buộc
    if (!title || !personalInfo?.fullName) {
      console.log("❌ Missing required fields:", { title, personalInfo });
      return res.status(400).json({
        success: false,
        message: "Tiêu đề và tên đầy đủ là bắt buộc",
      });
    }

    console.log("✅ Validation passed. Saving to DB...");

    // Lưu vào bảng cv (schema đơn giản)
    const [result] = await db.execute(
      `INSERT INTO cv (user_id, title, summary, experience, certifications, education, skills, file_url, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id,
        title.trim(),
        summary?.trim() || "",
        JSON.stringify(experience || []),
        JSON.stringify([]), // certifications
        JSON.stringify(education || []),
        JSON.stringify(skills || []),
        null, // file_url
      ]
    );

    const cv_id = result.insertId;
    console.log(`✅ CV created with ID: ${cv_id} for user_id: ${user_id}`);

    return res.status(201).json({
      success: true,
      message: "🎉 CV đã được lưu thành công!",
      data: {
        cv_id,
        user_id,
        title,
      },
    });
  } catch (err) {
    console.error("❌ Error in saveCVBuilder:", err);
    console.error("Stack:", err.stack);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lưu CV",
      error: err.message,
    });
  }
};

/**
 * ✅ Lấy danh sách CV của user hiện tại
 */
export const getUserCV = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    const [rows] = await db.execute(
      `SELECT * FROM cv WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );

    // Parse JSON data từ database
    const cvList = rows.map((cv) => ({
      ...cv,
      education: cv.education ? JSON.parse(cv.education) : [],
      experience: cv.experience ? JSON.parse(cv.experience) : [],
      skills: cv.skills ? JSON.parse(cv.skills) : [],
      certifications: cv.certifications ? JSON.parse(cv.certifications) : [],
    }));

    return res.status(200).json({
      success: true,
      data: cvList,
    });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách CV:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách CV",
      error: err.message,
    });
  }
};

/**
 * ✅ Cập nhật CV
 */
export const updateCV = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const cv_id = req.params.cv_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    // Kiểm tra CV thuộc về user
    const [checkCV] = await db.execute(
      `SELECT user_id FROM cv WHERE cv_id = ?`,
      [cv_id]
    );

    if (checkCV.length === 0 || checkCV[0].user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật CV này",
      });
    }

    const {
      title,
      summary,
      personalInfo,
      education,
      experience,
      skills,
      style,
    } = req.body;

    if (!title || !personalInfo?.fullName) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề và tên đầy đủ là bắt buộc",
      });
    }

    // Cập nhật CV
    await db.execute(
      `UPDATE cv SET 
        title = ?, 
        summary = ?, 
        experience = ?, 
        education = ?, 
        skills = ? 
       WHERE cv_id = ? AND user_id = ?`,
      [
        title.trim(),
        summary?.trim() || "",
        JSON.stringify(experience || []),
        JSON.stringify(education || []),
        JSON.stringify(skills || []),
        cv_id,
        user_id,
      ]
    );

    console.log(`✅ CV updated: ${cv_id}`);

    return res.status(200).json({
      success: true,
      message: "CV đã được cập nhật",
      data: { cv_id },
    });
  } catch (err) {
    console.error("❌ Lỗi cập nhật CV:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật CV",
      error: err.message,
    });
  }
};

/**
 * ✅ Xóa CV
 */
export const deleteCV = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const cv_id = req.params.cv_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    // Kiểm tra CV thuộc về user
    const [checkCV] = await db.execute(
      `SELECT user_id FROM cv WHERE cv_id = ?`,
      [cv_id]
    );

    if (checkCV.length === 0 || checkCV[0].user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa CV này",
      });
    }

    // Xóa CV
    await db.execute(`DELETE FROM cv WHERE cv_id = ? AND user_id = ?`, [
      cv_id,
      user_id,
    ]);

    console.log(`✅ CV deleted: ${cv_id}`);

    return res.status(200).json({
      success: true,
      message: "CV đã được xóa",
    });
  } catch (err) {
    console.error("❌ Lỗi xóa CV:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa CV",
      error: err.message,
    });
  }
};

/**
 * ✅ Legacy endpoint - giữ lại cho tương thích
 */
export const saveCV = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    const {
      title,
      summary,
      personalInfo,
      education,
      experience,
      skills,
      style,
    } = req.body;

    if (!title || !personalInfo?.fullName) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề và tên đầy đủ là bắt buộc",
      });
    }

    // Lưu vào bảng cv
    const [result] = await db.execute(
      `INSERT INTO cv (user_id, title, summary, experience, certifications, education, skills, file_url, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id,
        title.trim(),
        summary?.trim() || "",
        JSON.stringify(experience || []),
        JSON.stringify([]),
        JSON.stringify(education || []),
        JSON.stringify(skills || []),
        null,
      ]
    );

    const cv_id = result.insertId;
    console.log(`✅ CV saved with ID: ${cv_id} for user_id: ${user_id}`);

    return res.status(201).json({
      success: true,
      message: "CV đã được lưu",
      data: {
        cv_id,
        user_id,
        title,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi lưu CV:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lưu CV",
      error: err.message,
    });
  }
};
