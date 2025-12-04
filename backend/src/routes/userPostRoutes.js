import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../configs/data.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===================================
// 🧩 Fix lỗi __dirname trong ES module
// ===================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================================
// 🔧 Cấu hình thư mục upload cho bài viết
// ===================================
const uploadDir = path.join(__dirname, "..", "uploads", "posts");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Đã tạo thư mục uploads/posts");
}

// ===================================
// ⚙️ Cấu hình Multer
// ===================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

// ===================================
// 📝 1. Đăng bài viết mới
// ===================================
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const user_id = req.user.user_id;

    if (!title || !content) {
      return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung!" });
    }

    // ✅ Tạo đường dẫn public cho ảnh
    const image_url = req.file ? `/uploads/posts/${req.file.filename}` : null;

    // ✅ Lưu bài viết vào DB
    const [result] = await db.query(
      `INSERT INTO user_posts (user_id, title, content, image_url, tags, status)
       VALUES (?, ?, ?, ?, ?, 'published')`,
      [user_id, title, content, image_url, tags || null]
    );

    res.status(201).json({
      success: true,
      message: "✅ Bài viết đã được đăng!",
      post_id: result.insertId,
      image_url,
    });
  } catch (error) {
    console.error("❌ Lỗi khi đăng bài:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi đăng bài" });
  }
});

// ===================================
// 📄 2. Lấy danh sách bài viết (newsfeed)
// ===================================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.full_name, u.email
      FROM user_posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
    `);

    // ✅ Bổ sung prefix http://localhost:8080 nếu có ảnh
    const formatted = rows.map((r) => ({
      ...r,
      image_url: r.image_url ? `http://localhost:8080${r.image_url}` : null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách bài viết:", error);
    res.status(500).json({ message: "Không thể lấy danh sách bài viết" });
  }
});

// ===================================
// 📄 3. Lấy bài viết của chính người dùng
// ===================================
router.get("/my-posts", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const [rows] = await db.query(
      `SELECT * FROM user_posts WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );

    const formatted = rows.map((r) => ({
      ...r,
      image_url: r.image_url ? `http://localhost:8080${r.image_url}` : null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Lỗi khi lấy bài viết người dùng:", error);
    res.status(500).json({ message: "Không thể lấy bài viết cá nhân" });
  }
});

// ===================================
// ❤️ 4. Cập nhật lượt thích
// ===================================
router.put("/:post_id/like", verifyToken, async (req, res) => {
  try {
    const { post_id } = req.params;
    await db.query(
      "UPDATE user_posts SET likes = likes + 1 WHERE post_id = ?",
      [post_id]
    );
    res.json({ message: "👍 Đã thích bài viết!" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật lượt thích:", error);
    res.status(500).json({ message: "Không thể cập nhật lượt thích" });
  }
});

// ===================================
// 👁 5. Cập nhật lượt xem
// ===================================
router.put("/:post_id/view", async (req, res) => {
  try {
    const { post_id } = req.params;
    await db.query(
      "UPDATE user_posts SET views = views + 1 WHERE post_id = ?",
      [post_id]
    );
    res.json({ message: "👁 Lượt xem đã được tăng" });
  } catch (error) {
    console.error("❌ Lỗi khi tăng lượt xem:", error);
    res.status(500).json({ message: "Không thể tăng lượt xem" });
  }
});

export default router;
