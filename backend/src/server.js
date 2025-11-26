// ===================================================
// IMPORT CÁC MODULE CẦN THIẾT
// ===================================================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* Router Imports */
import jobRoutes from "./routers/jobRoutes.js";
import companyRoutes from "./routers/companyRouter.js";
import locationRoutes from "./routers/locationRouter.js";
import adminPostRoutes from "./routers/adminPostRoutes.js";
import recommendRoutes from "./routers/geminiRecommendRoutes.js"; // Router gợi ý công việc
import searchHistoryRoutes from "./routers/searchHistoryRoutes.js";
import authRoutes from "./routers/authRoutes.js";
import cvRoutes from "./routers/cvRoutes.js";
import userPostRoutes from "./routers/userPostRoutes.js"; // 🧩 Bài viết người dùng
import savedJobRoutes from "./routers/savedJobRoutes.js";

/* database Connection */
import db from "./configs/data.js";

// ===================================================
// CẤU HÌNH CƠ BẢN
// ===================================================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Xử lý __dirname trong môi trường ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================================================
// ✅ MIDDLEWARE CHUNG
// ===================================================
app.use(
  cors({
    origin: "http://localhost:3000", // Cho phép frontend React
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json()); // Cho phép parse JSON body

// ===================================================
// 📸 STATIC FILES (phục vụ ảnh upload)
// ===================================================
const uploadRoot = path.join(__dirname, "uploads");
const postsDir = path.join(uploadRoot, "posts");

// 🔧 Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

// Cho phép truy cập ảnh tĩnh
app.use("/uploads", express.static(uploadRoot));
console.log("📸 Ảnh được phục vụ từ:", uploadRoot);

// ===================================================
// ✅ ROUTE KIỂM TRA SERVER
// ===================================================
app.get("/", (req, res) => {
  res.send("🚀 Server Job-Finder đang hoạt động tốt!");
});

// ===================================================
// ✅ ROUTE TEST DATABASE
// ===================================================
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users LIMIT 5");
    res.json({
      message: "✅ Kết nối cơ sở dữ liệu thành công!",
      sample: rows,
    });
  } catch (err) {
    console.error("❌ Lỗi truy vấn DB:", err);
    res.status(500).json({
      message: "Không thể truy vấn cơ sở dữ liệu",
      error: err.message,
    });
  }
});

// ===================================================
// 🧩 ROUTE CHÍNH
// ===================================================
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/admin/posts", adminPostRoutes);
app.use("/api/gemini", recommendRoutes);
app.use("/api/search-history", searchHistoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/user-posts", userPostRoutes); // ✅ Bài viết người dùng (blogs)
app.use("/api/saved-jobs", savedJobRoutes);
// ===================================================
// 🚀 KHỞI ĐỘNG SERVER
// ===================================================
app.listen(PORT, () => {
  console.log(`✅ Server Job-Finder đang chạy tại: http://localhost:${PORT}`);
});
