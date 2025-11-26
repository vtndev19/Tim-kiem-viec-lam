// backend/src/middleware/auth.js
import jwt from "jsonwebtoken";

/**
 * ✅ Middleware xác thực JWT
 * - Kiểm tra token trong header Authorization
 * - Giải mã token để lấy thông tin user
 * - Gắn thông tin user vào req.user cho route phía sau sử dụng
 */
export const verifyToken = (req, res, next) => {
  try {
    // 🔑 Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Không có token hoặc token không hợp lệ" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn thông tin user vào req (ví dụ: user_id, email, role)
    req.user = decoded;

    next();
  } catch (error) {
    console.error("❌ Lỗi xác thực token:", error.message);
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
