// recommendation.router.js
import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { recommendJobs } from "../controller/recommendationController.js";

const router = express.Router();

// Lấy gợi ý công việc cho user
router.get("/recommend-jobs", verifyToken, recommendJobs);

export default router;
