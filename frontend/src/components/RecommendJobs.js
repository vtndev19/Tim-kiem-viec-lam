import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/components/recommendJobs.scss";
import { Sparkles, X } from "lucide-react"; // Thêm icon đóng nếu cần

const RecommendJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCache, setIsCache] = useState(false); // Đổi tên biến cho rõ nghĩa
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ---------------- GET RECOMMENDED JOBS ----------------
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          console.error("Không có token → không thể lấy gợi ý");
          setLoading(false);
          return;
        }

        // ✅ 1. SỬA URL CHO KHỚP BACKEND MỚI
        const res = await axios.get(
          `http://localhost:8080/api/recommendations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API Response:", res.data); // Log để debug

        // ✅ 2. SỬA CÁCH LẤY DỮ LIỆU
        // Backend trả về: { success: true, source: "...", data: [...] }
        if (res.data.success) {
          setJobs(res.data.data || []);
          // Kiểm tra nguồn dữ liệu (cache hay ai_generated)
          setIsCache(res.data.source === "cache");
        }
      } catch (error) {
        console.error("Lỗi khi lấy gợi ý việc làm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // ---------------- AUTO-TOAST EVERY 10 SECONDS ----------------
  // (Tăng lên 10s để đỡ phiền user)
  useEffect(() => {
    if (open || jobs.length === 0) return;

    const interval = setInterval(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 10000);

    return () => clearInterval(interval);
  }, [jobs, open]);

  return (
    <>
      {/* Icon mở panel */}
      <div className="recommend-icon" onClick={() => setOpen(!open)}>
        <Sparkles size={26} color="#fff" />
        {jobs.length > 0 && <span className="badge">{jobs.length}</span>}
      </div>

      {/* Toast thông báo (chỉ hiện khi panel đóng) */}
      {!open && showToast && (
        <div className="recommend-toast" onClick={() => setOpen(true)}>
          ✨ Có {jobs.length} việc làm phù hợp với bạn!
        </div>
      )}

      {/* Panel danh sách job */}
      <div className={`recommend-panel ${open ? "open" : ""}`}>
        <div className="panel-header">
          <h3 className="panel-title">
            Gợi ý cho bạn{" "}
            {isCache ? (
              <span style={{ fontSize: "0.8em", color: "#888" }}>(Cache)</span>
            ) : (
              <Sparkles size={16} color="gold" />
            )}
          </h3>
          <button className="close-btn" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>

        {loading ? (
          <div className="panel-loading">Đang phân tích hồ sơ...</div>
        ) : jobs.length === 0 ? (
          <div className="panel-empty">Chưa có gợi ý phù hợp!</div>
        ) : (
          <div className="panel-list">
            {jobs.map((job) => (
              <Link
                to={`/job/${job.job_id}`}
                key={job.job_id}
                className="panel-item"
                onClick={() => setOpen(false)} // Đóng khi click vào job
              >
                <div className="item-header">
                  <h4 className="job-title">{job.title}</h4>
                  <span className="job-salary">{job.salary}</span>
                </div>

                {/* Hiển thị lý do gợi ý nếu có */}
                {job.reason && <p className="ai-reason">💡 {job.reason}</p>}

                <div className="item-meta">
                  <span className="location">📍 {job.location}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RecommendJobs;
