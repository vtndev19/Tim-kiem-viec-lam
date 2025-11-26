import React, { useState } from "react";
import axios from "axios";
import "./SalaryPredictChart.scss";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ============================
   SERVICE GỌI MÔ HÌNH ML
=============================== */
const ML_SERVER_URL = "http://127.0.0.1:8000/predict/batch";

const sendToMLModel = async (jobs) => {
  try {
    const res = await axios.post(ML_SERVER_URL, { data: jobs });
    return res.data;
  } catch (error) {
    console.error("❌ LỖI ML SERVER:", error);
    throw error;
  }
};

/* ============================
   COMPONENT BIỂU ĐỒ LƯƠNG
=============================== */
export default function SalaryPredictChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);

    try {
      /* 1️⃣ Lấy 6 job từ backend Node */
      const jobRes = await axios.get(
        "http://localhost:5000/api/jobs/predict-list"
      );

      console.log("📌 DATA JOBS:", jobRes.data);

      const jobs = jobRes.data.jobs;

      if (!jobs || jobs.length === 0) {
        alert("Không có dữ liệu job trong DB!");
        return;
      }

      /* 2️⃣ Gửi sang ML */
      const mlRes = await sendToMLModel(jobs);
      console.log("📌 ML RESPONSE:", mlRes);

      /* 3️⃣ Chuẩn hoá dữ liệu để vẽ biểu đồ */
      const formatted = mlRes.predictions.map((item) => ({
        title: item.title,
        predicted_salary: item.predicted_salary,
      }));

      setChartData(formatted);
    } catch (err) {
      console.error("❌ LỖI PREDICT:", err);

      if (err.code === "ERR_NETWORK") {
        alert("❌ Không kết nối được API! Kiểm tra server ML & Node.");
      } else {
        alert("Đã xảy ra lỗi khi dự đoán.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="salary-chart-wrapper">
      <h2 className="title">
        <span className="icon">💰</span>Biểu đồ dự đoán mức lương từ mô hình ML
      </h2>

      <button className="predict-btn" onClick={handlePredict}>
        {loading ? "Đang dự đoán..." : "Lấy dữ liệu từ DB & Dự đoán"}
      </button>

      {chartData.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="predicted_salary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="no-data">Chưa có dữ liệu dự đoán.</p>
      )}
    </div>
  );
}
