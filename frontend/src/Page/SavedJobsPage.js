import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/page/SavedJobsPage.scss";

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Lấy danh sách công việc đã lưu
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Vui lòng đăng nhập để xem danh sách công việc đã lưu.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:8080/api/saved-jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSavedJobs(res.data.savedJobs || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách công việc đã lưu:", err);
        setError("Không thể tải danh sách công việc đã lưu.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  // ✅ Hàm bỏ lưu công việc
  const handleUnsave = async (jobId) => {
    if (!window.confirm("Bạn có chắc muốn bỏ lưu công việc này?")) return;

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:8080/api/saved-jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSavedJobs((prev) => prev.filter((job) => job.job_id !== jobId));
      alert("🗑️ Đã bỏ lưu công việc.");
    } catch (err) {
      console.error("❌ Lỗi khi bỏ lưu:", err);
      alert("Không thể bỏ lưu công việc. Vui lòng thử lại.");
    }
  };

  // 🕓 Loading
  if (loading) {
    return (
      <div className="saved-jobs-page container">
        <h2>Đang tải danh sách công việc...</h2>
      </div>
    );
  }

  // ⚠️ Không có dữ liệu
  if (error || savedJobs.length === 0) {
    return (
      <div className="saved-jobs-page container">
        <h2>Danh sách công việc đã lưu</h2>
        <p>{error || "Bạn chưa lưu công việc nào."}</p>
        <Link to="/" className="back-link">
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // ✅ Danh sách công việc đã lưu
  return (
    <div className="saved-jobs-page container">
      <h1>Công việc đã lưu</h1>

      <div className="job-list">
        {savedJobs.map((job) => (
          <div key={job.job_id} className="job-card">
            <div className="job-info">
              <h2>
                <Link
                  to={`/job/${job.id}`}
                  key={job.id}
                  className="job-title-link"
                >
                  {job.title}
                </Link>
              </h2>
              <p className="company">{job.company}</p>
              <p className="location">{job.location}</p>
              <p className="salary">{job.salary}</p>
              <p className="saved-at">
                Lưu ngày:{" "}
                {new Date(job.saved_at).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="job-actions">
              <Link to={`/job/${job.id}`} key={job.id} className="detail-btn">
                Xem chi tiết
              </Link>
              <button
                className="unsave-btn"
                onClick={() => handleUnsave(job.job_id)}
              >
                Bỏ lưu
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link to="/" className="back-link">
        ← Quay lại trang chủ
      </Link>
    </div>
  );
};

export default SavedJobsPage;
