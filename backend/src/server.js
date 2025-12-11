// ===================================================
// IMPORT CÁC MODULE CẦN THIẾT
// ===================================================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http"; // ✅ THÊM: Để tạo HTTP Server
import { Server } from "socket.io"; // ✅ THÊM: Import Socket.io

/* Router Imports */
import jobRoutes from "./routes/jobRoutes.js";
import companyRoutes from "./routes/companyRouter.js";
import locationRoutes from "./routes/locationRouter.js";
import adminPostRoutes from "./routes/adminPostRoutes.js";
import recommendationRoutes from "./routes/geminiRecommendRoutes.js";
import searchHistoryRoutes from "./routes/searchHistoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cvRoutes from "./routes/cvRoutes.js";
import userPostRoutes from "./routes/userPostRoutes.js";
import savedJobRoutes from "./routes/savedJobRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import predictSalary from "./routes/salaryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"; // ✅ THÊM: Router thông báo

/* database Connection */
import db from "./configs/data.js";

// ===================================================
// CẤU HÌNH CƠ BẢN
// ===================================================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// ✅ THÊM: Tạo HTTP Server bọc lấy Express App (bắt buộc để chạy chung Socket.io)
const httpServer = createServer(app);

// ✅ THÊM: Cấu hình Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Phải trùng với URL Frontend React của bạn
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ THÊM: Lưu biến 'io' vào app để dùng ở Controller (ví dụ: applicationController.js)
app.set("io", io);

// ✅ THÊM: Lắng nghe kết nối Socket
io.on("connection", (socket) => {
  // console.log("🟢 Một User vừa kết nối Socket:", socket.id);

  // Client (Frontend) gửi sự kiện 'join_room' với tên phòng (vd: room_user_10)
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    // console.log(`User đã vào phòng: ${roomName}`);
  });

  socket.on("disconnect", () => {
    // console.log("🔴 User đã ngắt kết nối");
  });
});

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
app.use("/api/search-history", searchHistoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/user-posts", userPostRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/employer", recruiterRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/salary", predictSalary);
app.use("/api/notifications", notificationRoutes); // ✅ THÊM: Đăng ký route thông báo

// ===================================================
// 🚀 KHỞI ĐỘNG SERVER
// ===================================================
// ♻️ SỬA: Dùng httpServer.listen thay vì app.listen để chạy cả Express và Socket
httpServer.listen(PORT, () => {
  console.log(
    `✅ Server Job-Finder (Socket+Express) đang chạy tại: http://localhost:${PORT}`
  );
});
