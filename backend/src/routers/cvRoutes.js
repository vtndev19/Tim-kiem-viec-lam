import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  saveCVBuilder,
  getUserCV,
  updateCV,
  deleteCV,
  saveCV,
} from "../controller/cvController.js";

const router = express.Router();

// POST /api/cv - Lưu CV từ CVBuilder
router.post("/", verifyToken, saveCVBuilder);

// GET /api/cv - Lấy danh sách CV của user hiện tại
router.get("/", verifyToken, getUserCV);

// PUT /api/cv/:cv_id - Cập nhật CV
router.put("/:cv_id", verifyToken, updateCV);

// DELETE /api/cv/:cv_id - Xóa CV
router.delete("/:cv_id", verifyToken, deleteCV);

// POST /api/cv/save (API cũ - giữ lại)
router.post("/save", verifyToken, saveCV);

export default router;
