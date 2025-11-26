import express from "express";
import {
  saveJob,
  getSavedJobs,
  deleteSavedJob,
} from "../controller/savedJobController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Lưu công việc
router.post("/:jobId", verifyToken, saveJob);

// ✅ Lấy danh sách công việc đã lưu
router.get("/", verifyToken, getSavedJobs);

// ✅ Xóa công việc đã lưu
router.delete("/:jobId", verifyToken, deleteSavedJob);

export default router;
