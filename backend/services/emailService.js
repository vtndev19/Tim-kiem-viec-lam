import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Cấu hình Transporter (Dùng Gmail làm ví dụ)
// Lưu ý: Bạn cần lấy "App Password" từ Google Account chứ không phải pass đăng nhập thường
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // Email của bạn (vd: jobfinder@gmail.com)
    pass: process.env.MAIL_PASS, // Mật khẩu ứng dụng (App Password)
  },
});

export const sendApplicationEmails = async (applicant, job, recruiterEmail) => {
  try {
    // 1. Gửi mail xác nhận cho Ứng viên
    await transporter.sendMail({
      from: '"Job Finder System" <no-reply@jobfinder.com>',
      to: applicant.email,
      subject: `[Job Finder] Ứng tuyển thành công: ${job.title}`,
      html: `
        <h3>Xin chào ${applicant.name},</h3>
        <p>Bạn đã ứng tuyển thành công vào vị trí <b>${job.title}</b>.</p>
        <p>Nhà tuyển dụng sẽ sớm xem hồ sơ của bạn.</p>
        <p>Chúc bạn may mắn!</p>
      `,
    });

    // 2. Gửi mail thông báo cho Nhà tuyển dụng
    if (recruiterEmail) {
      await transporter.sendMail({
        from: '"Job Finder System" <no-reply@jobfinder.com>',
        to: recruiterEmail,
        subject: `[Ứng viên mới] ${job.title} - ${applicant.name}`,
        html: `
          <h3>Bạn nhận được hồ sơ ứng tuyển mới!</h3>
          <ul>
            <li><b>Vị trí:</b> ${job.title}</li>
            <li><b>Ứng viên:</b> ${applicant.name}</li>
            <li><b>Email:</b> ${applicant.email}</li>
            <li><b>SĐT:</b> ${applicant.phone}</li>
            <li><b>Thư giới thiệu:</b> <br/> ${
              applicant.coverLetter || "Không có"
            }</li>
          </ul>
          <p>Vui lòng đăng nhập vào hệ thống Job Finder để xem chi tiết CV.</p>
        `,
      });
    }
    return true;
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    return false; // Không return lỗi để tránh crash luồng chính, chỉ log lại
  }
};
/**
 * Gửi email thông báo kết quả phỏng vấn (Duyệt/Từ chối)
 * @param {string} email - Email ứng viên
 * @param {string} name - Tên ứng viên
 * @param {string} jobTitle - Tên công việc
 * @param {string} status - Trạng thái mới ('accepted' hoặc 'rejected')
 */
export const sendResultEmail = async (email, name, jobTitle, status) => {
  console.log(
    `[EmailService] Preparing result email for ${email} - Status: ${status}`
  );

  try {
    let subject = "";
    let htmlContent = "";

    if (status === "accepted") {
      subject = `[Job Finder] Chúc mừng: Hồ sơ của bạn đã được duyệt - ${jobTitle}`;
      htmlContent = `
        <h3>Xin chào ${name},</h3>
        <p>Chúng tôi vui mừng thông báo rằng hồ sơ ứng tuyển của bạn cho vị trí <b>${jobTitle}</b> đã được nhà tuyển dụng <b>CHẤP NHẬN</b>.</p>
        <p>Nhà tuyển dụng sẽ sớm liên hệ với bạn qua email hoặc số điện thoại để trao đổi về các bước tiếp theo.</p>
        <p>Vui lòng chuẩn bị sẵn sàng và kiểm tra điện thoại thường xuyên.</p>
        <p>Trân trọng,</p>
        <p>Đội ngũ Job Finder</p>
      `;
    } else if (status === "rejected") {
      subject = `[Job Finder] Thông báo kết quả ứng tuyển - ${jobTitle}`;
      htmlContent = `
        <h3>Xin chào ${name},</h3>
        <p>Cảm ơn bạn đã dành thời gian quan tâm và ứng tuyển vào vị trí <b>${jobTitle}</b>.</p>
        <p>Sau khi xem xét kỹ lưỡng hồ sơ, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu hiện tại của vị trí này.</p>
        <p>Hồ sơ của bạn sẽ được lưu lại trong cơ sở dữ liệu của chúng tôi cho các cơ hội phù hợp trong tương lai.</p>
        <p>Chúc bạn sớm tìm được công việc như ý.</p>
        <p>Trân trọng,</p>
        <p>Đội ngũ Job Finder</p>
      `;
    } else {
      console.warn(`[EmailService] Invalid status for result email: ${status}`);
      return false;
    }

    // Gửi email
    await transporter.sendMail({
      from: '"Job Finder System" <no-reply@jobfinder.com>',
      to: email,
      subject: subject,
      html: htmlContent,
    });

    console.log(
      `[EmailService] Result auto email sent successfully to ${email}`
    );
    return true;
  } catch (error) {
    console.error("[EmailService] Error sending result email:", error);
    return false;
  }
};
