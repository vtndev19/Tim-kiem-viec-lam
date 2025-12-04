import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../configs/data.js";

dotenv.config();

// ======================= CONFIG & CONSTANTS =======================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.0-flash";

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = ai.getGenerativeModel({ model: MODEL_NAME });

// SQL Queries (Tách biệt để dễ quản lý)
const SQL_GET_HISTORY = `
  SELECT city, industry, keyword 
  FROM search_history 
  WHERE user_id = ?
  ORDER BY search_date DESC
  LIMIT 5
`;

// Đã sửa: Bỏ JOIN locations, dùng trực tiếp j.location
const SQL_GET_LATEST_JOBS = `
  SELECT 
    j.job_id AS id, 
    j.title, 
    j.location, 
    j.salary_range AS salary, 
    i.name AS industry
  FROM jobs j
  LEFT JOIN industries i ON j.industry_id = i.industry_id
  ORDER BY j.posted_date DESC
  LIMIT 30
`;

const SQL_GET_CACHE = `SELECT * FROM recommendation_cache WHERE user_id = ?`;

const SQL_DELETE_CACHE = `DELETE FROM recommendation_cache WHERE user_id = ?`;

const SQL_INSERT_CACHE = `
  INSERT INTO recommendation_cache 
  (user_id, job_id, title, location, salary, reason) 
  VALUES ?
`;

// ======================= HELPERS ==========================

async function generateAIContent(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("[AI Error]", error.message);
    return null;
  }
}

function parseAIResponse(rawText) {
  try {
    if (!rawText) return [];
    // Tìm chuỗi JSON trong phản hồi (tránh các text rác)
    const jsonMatch = rawText.match(/\[.*\]/s);
    if (!jsonMatch) return [];

    const parsedData = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsedData) ? parsedData.slice(0, 3) : [];
  } catch (error) {
    console.error("[Parse JSON Error]", error.message);
    return [];
  }
}

function getFallbackRecommendations(jobs, history) {
  console.log("[Fallback] Generating fallback recommendations...");

  const lastSearch = history[0] || {};
  const { city, industry } = lastSearch;

  const recommendedJobs = [];
  const seenJobIds = new Set();

  // Ưu tiên 1: Khớp cả địa điểm và ngành
  for (const job of jobs) {
    if (recommendedJobs.length >= 3) break;

    const matchLocation = city && job.location && job.location.includes(city);
    const matchIndustry = industry && job.industry === industry;

    if (matchLocation || matchIndustry) {
      if (!seenJobIds.has(job.id)) {
        recommendedJobs.push({
          job_id: job.id,
          reason: matchIndustry
            ? `Phù hợp với ngành nghề bạn quan tâm: ${industry}`
            : `Việc làm nổi bật tại ${job.location}`,
        });
        seenJobIds.add(job.id);
      }
    }
  }

  // Ưu tiên 2: Lấy ngẫu nhiên nếu chưa đủ
  if (recommendedJobs.length < 3) {
    for (const job of jobs) {
      if (recommendedJobs.length >= 3) break;
      if (!seenJobIds.has(job.id)) {
        recommendedJobs.push({
          job_id: job.id,
          reason: "Việc làm mới nhất đề xuất cho bạn",
        });
        seenJobIds.add(job.id);
      }
    }
  }

  return recommendedJobs;
}

// ======================= DATABASE ACTIONS =======================

async function saveRecommendationsToDB(userId, jobsSource, aiRecommendations) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Xóa cache cũ
    await connection.query(SQL_DELETE_CACHE, [userId]);

    // 2. Chuẩn bị dữ liệu Bulk Insert (Hiệu năng tốt hơn loop insert)
    const insertValues = [];

    for (const rec of aiRecommendations) {
      const job = jobsSource.find((j) => j.id === rec.job_id);
      if (job) {
        insertValues.push([
          userId,
          job.id,
          job.title,
          job.location,
          job.salary || "Thoả thuận",
          rec.reason || "Gợi ý phù hợp",
        ]);
      }
    }

    if (insertValues.length > 0) {
      await connection.query(SQL_INSERT_CACHE, [insertValues]);
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error("[Database Error] Save cache failed:", error);
    return false;
  } finally {
    connection.release();
  }
}

async function processUserRecommendations(userId) {
  try {
    // 1. Lấy dữ liệu đầu vào song song để tiết kiệm thời gian
    const [historyResult, jobsResult] = await Promise.all([
      db.execute(SQL_GET_HISTORY, [userId]),
      db.execute(SQL_GET_LATEST_JOBS),
    ]);

    const history = historyResult[0];
    const jobs = jobsResult[0];

    if (history.length === 0) {
      console.log(`[Info] User ${userId} has no search history.`);
      return false; // Hoặc trả về random jobs
    }

    // 2. Chuẩn bị dữ liệu cho AI
    const simplifiedJobs = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      location: j.location,
      industry: j.industry,
    }));

    const prompt = `
      User History: ${JSON.stringify(history)}
      Available Jobs: ${JSON.stringify(simplifiedJobs)}
      Task: Recommend top 3 most suitable jobs based on history.
      Output format: STRICT JSON Array only [{"job_id": 123, "reason": "Short reason in Vietnamese"}]
    `;

    // 3. Gọi AI
    const aiRawText = await generateAIContent(prompt);
    let finalRecommendations = parseAIResponse(aiRawText);

    // 4. Fallback nếu AI lỗi
    if (!finalRecommendations || finalRecommendations.length === 0) {
      finalRecommendations = getFallbackRecommendations(jobs, history);
    }

    // 5. Lưu xuống DB
    return await saveRecommendationsToDB(userId, jobs, finalRecommendations);
  } catch (error) {
    console.error("[Process Error]", error);
    return false;
  }
}

// ======================= API CONTROLLER =======================

export const recommendJobs = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    // 1. Kiểm tra cache
    const [cachedData] = await db.execute(SQL_GET_CACHE, [userId]);

    let shouldUseCache = false;

    if (cachedData.length > 0) {
      // Lấy thời gian cập nhật của bản ghi đầu tiên
      const lastUpdate = new Date(cachedData[0].updated_at);
      const now = new Date();

      // Tính khoảng cách thời gian (miliseconds)
      const diffTime = Math.abs(now - lastUpdate);
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

      //  LOGIC MỚI: Chỉ dùng cache nếu nó mới tạo dưới 24 giờ
      if (diffHours < 3) {
        shouldUseCache = true;
      } else {
        console.log(
          ` Cache của user ${userId} đã cũ (${diffHours}h), đang tạo mới...`
        );
      }
    }

    // 2. Nếu Cache còn mới -> Trả về Cache
    if (shouldUseCache) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: cachedData,
      });
    }

    // 3. Nếu không có cache HOẶC cache đã cũ -> Gọi AI chạy lại
    const isSuccess = await processUserRecommendations(userId);

    // ... (Phần còn lại giữ nguyên) ...

    // Lấy lại data mới nhất vừa tạo
    const [newData] = await db.execute(SQL_GET_CACHE, [userId]);
    return res.status(200).json({
      success: true,
      source: "ai_generated_fresh", // Đánh dấu là mới tạo
      data: newData,
    });
  } catch (error) {
    console.error("[Controller Error]", error);
    return res.status(500).json({ success: false });
  }
};
