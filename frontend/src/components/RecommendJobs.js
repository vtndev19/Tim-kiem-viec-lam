import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Sparkles, X, MapPin, Banknote, BrainCircuit } from "lucide-react"; // Thêm icon
import "../styles/components/recommendJobs.scss";

const RecommendJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCache, setIsCache] = useState(false);
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ---------------- GET RECOMMENDED JOBS ----------------
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:8080/api/recommendations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setJobs(res.data.data || []);
          setIsCache(res.data.source === "cache");
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // ---------------- AUTO-TOAST LOGIC ----------------
  useEffect(() => {
    if (open || jobs.length === 0) return;

    const interval = setInterval(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 10000);

    return () => clearInterval(interval);
  }, [jobs, open]);

  return (
    <div className="recommend-wrapper">
      {/* 1. Trigger Button (FAB) */}
      <div
        className="recommend-icon"
        onClick={() => setOpen(!open)}
        role="button"
        aria-label="Open job recommendations"
      >
        {open ? (
          <X size={24} color="#fff" />
        ) : (
          <Sparkles size={24} color="#fff" />
        )}
        {!open && jobs.length > 0 && (
          <span className="badge">{jobs.length}</span>
        )}
      </div>

      {/* 2. Toast Notification */}
      {!open && showToast && (
        <div className="recommend-toast" onClick={() => setOpen(true)}>
          <span role="img" aria-label="sparkles">
            ✨
          </span>{" "}
          Có <strong>{jobs.length}</strong> việc làm AI gợi ý cho bạn!
        </div>
      )}

      {/* 3. Main Panel */}
      <div className={`recommend-panel ${open ? "open" : ""}`}>
        {/* Panel Header */}
        <div className="panel-header">
          <h3 className="panel-title">
            <BrainCircuit size={18} className="text-indigo-500" />{" "}
            {/* Icon AI */}
            Gợi ý việc làm
            {isCache && <span className="cache-badge">Saved</span>}
          </h3>
          <button
            className="close-btn"
            onClick={() => setOpen(false)}
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Panel Content */}
        {loading ? (
          <div className="panel-loading">
            <Sparkles
              className="animate-spin"
              size={24}
              color="#6366f1"
              style={{ marginBottom: 8 }}
            />
            <p>Đang phân tích hồ sơ của bạn...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="panel-empty">
            <img
              src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png"
              alt="Empty"
              width="60"
              style={{ opacity: 0.5, marginBottom: 10 }}
            />
            <p>Chưa tìm thấy công việc phù hợp.</p>
          </div>
        ) : (
          <div className="panel-list">
            {jobs.map((job) => (
              <Link
                to={`/job/${job.job_id}`}
                key={job.job_id}
                className="panel-item"
                onClick={() => setOpen(false)}
              >
                <div className="item-header">
                  <h4 className="job-title" title={job.title}>
                    {job.title}
                  </h4>
                  <span className="job-salary">{job.salary}</span>
                </div>

                {job.reason && (
                  <div className="ai-reason">
                    <Sparkles
                      size={12}
                      color="#8b5cf6"
                      style={{ display: "inline", marginRight: 4 }}
                    />
                    {job.reason}
                  </div>
                )}

                <div className="item-meta">
                  <span className="location">
                    <MapPin size={12} /> {job.location}
                  </span>
                  {/* Bạn có thể thêm các thông tin meta khác ở đây */}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendJobs;
