// ================================================
// ✅ CẤU HÌNH KẾT NỐI MYSQL CHO JOB_FINDER
// ================================================
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// 1. Đọc biến môi trường từ file .env
dotenv.config();

// 2. Cấu hình thông số kết nối
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "", // Mặc định XAMPP là rỗng
  database: process.env.DB_NAME || "job_finder", // Tên DB chuẩn theo file SQL
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// 3. Tạo pool kết nối
const db = mysql.createPool(dbConfig);

// 4. Kiểm tra kết nối ngay lập tức để báo lỗi nếu có
(async () => {
  try {
    const connection = await db.getConnection();
    console.log(`✅ Kết nối thành công đến Database: ${dbConfig.database}`);
    connection.release(); // Trả lại kết nối cho pool
  } catch (err) {
    console.error("❌ LỖI KẾT NỐI CSDL:");
    console.error(`   - Host: ${dbConfig.host}`);
    console.error(`   - User: ${dbConfig.user}`);
    console.error(`   - Database: ${dbConfig.database}`);
    console.error(`   - Error: ${err.message}`);

    if (err.code === "ER_BAD_DB_ERROR") {
      console.error(
        "👉 Gợi ý: Kiểm tra lại tên Database trong phpMyAdmin xem có đúng là 'job_finder' không?"
      );
    }
    if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("👉 Gợi ý: Sai mật khẩu hoặc User root.");
    }
  }
})();

export default db;
