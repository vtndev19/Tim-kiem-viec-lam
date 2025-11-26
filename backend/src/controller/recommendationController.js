import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../configs/data.js";

dotenv.config();

// ======================= AI CONFIG =======================
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

// ======================= HELPERS ==========================

// 1. Safe call AI
async function safeCallAI(prompt) {
  try {
    const res = await model.generateContent(prompt);
    return res.response.text();
  } catch (err) {
    console.error("❌ [AI ERROR]:", err.message);
    return null;
  }
}

// 2. Parse JSON từ AI
function parseAIResponse(raw) {
  try {
    if (!raw) return null;

    const jsonMatch = raw.match(/\[.*\]/s);
    if (!jsonMatch) return null;

    const arr = JSON.parse(jsonMatch[0]);
    return Array.isArray(arr) ? arr.slice(0, 3) : null;
  } catch (err) {
    console.error("❌ [JSON PARSE ERROR]:", err.message);
    return null;
  }
}

// 3. Fallback khi AI lỗi
function fallbackRecommend(jobs, history) {
  console.log("⚠️ [FALLBACK] Sử dụng fallback recommendation...");

  const city = history[0]?.city;
  const industry = history[0]?.industry;
  const seen = new Set();

  let selected = jobs
    .filter((job) => {
      if (job.location === city || job.industry === industry) {
        seen.add(job.id);
        return true;
      }
      return false;
    })
    .slice(0, 3);

  if (selected.length < 3) {
    for (const job of jobs) {
      if (selected.length >= 3) break;
      if (!seen.has(job.id)) {
        selected.push(job);
        seen.add(job.id);
      }
    }
  }

  return selected.map((job) => ({
    job_id: job.id,
    reason: `Gợi ý fallback theo ${
      job.industry === industry ? "ngành" : "địa điểm"
    }.`,
  }));
}

// ======================= SAVE CACHE =======================

async function saveRecommendationCache(user_id, jobs, recommendations) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Xoá cache cũ
    await conn.execute("DELETE FROM recommendation_cache WHERE user_id = ?", [
      user_id,
    ]);

    const sql = `
      INSERT INTO recommendation_cache
      (user_id, job_id, title, location, salary, reason, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        location = VALUES(location),
        salary = VALUES(salary),
        reason = VALUES(reason),
        updated_at = NOW()
    `;

    for (const rec of recommendations) {
      const job = jobs.find((j) => j.id === rec.job_id);
      if (!job) {
        console.warn("⚠️ Không tìm thấy job cho id:", rec.job_id);
        continue;
      }

      await conn.execute(sql, [
        user_id,
        job.id,
        job.title,
        job.location,
        job.salary || "Thoả thuận",
        rec.reason || null,
      ]);
    }

    await conn.commit();
    conn.release();
    return true;
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error("🔥 Lỗi khi lưu cache:", err);
    return false;
  }
}

// ======================= CORE LOGIC =======================

async function updateUserRecommendations(user_id) {
  console.log(`\n🚀 Update recommendations cho user ${user_id}`);

  try {
    // 1. Lịch sử tìm kiếm
    const [history] = await db.execute(
      `SELECT city, industry, keyword 
       FROM search_history 
       WHERE user_id = ?
       ORDER BY search_date DESC
       LIMIT 5`,
      [user_id]
    );

    if (history.length === 0) {
      console.log("⛔ Không có lịch sử tìm kiếm.");
      return false;
    }

    // 2. Job mới nhất
    const [jobs] = await db.execute(`
      SELECT j.job_id AS id, j.title, l.city AS location, 
             j.salary_range AS salary, i.name AS industry
      FROM jobs j
      JOIN locations l ON j.location_id = l.location_id
      JOIN industries i ON j.industry_id = i.industry_id
      ORDER BY j.posted_date DESC
      LIMIT 30
    `);

    const aiJobs = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      location: j.location,
      industry: j.industry,
    }));

    // 3. Prompt AI
    const prompt = `
      User History: ${JSON.stringify(history)}
      Available Jobs: ${JSON.stringify(aiJobs)}
      Task: Recommend top 3 jobs. 
      Return ONLY JSON array: [{"job_id": 1, "reason": "text"}]
    `;

    const rawAI = await safeCallAI(prompt);
    let recommendations = parseAIResponse(rawAI);

    if (!recommendations) {
      console.log("⚠️ AI fail → dùng fallback");
      recommendations = fallbackRecommend(jobs, history);
    }

    // 4. Lưu cache
    const ok = await saveRecommendationCache(user_id, jobs, recommendations);

    return ok;
  } catch (err) {
    console.error("🔥 [updateUserRecommendations ERROR]:", err);
    return false;
  }
}

// ======================= API CONTROLLER =======================

export const recommendJobs = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ error: "User chưa đăng nhập" });
    }

    // 1. Kiểm tra cache
    const [cached] = await db.execute(
      `SELECT * FROM recommendation_cache WHERE user_id = ?`,
      [user_id]
    );

    if (cached.length > 0) {
      return res.json({
        fromCache: true,
        recommendations: cached,
      });
    }

    // 2. Không có cache → chạy AI
    const ok = await updateUserRecommendations(user_id);

    if (!ok) {
      return res.status(500).json({ error: "Không tạo được recommendation" });
    }

    // 3. Lấy cache mới
    const [fresh] = await db.execute(
      `SELECT * FROM recommendation_cache WHERE user_id = ?`,
      [user_id]
    );

    return res.json({
      fromCache: false,
      recommendations: fresh,
    });
  } catch (err) {
    console.error("🔥 [recommendJobs ERROR]:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
