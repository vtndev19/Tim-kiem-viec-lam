import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Tạo chuỗi ngẫu nhiên dài 64 ký tự
const secret = crypto.randomBytes(64).toString("hex");

// ✅ Xác định đường dẫn tới file .env
const envPath = path.join(__dirname, "..", ".env");

// ✅ Đọc nội dung file .env nếu có
let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf-8");
}

// ✅ Nếu có dòng JWT_SECRET cũ → thay thế, ngược lại thì thêm mới
if (envContent.includes("JWT_SECRET=")) {
  envContent = envContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${secret}`);
} else {
  envContent += `\nJWT_SECRET=${secret}`;
}

// ✅ Ghi lại vào file .env
fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");

console.log("✅ JWT_SECRET mới đã được tạo và lưu vào .env:");
console.log(secret);
