import Groq from "groq-sdk";
import dotenv from "dotenv";

// Nạp biến môi trường (nếu chưa được nạp ở file chính)
dotenv.config();

// Khởi tạo Groq với API Key từ file .env
const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY });

// Thêm từ khóa 'export' vào trước hàm để xuất khẩu nó
export const handleChatGroq = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Tin nhắn trống" });
    }

    // Gọi API Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Bạn là một trợ lý ảo thông minh chuyên hỗ trợ về tìm kiếm việc làm và tư vấn sự nghiệp.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    // Lấy nội dung phản hồi
    const botReply = chatCompletion.choices[0]?.message?.content || "";

    // Trả về theo cấu trúc React của bạn mong muốn
    return res.status(200).json({
      success: true,
      data: {
        reply: botReply,
      },
    });
  } catch (error) {
    console.error("Groq API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi kết nối với Groq AI",
      error: error.message,
    });
  }
};

// Xóa dòng module.exports cũ đi
