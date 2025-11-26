import db from "../src/configs/data.js";
import axios from "axios";
import fs from "fs";
import path from "path";

const logFile = path.join(process.cwd(), "logs/predict.log");

// GHI LOG RA FILE
function writeLog(message) {
  const time = new Date().toISOString();
  fs.appendFileSync(logFile, `[${time}] ${message}\n`);
}

// HÀM CHÍNH: Dự đoán + lưu DB
export const runSalaryPrediction = async () => {
  try {
    writeLog("=== 🚀 BẮT ĐẦU DỰ ĐOÁN LƯƠNG ===");

    // 1️⃣ Lấy job từ DB
    const [jobs] = await db.query(`
      SELECT 
        j.job_id,
        c.company_name,
        j.title,
        j.description,
        l.city AS location,
        j.views,
        jt.type_name AS formatted_work_type,
        j.remote_allowed,
        j.experience_level AS formatted_experience_level,
        j.skills_desc,
        j.sponsored,
        j.application_type
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      JOIN locations l ON j.location_id = l.location_id
      JOIN job_types jt ON j.job_type_id = jt.job_type_id
      ORDER BY j.posted_date DESC
      LIMIT 50
    `);

    writeLog(`📌 Lấy được ${jobs.length} jobs từ DB`);

    if (jobs.length === 0) {
      writeLog("⚠ Không có job để dự đoán!");
      return;
    }

    // 2️⃣ Chuẩn hóa dữ liệu đúng theo schema của FastAPI
    const requestData = {
      data: jobs.map((job) => ({
        job_id: job.job_id,
        company_name: job.company_name || "Unknown",
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        views: job.views || 0,
        formatted_work_type: job.formatted_work_type || "Full-time",
        remote_allowed: job.remote_allowed ? "1" : "0",
        formatted_experience_level:
          job.formatted_experience_level || "Entry Level",
        skills_desc: job.skills_desc || "",
        sponsored: job.sponsored ? 1 : 0,
        application_type: job.application_type || "Simple",
      })),
    };

    writeLog("📨 Chuẩn bị gửi batch sang ML server...");

    // 3️⃣ Gửi sang ML server
    const mlUrl = "http://127.0.0.1:8000/predict/batch";

    let mlResponse;
    try {
      mlResponse = await axios.post(mlUrl, requestData);
      writeLog("📩 ML server đã phản hồi OK");
    } catch (err) {
      writeLog("❌ Lỗi gọi ML API: " + err.message);
      return;
    }

    if (!mlResponse?.data?.predictions) {
      writeLog("❌ ML server không trả về predictions!");
      return;
    }

    const predictions = mlResponse.data.predictions;

    writeLog(`📊 ML gửi về ${predictions.length} dự đoán`);

    // 4️⃣ Lưu DB
    for (const p of predictions) {
      try {
        await db.query(
          `
            INSERT INTO predicted_salaries (job_id, predicted_salary)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE predicted_salary = VALUES(predicted_salary)
          `,
          [p.job_id, p.predicted_salary]
        );

        writeLog(`💾 Lưu dự đoán xong job_id ${p.job_id}`);
      } catch (dbErr) {
        writeLog(`❌ Lỗi lưu DB cho job_id ${p.job_id}: ${dbErr.message}`);
      }
    }

    writeLog(`🎉 Hoàn tất dự đoán & lưu ${predictions.length} job.`);
  } catch (err) {
    writeLog("❌ Lỗi không xác định: " + err.message);
  }
};
