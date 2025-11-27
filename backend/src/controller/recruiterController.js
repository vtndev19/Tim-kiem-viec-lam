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
// 🟢 API 2: XÁC THỰC OTP & GÁN CÔNG TY & NÂNG CẤP
// =======================================================
export const verifyAndUpgrade = async (req, res) => {
  // 1. Khởi tạo kết nối Transaction
  const connection = await db.getConnection();

  try {
    // Bắt đầu giao dịch
    await connection.beginTransaction();

    const user_id = req.user.user_id;
    // 📌 Lấy industry_input thay vì industry_id
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

    if (user.role === "recruiter")
      throw new Error("Tài khoản này đã là Nhà tuyển dụng rồi.");

    if (!user.otp_code || String(user.otp_code) !== String(otp))
      throw new Error("Mã OTP không chính xác.");

    const currentTime = new Date();
    const expireTime = new Date(user.otp_expires_at);
    if (currentTime > expireTime)
      throw new Error("Mã OTP đã hết hạn. Vui lòng yêu cầu lại.");

    // ---------------------------------------------------
    // 🔥 BƯỚC 2: XỬ LÝ NGÀNH NGHỀ (Find or Create Logic)
    // ---------------------------------------------------
    let finalIndustryId = null;

    if (industry_input) {
      // Kiểm tra: Nếu input là số => Đã là ID
      if (!isNaN(industry_input)) {
        finalIndustryId = industry_input;
      } else {
        // Nếu input là chuỗi => Tên ngành mới
        const sanitizedName = industry_input.trim();

        // Check xem tên này đã có trong DB chưa (tránh tạo trùng)
        const [existingInd] = await connection.query(
          "SELECT industry_id FROM industries WHERE name = ?",
          [sanitizedName]
        );

        if (existingInd.length > 0) {
          // Có rồi -> Lấy ID
          finalIndustryId = existingInd[0].industry_id;
        } else {
          // Chưa có -> Tạo mới -> Lấy ID vừa tạo
          const [newIndResult] = await connection.query(
            "INSERT INTO industries (name) VALUES (?)",
            [sanitizedName]
          );
          finalIndustryId = newIndResult.insertId;
        }
      }
    }

    // ---------------------------------------------------
    // BƯỚC 3: KIỂM TRA VÀ TẠO/CẬP NHẬT CÔNG TY
    // ---------------------------------------------------

    // Kiểm tra User đã sở hữu công ty nào chưa
    const [existingOwnCompany] = await connection.query(
      "SELECT company_id FROM companies WHERE user_id = ?",
      [user_id]
    );

    if (existingOwnCompany.length > 0) {
      // Đã có -> Update thông tin + Ngành nghề mới
      const companyId = existingOwnCompany[0].company_id;
      await connection.query(
        `UPDATE companies 
         SET company_name = ?, contact_email = ?, address = ?, industry_id = ? 
         WHERE company_id = ?`,
        [
          company_name,
          company_email,
          company_address,
          finalIndustryId,
          companyId,
        ]
      );
    } else {
      // Chưa có -> Tạo mới
      // Check trùng tên công ty
      const [duplicateName] = await connection.query(
        "SELECT company_id FROM companies WHERE company_name = ?",
        [company_name]
      );

      if (duplicateName.length > 0) {
        throw new Error(
          `Công ty tên "${company_name}" đã tồn tại trong hệ thống.`
        );
      }

      await connection.query(
        `INSERT INTO companies (user_id, company_name, contact_email, address, industry_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          user_id,
          company_name,
          company_email,
          company_address,
          finalIndustryId, // ID ngành (cũ hoặc mới tạo)
        ]
      );
    }

    // ---------------------------------------------------
    // BƯỚC 4: NÂNG CẤP ROLE USER
    // ---------------------------------------------------
    await connection.query(
      `UPDATE users 
       SET role = 'recruiter', otp_code = NULL, otp_expires_at = NULL 
       WHERE user_id = ?`,
      [user_id]
    );

    // ---------------------------------------------------
    // BƯỚC 5: COMMIT GIAO DỊCH
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
