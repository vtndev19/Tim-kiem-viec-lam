import cron from "node-cron";
import mysql from "mysql2/promise";
import { updateUserRecommendations } from "../../services/recommendationService.js";

// Kết nối DB riêng hoặc import từ file config chung
const db = mysql.createPool({
  /* config DB */
});

const startCronJobs = () => {
  console.log("⏳ Hệ thống Cron Job đã khởi động...");

  // Chạy vào 2:00 sáng mỗi ngày ('0 2 * * *')
  cron.schedule("0 2 * * *", async () => {
    console.log("🚀 Bắt đầu chạy cập nhật gợi ý việc làm định kỳ...");

    try {
      // 1. Lấy danh sách user đã hoạt động trong 30 ngày qua (đỡ tốn AI cho user ảo/bỏ app)
      const [users] = await db.execute(`
        SELECT DISTINCT user_id 
        FROM search_history 
        WHERE search_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);

      console.log(`🔍 Tìm thấy ${users.length} user cần cập nhật.`);

      // 2. Chạy vòng lặp (Lưu ý: Chạy tuần tự hoặc delay để tránh Rate Limit của Gemini)
      for (const user of users) {
        await updateUserRecommendations(user.user_id);

        // Delay 2 giây giữa mỗi request để Google không chặn API
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      console.log("🏁 Hoàn tất cập nhật gợi ý định kỳ.");
    } catch (error) {
      console.error("🔥 Lỗi Cron Job:", error);
    }
  });
};

export default startCronJobs;
