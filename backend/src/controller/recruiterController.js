import db from "../config/db.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Cấu hình gửi mail (Thay bằng email thật của bạn)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_EMAIL@gmail.com",
    pass: "YOUR_APP_PASSWORD",
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
    // Lưu ý: MySQL datetime format 'YYYY-MM-DD HH:mm:ss'
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
// 🟢 API 2: XÁC THỰC OTP & GÁN CÔNG TY & NÂNG CẤP
// =======================================================
export const verifyAndUpgrade = async (req, res) => {
  // 1. Khởi tạo kết nối Transaction
  const connection = await db.getConnection();

  try {
    // Bắt đầu giao dịch (Mọi thay đổi chỉ được lưu khi commit)
    await connection.beginTransaction();

    const user_id = req.user.user_id; // Lấy ID user từ Token (Middleware auth)
    const { otp, company_name, company_email, company_address, industry_id } =
      req.body;

    // ---------------------------------------------------
    // BƯỚC 1: KIỂM TRA NGƯỜI DÙNG & OTP
    // ---------------------------------------------------
    const [users] = await connection.query(
      "SELECT otp_code, otp_expires_at, role FROM users WHERE user_id = ? FOR UPDATE",
      [user_id]
    );

    if (users.length === 0) {
      throw new Error("Người dùng không tồn tại.");
    }

    const user = users[0];

    // Kiểm tra User đã là Recruiter chưa?
    if (user.role === "recruiter") {
      throw new Error("Tài khoản này đã là Nhà tuyển dụng rồi.");
    }

    // Kiểm tra OTP có khớp không
    if (!user.otp_code || String(user.otp_code) !== String(otp)) {
      throw new Error("Mã OTP không chính xác.");
    }

    // Kiểm tra OTP còn hạn không
    const currentTime = new Date();
    const expireTime = new Date(user.otp_expires_at);
    if (currentTime > expireTime) {
      throw new Error("Mã OTP đã hết hạn. Vui lòng yêu cầu lại.");
    }

    // ---------------------------------------------------
    // BƯỚC 2: KIỂM TRA CÔNG TY (Tránh trùng lặp)
    // ---------------------------------------------------

    // Kiểm tra xem User này đã sở hữu công ty nào chưa?
    const [existingOwnCompany] = await connection.query(
      "SELECT company_id FROM companies WHERE user_id = ?",
      [user_id]
    );

    if (existingOwnCompany.length > 0) {
      // Nếu đã có công ty, ta chỉ update thông tin công ty đó
      const companyId = existingOwnCompany[0].company_id;
      await connection.query(
        `UPDATE companies 
         SET company_name = ?, contact_email = ?, address = ? 
         WHERE company_id = ?`,
        [company_name, company_email, company_address, companyId]
      );
    } else {
      // ---------------------------------------------------
      // BƯỚC 3: GÁN CÔNG TY CHO USER (TẠO MỚI)
      // ---------------------------------------------------

      // (Tùy chọn) Kiểm tra tên công ty đã tồn tại trong hệ thống chưa
      const [duplicateName] = await connection.query(
        "SELECT company_id FROM companies WHERE company_name = ?",
        [company_name]
      );

      if (duplicateName.length > 0) {
        throw new Error(
          `Công ty tên "${company_name}" đã tồn tại trong hệ thống.`
        );
      }

      // Tạo công ty mới và GÁN user_id làm chủ sở hữu
      await connection.query(
        `INSERT INTO companies (user_id, company_name, contact_email, address, industry_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          user_id,
          company_name,
          company_email,
          company_address,
          industry_id || null,
        ]
      );
    }

    // ---------------------------------------------------
    // BƯỚC 4: NÂNG CẤP ROLE USER -> RECRUITER
    // ---------------------------------------------------
    await connection.query(
      `UPDATE users 
       SET role = 'recruiter', 
           otp_code = NULL, 
           otp_expires_at = NULL 
       WHERE user_id = ?`,
      [user_id]
    );

    // ---------------------------------------------------
    // BƯỚC 5: HOÀN TẤT (COMMIT)
    // ---------------------------------------------------
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "🎉 Xác thực thành công! Bạn đã trở thành Nhà tuyển dụng.",
      data: {
        role: "recruiter",
        company: company_name,
      },
    });
  } catch (error) {
    // Nếu có bất kỳ lỗi nào, hoàn tác tất cả thay đổi DB
    await connection.rollback();
    console.error("❌ Lỗi Verify & Upgrade:", error.message);

    // Trả về lỗi cho Client
    return res.status(400).json({
      success: false,
      message: error.message || "Lỗi hệ thống khi xác thực.",
    });
  } finally {
    // Luôn giải phóng kết nối
    connection.release();
  }
};
