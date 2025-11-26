import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../src/configs/data.js";

dotenv.config();

// ====================== CONFIG AI ========================
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

// =================== HELPER FUNCTIONS ====================

// 1. Safe Call AI
async function safeCallAI(prompt) {
  try {
    const res = await model.generateContent(prompt);
    return res.response.text();
  } catch (err) {
    console.error("   ❌ [AI ERROR]:", err.message);
    return null;
  }
}

// 2. Parse JSON
function parseAIResponse(raw) {
  if (!raw) return null;
  try {
    const match = raw.match(/\[.*\]/s);
    if (!match) return null;
    const data = JSON.parse(match[0]);
    return Array.isArray(data) ? data.slice(0, 3) : null;
  } catch (e) {
    console.error("   ❌ [JSON ERROR] Không parse được response từ AI");
    return null;
  }
}

// 3. Fallback Logic
function fallbackRecommend(jobs, history) {
  console.log("   ⚠️  [FALLBACK] Đang chạy logic fallback thủ công...");
  const city = history[0]?.city;
  const industry = history[0]?.industry;
  const seenIds = new Set();

  let selected = jobs
    .filter((j) => {
      if (j.location === city || j.industry === industry) {
        seenIds.add(j.id);
        return true;
      }
      return false;
    })
    .slice(0, 3);

  if (selected.length < 3) {
    for (const job of jobs) {
      if (selected.length >= 3) break;
      if (!seenIds.has(job.id)) {
        selected.push(job);
        seenIds.add(job.id);
      }
    }
  }

  return selected.map((j) => ({
    job_id: j.id,
    reason: `Gợi ý thay thế dựa trên ${
      j.industry === industry ? "ngành nghề" : "địa điểm"
    } (Hệ thống AI đang bận).`,
  }));
}

// =================== CORE FUNCTION =======================

export const updateUserRecommendations = async (user_id) => {
  const startTimer = Date.now();
  console.log(`\n=============================================`);
  console.log(`🚀 [START] Bắt đầu tiến trình cho User ID: ${user_id}`);

  try {
    // 1. Lấy lịch sử
    console.log(`   ⏳ Đang tải lịch sử tìm kiếm...`);
    const [history] = await db.execute(
      `SELECT city, industry, keyword FROM search_history WHERE user_id = ? ORDER BY search_date DESC LIMIT 5`,
      [user_id]
    );

    if (history.length === 0) {
      console.log(`   ⛔ User ${user_id} chưa có lịch sử tìm kiếm. Bỏ qua.`);
      return false;
    }
    console.log(`   ✅ Tìm thấy ${history.length} mục lịch sử.`);

    // 2. Lấy Job mới
    console.log(`   ⏳ Đang lấy danh sách Job candidates...`);
    const [jobs] = await db.execute(`
      SELECT j.job_id AS id, j.title, l.city AS location, j.salary_range AS salary, i.name AS industry
      FROM jobs j
      JOIN locations l ON j.location_id = l.location_id
      JOIN industries i ON j.industry_id = i.industry_id
      ORDER BY j.posted_date DESC LIMIT 30
    `);
    console.log(`   ✅ Đã lấy ${jobs.length} job mới nhất từ DB.`);

    const aiJobs = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      location: j.location,
      industry: j.industry,
    }));

    // 3. Gọi AI
    const prompt = `
      User History: ${JSON.stringify(history)}
      Available Jobs: ${JSON.stringify(aiJobs)}
      Task: Recommend top 3 jobs. Return JSON array only: [{"job_id": 1, "reason": "vn text"}].
    `;

    console.log(`   🤖 Đang gửi yêu cầu đến Gemini AI...`);
    const rawAI = await safeCallAI(prompt);

    let recommendations = parseAIResponse(rawAI);

    // 4. Fallback
    if (!recommendations || recommendations.length === 0) {
      console.log(`   ⚠️ AI không trả về kết quả hợp lệ hoặc bị lỗi.`);
      recommendations = fallbackRecommend(jobs, history);
    } else {
      console.log(
        `   ✨ AI đã trả về ${recommendations.length} gợi ý thành công.`
      );
    }

    // 5. Lưu vào DB
    console.log(`   🔄 Đang cập nhật Database (Xóa cũ -> Thêm mới)...`);

    // Xóa cache cũ
    await db.execute(`DELETE FROM recommendation_cache WHERE user_id = ?`, [
      user_id,
    ]);

    const insertPromises = recommendations
      .map((rec) => {
        const job = jobs.find((j) => j.id === rec.job_id);
        if (!job) return null;
        return db.execute(
          `INSERT INTO recommendation_cache (user_id, job_id, title, location, salary, reason, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [user_id, job.id, job.title, job.location, job.salary, rec.reason]
        );
      })
      .filter((p) => p !== null);

    await Promise.all(insertPromises);

    const endTimer = Date.now();
    console.log(`   💾 Đã lưu ${insertPromises.length} bản ghi vào Cache.`);
    console.log(
      `✅ [DONE] Hoàn tất User ${user_id} trong ${
        (endTimer - startTimer) / 1000
      }s`
    );
    console.log(`=============================================\n`);

    return true;
  } catch (err) {
    console.error(`🔥 [CRITICAL ERROR] Lỗi update user ${user_id}:`, err);
    console.log(`=============================================\n`);
    return false;
  }
};
