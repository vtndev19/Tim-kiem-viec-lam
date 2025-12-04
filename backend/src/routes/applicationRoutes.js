import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  applyJob,
  getJobApplicants,
  getApplicationDetail, // ⚠️ Quan trọng: Đã thêm import này
  updateApplicationStatus,
} from "../controller/applicationController.js";

const router = express.Router();

// ============================================================
// ROUTE DÀNH CHO ỨNG VIÊN (CANDIDATE)
// ============================================================

// 1. Nộp đơn ứng tuyển
// POST /api/applications/apply
router.post("/apply", verifyToken, applyJob);

// ============================================================
// ROUTE DÀNH CHO NHÀ TUYỂN DỤNG (RECRUITER)
// ============================================================

// 2. Xem danh sách tóm tắt các ứng viên của một Job
// GET /api/applications/job/:job_id
router.get("/job/:job_id", verifyToken, getJobApplicants);

// 3. Xem chi tiết hồ sơ CV của một ứng viên (MỚI THÊM ✅)
// GET /api/applications/detail/:application_id
// Route này dùng để gọi khi click vào tên ứng viên để hiện Popup
router.get("/detail/:application_id", verifyToken, getApplicationDetail);

// 4. Cập nhật trạng thái đơn ứng tuyển (Duyệt / Từ chối)
// PUT /api/applications/status/:application_id
router.put("/status/:application_id", verifyToken, updateApplicationStatus);

export default router;
