import express from "express";
import {
  getNotifications,
  markAsRead,
} from "../controller/notificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Giả sử bạn có middleware này

const router = express.Router();

// Tất cả các route này đều yêu cầu đăng nhập
router.use(verifyToken);

// GET /api/notifications - Lấy danh sách
router.get("/", getNotifications);

// PUT /api/notifications/read - Đánh dấu đã đọc
router.put("/read", markAsRead);

export default router;
