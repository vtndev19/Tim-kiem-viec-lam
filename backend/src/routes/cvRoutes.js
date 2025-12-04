import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  saveCVBuilder,
  getUserCV,
  updateCV,
  deleteCV,
  getCVDetail,
  getCVByIdPublic,
} from "../controller/cvController.js";

const router = express.Router();

// ==========================================
// 1. CÁC ROUTE TĨNH (Specific Routes) - Đặt lên đầu
// ==========================================
// (Hiện tại bạn chưa có route tĩnh nào khác ngoài root '/', nhưng giữ thói quen này rất tốt)
router.get("/", verifyToken, getUserCV); // Lấy danh sách

// ==========================================
// 2. CÁC ROUTE ĐỘNG (Dynamic Routes) - Đặt phía dưới
// ==========================================
// ✅ Route này sẽ bắt tất cả các ID (ví dụ: 2023, abc-xyz)
router.get("/:cv_id", verifyToken, getCVDetail);
// Xem chi tiết 1 CV bất kỳ theo ID (Dành cho Recruiter hoặc Share link)
router.get("/view/:id", getCVByIdPublic);

router.post("/", verifyToken, saveCVBuilder);
router.put("/:cv_id", verifyToken, updateCV);
router.delete("/:cv_id", verifyToken, deleteCV);

// ==========================================
// 3. LEGACY
// ==========================================
router.post("/save", verifyToken, saveCVBuilder);

export default router;
