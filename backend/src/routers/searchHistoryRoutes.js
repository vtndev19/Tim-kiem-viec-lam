import express from "express";
import moment from "moment";
import db from "../configs/data.js";
import { verifyToken } from "../middleware/auth.js"; // ✅ Middleware xác thực

const router = express.Router();

/**
 * ✅ API: POST /api/search-history
 * Mô tả: Lưu lịch sử tìm kiếm của người dùng (chỉ khi đã đăng nhập)
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id; // 🧩 Lấy user_id từ token
    const { city, industry, keyword } = req.body;

    const searchDate = moment().format("YYYY-MM-DD HH:mm:ss");

    // ✅ Ghi vào bảng search_history
    await db.query(
      `INSERT INTO search_history (user_id, city, industry, keyword, search_date)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, city || null, industry || null, keyword || null, searchDate]
    );

    console.log(`✅ Đã ghi lịch sử tìm kiếm của user_id=${userId}`);
    res.json({ message: "Đã lưu lịch sử tìm kiếm" });
  } catch (error) {
    console.error("Lỗi ghi lịch sử tìm kiếm:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

export default router;
