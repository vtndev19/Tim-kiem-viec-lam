import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/components/recommendJobs.scss";
import { Sparkles } from "lucide-react";

const RecommendJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
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

        // Gọi API đúng backend route
        const res = await axios.get(
          `http://localhost:8080/api/gemini/recommend-jobs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setJobs(res.data.recommendations || []);
        setFromCache(res.data.fromCache || false);
      } catch (error) {
        console.error("Lỗi khi lấy gợi ý việc làm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // ---------------- AUTO-TOAST EVERY 5 SECONDS ----------------
  useEffect(() => {
    if (open || jobs.length === 0) return;

    const interval = setInterval(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 5000);

    return () => clearInterval(interval);
  }, [jobs, open]);

  return (
    <>
      {/* Icon mở panel */}
      <div className="recommend-icon" onClick={() => setOpen(!open)}>
        <Sparkles size={26} />
      </div>

      {/* Toast thông báo */}
      {showToast && (
        <div className="recommend-toast">
          ✨ Có {jobs.length} việc làm gợi ý cho bạn!
        </div>
      )}

      {/* Panel danh sách job */}
      <div className={`recommend-panel ${open ? "open" : ""}`}>
        <h3 className="panel-title">
          Gợi ý việc làm {fromCache ? "(từ AI)" : ""}
        </h3>

        {loading ? (
          <div className="panel-loading">Đang tải...</div>
        ) : jobs.length === 0 ? (
          <div className="panel-empty">Không có gợi ý nào!</div>
        ) : (
          <div className="panel-list">
            {jobs.map((job) => (
              <Link
                to={`/job/${job.job_id}`}
                key={job.job_id}
                className="panel-item"
              >
                <div className="header">
                  <h4>{job.title || "Không có tiêu đề"}</h4>
                  <span className="company">
                    {job.company || "Không rõ công ty"}
                  </span>
                </div>

                <p className="desc">
                  {(job.description || "Không có mô tả").substring(0, 80)}...
                </p>

                <div className="meta">
                  <span>{job.location || "Không rõ địa điểm"}</span>
                  <span>{job.salary || "Thoả thuận"}</span>
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
