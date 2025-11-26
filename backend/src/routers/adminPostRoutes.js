import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createAdminPost,
  getAllAdminPosts,
  getAdminPostById,
} from "../controller/adminPostController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Cấu hình Multer lưu file ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// ✅ Router
const router = express.Router();
router.post("/", upload.array("images", 5), createAdminPost);
router.get("/", getAllAdminPosts);
router.get("/:id", getAdminPostById);

export default router;
