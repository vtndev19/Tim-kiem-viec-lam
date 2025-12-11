import db from "../configs/data.js";

// Lấy danh sách thông báo của User (HR/Candidate)
export const getNotifications = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    const [rows] = await db.execute(sql, [userId]);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi getNotifications:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Đánh dấu thông báo là đã đọc
export const markAsRead = async (req, res) => {
  const userId = req.user.user_id;
  const { notification_id } = req.body; // Hoặc lấy từ params tuỳ thiết kế

  try {
    // Nếu gửi notification_id = 'all' thì đánh dấu tất cả
    if (notification_id === "all") {
      await db.execute(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
        [userId]
      );
    } else {
      await db.execute(
        "UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?",
        [notification_id, userId]
      );
    }

    res.status(200).json({ success: true, message: "Đã cập nhật trạng thái" });
  } catch (error) {
    console.error("Lỗi markAsRead:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
