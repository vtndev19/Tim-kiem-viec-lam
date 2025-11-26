import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không có token hoặc token không hợp lệ",
      });
    }

    const token = authHeader.split(" ")[1];

    // Giải mã JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn user vào request
    req.user = {
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
      full_name: decoded.full_name, // ✔ đã lấy tên người dùng
      name: decoded.full_name || null,
    };

    next();
  } catch (err) {
    console.error("Lỗi xác thực token:", err.message);
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};
