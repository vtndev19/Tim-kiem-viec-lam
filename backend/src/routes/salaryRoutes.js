// routes/salary.js
import express from "express";
import {
  predictSalary,
  getCVDetail,
  getUserCVs,
  analyzeUserProfile,
  recommendJobs, // [MỚI] Import hàm controller mới
} from "../controller/SalaryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Các route cũ
router.get("/cv/user", verifyToken, getUserCVs); // Lấy list CV
router.get("/cv/:cv_id", verifyToken, getCVDetail); // Lấy chi tiết 1 CV
router.get("/analyze-profile", verifyToken, analyzeUserProfile);
router.post("/predict", verifyToken, predictSalary); // Dự đoán lương

// [MỚI] Route tư vấn việc làm
router.post("/recommend-jobs", verifyToken, recommendJobs);

export default router;
