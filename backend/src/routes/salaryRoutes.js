// routes/salary.js
import express from "express";
import {
  predictSalary,
  getCVDetail,
  getUserCVs,
  analyzeUserProfile,
} from "../controller/SalaryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/cv/user", verifyToken, getUserCVs); // Lấy list CV
router.get("/cv/:cv_id", verifyToken, getCVDetail); // Lấy chi tiết 1 CV
router.get("/analyze-profile", verifyToken, analyzeUserProfile);
router.post("/predict", verifyToken, predictSalary); // Dự đoán lương (Main Flow)

export default router;
