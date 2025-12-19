import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// KIỂM TRA MÔI TRƯỜNG NGAY LẬP TỨC
if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  console.error(
    "❌ LỖI: Chưa cấu hình MAIL_USER hoặc MAIL_PASS trong file .env"
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Gửi email khi Ứng viên nộp đơn (Apply)
 * @param {Object} applicant - { name, email, phone, coverLetter }
 * @param {Object} job - { title }
 * @param {string} recruiterEmail - Email của HR (nếu có)
 */
export const sendApplicationEmails = async (applicant, job, recruiterEmail) => {
  // 🔥 DEBUG LOG: Kiểm tra xem email từ Form có truyền vào đây không
  console.log("--------------------------------------------------");
  console.log(`[EmailService] Bắt đầu gửi mail ứng tuyển...`);
  console.log(`Creating email for Candidate: ${applicant.email}`); // <-- Check dòng này trong Terminal
  console.log(`Creating email for Recruiter: ${recruiterEmail}`);
  console.log("--------------------------------------------------");

  try {
    // 1. Gửi mail xác nhận cho Ứng viên (Người nhập Form)
    await transporter.sendMail({
      from: `"Job Finder System" <${process.env.MAIL_USER}>`, // SỬA: Phải trùng với email đăng nhập
      to: applicant.email, // Đây là email lấy từ Form
      subject: `[Job Finder] Ứng tuyển thành công: ${job.title}`,
      html: `
        <h3>Xin chào ${applicant.name},</h3>
        <p>Hệ thống xác nhận bạn vừa ứng tuyển vào vị trí <b>${job.title}</b>.</p>
        <p>Hồ sơ của bạn đang ở trạng thái: <b>Pending (Chờ duyệt)</b>.</p>
        <p>Chúng tôi sẽ thông báo ngay khi có kết quả.</p>
        <br/>
        <p>Trân trọng,</p>
        <p>Đội ngũ Job Finder</p>
      `,
    });
    console.log(`✅ Đã gửi mail xác nhận cho ứng viên: ${applicant.email}`);

    // 2. Gửi mail thông báo cho Nhà tuyển dụng (nếu có email HR)
    if (recruiterEmail) {
      await transporter.sendMail({
        from: `"Job Finder System" <${process.env.MAIL_USER}>`,
        to: recruiterEmail,
        subject: `[Ứng viên mới] ${job.title} - ${applicant.name}`,
        html: `
          <h3>Bạn nhận được hồ sơ ứng tuyển mới!</h3>
          <ul>
            <li><b>Vị trí:</b> ${job.title}</li>
            <li><b>Ứng viên:</b> ${applicant.name}</li>
            <li><b>Email liên hệ:</b> ${applicant.email}</li>
            <li><b>SĐT:</b> ${applicant.phone}</li>
            <li><b>Thư giới thiệu:</b> <br/> ${
              applicant.coverLetter || "Không có"
            }</li>
          </ul>
          <p>Vui lòng đăng nhập vào hệ thống quản trị để xem CV chi tiết.</p>
        `,
      });
      console.log(`✅ Đã gửi mail thông báo cho HR: ${recruiterEmail}`);
    }

    return true;
  } catch (error) {
    console.error("❌ Lỗi gửi email ứng tuyển:", error);
    return false;
  }
};

/**
 * Gửi email thông báo kết quả (Accept/Reject)
 */
export const sendResultEmail = async (email, name, jobTitle, status) => {
  console.log(
    `[EmailService] Chuẩn bị gửi kết quả tới: ${email} - Status: ${status}`
  );

  try {
    let subject = "";
    let htmlContent = "";

    // Nội dung Email
    if (status === "accepted") {
      subject = `[Job Finder] CHÚC MỪNG: Bạn đã trúng tuyển vị trí ${jobTitle}`;
      htmlContent = `
        <h3>Xin chào ${name},</h3>
        <p>Chúng tôi vui mừng thông báo: Hồ sơ vị trí <b>${jobTitle}</b> của bạn đã được <b>CHẤP NHẬN</b>.</p>
        <p>Nhà tuyển dụng sẽ sớm liên hệ chi tiết qua SĐT hoặc Email này.</p>
        
      `;
    } else if (status === "rejected") {
      subject = `[Job Finder] Thông báo về hồ sơ ứng tuyển - ${jobTitle}`;
      htmlContent = `
        <h3>Xin chào ${name},</h3>
        <p>Cảm ơn bạn đã quan tâm đến vị trí <b>${jobTitle}</b>.</p>
        <p>Tuy nhiên, nhà tuyển dụng đánh giá hồ sơ của bạn chưa phù hợp vào lúc này.</p>
        <p>Chúc bạn sớm tìm được cơ hội mới tốt hơn.</p>
      `;
    } else {
      return false;
    }

    // Gửi email
    await transporter.sendMail({
      from: `"Job Finder System" <${process.env.MAIL_USER}>`, // SỬA
      to: email, // Email lấy từ Database
      subject: subject,
      html: htmlContent,
    });

    console.log(`✅ Đã gửi mail kết quả thành công tới: ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Lỗi gửi email kết quả:", error);
    return false;
  }
};
