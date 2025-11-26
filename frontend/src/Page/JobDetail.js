import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/page/JobDetail.scss";

const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ✅ Lấy thông tin chi tiết công việc
  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/jobs/${jobId}`);
        if (!response.ok) throw new Error("Không thể tải dữ liệu công việc!");
        const data = await response.json();

        if (data) setJob(data);
        else setError("Không tìm thấy công việc này!");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);

  // ✅ Hàm lưu công việc yêu thích
  const handleSaveJob = async () => {
    if (saved || saving) return;
    setSaving(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Vui lòng đăng nhập để lưu công việc!");
        setSaving(false);
        return;
      }

      // 🧩 Gửi request đúng theo route backend /api/saved-jobs/:jobId
      const res = await fetch(`http://localhost:8080/api/saved-jobs/${jobId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSaved(true);
        alert("✅ Đã lưu công việc vào danh sách yêu thích!");
      } else {
        alert(data.message || "Không thể lưu công việc.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lưu công việc:", error);
      alert("Đã xảy ra lỗi khi lưu công việc.");
    } finally {
      setSaving(false);
    }
  };

  // 🕓 Loading
  if (loading) {
    return (
      <div className="job-detail-page container">
        <h2>Đang tải dữ liệu...</h2>
      </div>
    );
  }

  // ⚠️ Lỗi hoặc không tìm thấy
  if (error || !job) {
    return (
      <div className="job-detail-page container">
        <h2>Không tìm thấy công việc</h2>
        <p>
          {error || "Công việc bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
        </p>
        <Link to="/" className="back-link">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // ✅ Hiển thị nội dung chi tiết
  return (
    <div className="job-detail-page container">
      <div className="job-detail-header">
        <h1>{job.title}</h1>
        <div className="header-meta">
          <span className="company-name">{job.company}</span>
          <span className="location">{job.location}</span>
        </div>
        <div className="salary-type">
          <span className="salary">{job.salary}</span>
          <span className="job-type">{job.type}</span>
        </div>

        {/* Hai nút cùng hàng */}
        <div className="job-detail-buttons">
          <button className="apply-now-btn">Ứng tuyển ngay</button>
          <button
            className={`save-job-btn ${saved ? "saved" : ""}`}
            onClick={handleSaveJob}
            disabled={saving}
          >
            {saved ? "★ Đã lưu" : "☆ Lưu công việc"}
          </button>
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-section">
          <h2>Mô tả công việc</h2>
          <p>{job.description}</p>
        </div>

        <div className="job-section">
          <h2>Yêu cầu ứng viên</h2>
          <ul>
            {job.requirements?.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        <div className="job-section">
          <h2>Quyền lợi</h2>
          <ul>
            {job.benefits?.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="job-detail-footer">
        <p>
          Đăng ngày: {new Date(job.posted_date).toLocaleDateString("vi-VN")}
        </p>
        <Link to="/" className="back-link">
          ← Quay lại danh sách
        </Link>
      </div>
    </div>
  );
};

export default JobDetail;
