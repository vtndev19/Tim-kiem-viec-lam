import cron from "node-cron";
import { runSalaryPrediction } from "../../services/salaryPredictService.js";

// 👉 HÀM EXPORT ĐỂ SERVER GỌI
export const startSalaryCron = () => {
  console.log("⏳ Đã khởi động CRON dự đoán lương");

  // Chạy mỗi 10 phút
  cron.schedule("*/10 * * * *", async () => {
    console.log("⚙ Đang chạy CRON dự đoán lương...");
    await runSalaryPrediction();
  });
};
