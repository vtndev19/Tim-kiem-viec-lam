import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { recommendJobs } from "../controller/recommendationController.js";

const router = express.Router();

// ==========================================
// ROUTE GỢI Ý VIỆC LÀM
// ==========================================

// Method: GET
// URL Đầy đủ: /api/recommendations (Nếu khai báo ở server.js như bên dưới)
// Chức năng: Lấy danh sách việc làm gợi ý cho user đang đăng nhập
router.get("/", verifyToken, recommendJobs);

export default router;
