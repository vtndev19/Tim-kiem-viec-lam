import db from "../configs/data.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Cấu hình gửi mail (Thay bằng email thật của bạn)
// Cấu hình gửi mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "viettienpro198@gmail.com", // Email thật của bạn
    pass: "ztrj flhm chhu heym", // 👈 Dán 16 ký tự App Password vào đây (KHÔNG PHẢI PASS GMAIL)
  },
});
// =======================================================
// 🟢 API 1: GỬI OTP XÁC THỰC (Đến email công ty)
// =======================================================
export const sendRecruiterOtp = async (req, res) => {
  try {
    const { company_email } = req.body;
    const user_id = req.user.user_id; // Lấy từ Token

    if (!company_email) {
      return res.status(400).json({ message: "Vui lòng nhập email công ty." });
    }

    // 1. Tạo OTP 6 số ngẫu nhiên
    const otp = crypto.randomInt(100000, 999999).toString();

    // 2. Set thời gian hết hạn (Hiện tại + 5 phút)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 3. Cập nhật OTP vào bảng users
    await db.query(
      "UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE user_id = ?",
      [otp, expiresAt, user_id]
    );

    // 4. Gửi Email
    const mailOptions = {
      from: '"Job Finder Verify" <no-reply@jobfinder.com>',
      to: company_email,
      subject: "Mã OTP xác thực Nhà Tuyển Dụng",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Xin chào,</h2>
          <p>Bạn đang yêu cầu nâng cấp tài khoản lên <b>Nhà tuyển dụng</b>.</p>
          <p>Mã xác thực của bạn là:</p>
          <h1 style="color: #2c3e50; letter-spacing: 5px;">${otp}</h1>
          <p>Mã này sẽ hết hạn sau 5 phút.</p>
          <hr/>
          <small>Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: `Mã OTP đã được gửi đến ${company_email}`,
    });
  } catch (error) {
    console.error("❌ Lỗi gửi OTP:", error);
    return res.status(500).json({ message: "Lỗi server khi gửi email." });
  }
};

// =======================================================
// 🟢 API 2: XÁC THỰC OTP & GÁN CÔNG TY (LOGIC MỚI)
// =======================================================
export const verifyAndUpgrade = async (req, res) => {
  const connection = await db.getConnection();

  try {
    // Bắt đầu giao dịch (Transaction)
    await connection.beginTransaction();

    const user_id = req.user.user_id;
    const {
      otp,
      company_name,
      company_email,
      company_address,
      industry_input,
    } = req.body;

    // ---------------------------------------------------
    // BƯỚC 1: KIỂM TRA NGƯỜI DÙNG & OTP
    // ---------------------------------------------------
    const [users] = await connection.query(
      "SELECT otp_code, otp_expires_at, role FROM users WHERE user_id = ? FOR UPDATE",
      [user_id]
    );

    if (users.length === 0) throw new Error("Người dùng không tồn tại.");
    const user = users[0];

    // Kiểm tra xem user này đã tham gia công ty nào chưa (trong bảng company_members)
    // Nếu bạn muốn 1 người chỉ làm cho 1 công ty thì giữ đoạn này.
    const [existingMember] = await connection.query(
      "SELECT id FROM company_members WHERE user_id = ?",
      [user_id]
    );

    if (existingMember.length > 0) {
      throw new Error("Bạn đã là thành viên của một công ty khác rồi.");
    }

    // Check OTP
    if (!user.otp_code || String(user.otp_code) !== String(otp))
      throw new Error("Mã OTP không chính xác.");

    const currentTime = new Date();
    const expireTime = new Date(user.otp_expires_at);
    if (currentTime > expireTime)
      throw new Error("Mã OTP đã hết hạn. Vui lòng yêu cầu lại.");

    // ---------------------------------------------------
    // BƯỚC 2: XỬ LÝ NGÀNH NGHỀ (Industry)
    // ---------------------------------------------------
    let finalIndustryId = null;

    if (industry_input) {
      if (!isNaN(industry_input)) {
        finalIndustryId = industry_input; // Nếu gửi lên ID
      } else {
        const sanitizedName = industry_input.trim();
        // Tìm xem ngành có chưa
        const [existingInd] = await connection.query(
          "SELECT industry_id FROM industries WHERE name = ?",
          [sanitizedName]
        );

        if (existingInd.length > 0) {
          finalIndustryId = existingInd[0].industry_id;
        } else {
          // Tạo ngành mới
          const [newIndResult] = await connection.query(
            "INSERT INTO industries (name) VALUES (?)",
            [sanitizedName]
          );
          finalIndustryId = newIndResult.insertId;
        }
      }
    }

    // ---------------------------------------------------
    // 🔥 BƯỚC 3: XỬ LÝ CÔNG TY (FIND OR CREATE)
    // ---------------------------------------------------
    const normalizedCompanyName = company_name.trim();

    // Tìm xem công ty tên này đã có chưa?
    const [existingCompany] = await connection.query(
      "SELECT company_id FROM companies WHERE company_name = ?",
      [normalizedCompanyName]
    );

    let targetCompanyId = null;
    let userRoleInCompany = "Staff"; // Mặc định là nhân viên
    let isNewCompany = false;

    if (existingCompany.length > 0) {
      // === TRƯỜNG HỢP A: CÔNG TY ĐÃ TỒN TẠI ===
      // User tham gia vào công ty đã có -> Role: Staff
      targetCompanyId = existingCompany[0].company_id;
      userRoleInCompany = "Staff";
    } else {
      // === TRƯỜNG HỢP B: CÔNG TY MỚI ===
      // Tạo công ty mới -> Role: Manager
      const [createResult] = await connection.query(
        `INSERT INTO companies (company_name, contact_email, address, industry_id) 
         VALUES (?, ?, ?, ?)`,
        [normalizedCompanyName, company_email, company_address, finalIndustryId]
      );
      targetCompanyId = createResult.insertId;
      userRoleInCompany = "Manager";
      isNewCompany = true;
    }

    // ---------------------------------------------------
    // BƯỚC 4: THÊM USER VÀO BẢNG COMPANY_MEMBERS
    // ---------------------------------------------------
    // Dùng INSERT IGNORE để nếu lỡ click đúp không bị lỗi
    await connection.query(
      `INSERT INTO company_members (company_id, user_id, role, status)
       VALUES (?, ?, ?, 'Active') 
       ON DUPLICATE KEY UPDATE role = role`, // Nếu trùng thì giữ nguyên
      [targetCompanyId, user_id, userRoleInCompany]
    );

    // ---------------------------------------------------
    // BƯỚC 5: NÂNG CẤP ROLE USER TRONG HỆ THỐNG
    // ---------------------------------------------------
    await connection.query(
      `UPDATE users 
       SET role = 'recruiter', otp_code = NULL, otp_expires_at = NULL 
       WHERE user_id = ?`,
      [user_id]
    );

    // Commit Transaction (Lưu thay đổi)
    await connection.commit();

    // Custom thông báo
    const msg = isNewCompany
      ? "Tạo công ty thành công! Bạn là Quản lý (Manager)."
      : "Gia nhập công ty thành công! Bạn là Nhân viên (Staff).";

    return res.status(200).json({
      success: true,
      message: msg,
      data: {
        role: "recruiter",
        company_role: userRoleInCompany,
        company: normalizedCompanyName,
      },
    });
  } catch (error) {
    // Nếu có lỗi, hoàn tác mọi thay đổi DB
    await connection.rollback();
    console.error("❌ Lỗi Verify & Upgrade:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi xác thực.",
    });
  } finally {
    connection.release();
  }
};
