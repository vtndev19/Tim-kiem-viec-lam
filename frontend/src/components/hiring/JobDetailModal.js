import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./JobDetailModal.scss";

const API_BASE = "http://localhost:8080/api/jobs";

// Helper: Format ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "Không xác định";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

// Helper: Lấy headers auth
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

const JobDetailModal = ({ job, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [jobDetail, setJobDetail] = useState(job);
  const [loadingCount, setLoadingCount] = useState(false);
  const [countError, setCountError] = useState(null);

  useEffect(() => {
    if (!isOpen || !job) return;

    setJobDetail(job);
    const jobId = job.job_id || job.id;
    let mounted = true;

    const fetchJobDetail = async () => {
      setLoadingCount(true);
      setCountError(null);
      try {
        const url = `${API_BASE}/${jobId}`;
        const res = await axios.get(url, getAuthHeaders());

        if (mounted && res.data?.success) {
          setJobDetail(res.data.data);
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết job:", err);
        if (mounted) setCountError("Lỗi tải số liệu");
      } finally {
        if (mounted) setLoadingCount(false);
      }
    };

    fetchJobDetail();

    return () => {
      mounted = false;
    };
  }, [isOpen, job]);

  if (!isOpen || !jobDetail) return null;

  // Logic hiển thị số lượng ứng viên (ưu tiên dữ liệu mới nhất)
  const displayCount =
    jobDetail.total_applicants ??
    job.total_applicants ??
    job.applicant_count ??
    0;

  // Helper render danh sách (Yêu cầu/Quyền lợi) để JSX gọn hơn
  const renderListContent = (content, defaultText) => {
    if (Array.isArray(content) && content.length > 0) {
      return (
        <ul className="detail-list">
          {content.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
    return <p className="detail-text">{content || defaultText}</p>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal job-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* === HEADER === */}
        <div className="modal-header">
          <div className="header-content">
            <h2>{jobDetail.title || "Tiêu đề công việc"}</h2>
            <p className="modal-subtitle">
              @{" "}
              {jobDetail.company_name || jobDetail.company || "Công ty của bạn"}
            </p>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* === THỐNG KÊ === */}
          <div className="applicant-stats-section">
            <div className="stats-info">
              <span className="stats-label">Hồ sơ đã nộp</span>
              <span className="stats-count">
                {loadingCount ? "..." : displayCount}
              </span>
              {countError && <div className="error-text">{countError}</div>}
            </div>
            {/* Nút xem danh sách nếu cần có thể thêm ở đây */}
          </div>

          {/* === GRID THÔNG TIN CƠ BẢN === */}
          <div className="detail-section">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Mức Lương</label>
                <p>
                  {jobDetail.salary_range || jobDetail.salary || "Thỏa thuận"}
                </p>
              </div>
              <div className="detail-item">
                <label>Địa Điểm</label>
                <p>{jobDetail.location}</p>
              </div>
              <div className="detail-item">
                <label>Hạn Chót</label>
                <p>{formatDate(jobDetail.deadline)}</p>
              </div>
              <div className="detail-item">
                <label>Loại hình</label>
                <p>
                  {jobDetail.job_type || jobDetail.type || "Toàn thời gian"}
                </p>
              </div>
            </div>
          </div>

          {/* === MÔ TẢ CHI TIẾT === */}
          <div className="detail-section">
            <h3>Mô Tả Công Việc</h3>
            <p className="detail-text">
              {jobDetail.description || "Chưa có mô tả"}
            </p>
          </div>

          <div className="detail-section">
            <h3>Yêu Cầu Công Việc</h3>
            {renderListContent(
              jobDetail.requirements,
              "Không có yêu cầu cụ thể"
            )}
          </div>

          <div className="detail-section">
            <h3>Quyền Lợi</h3>
            {renderListContent(jobDetail.benefits, "Theo quy định công ty")}
          </div>

          <div className="detail-section info-section">
            <p>
              <strong>Ngày đăng:</strong>{" "}
              {formatDate(jobDetail.posted_date || jobDetail.created_at)}
            </p>
          </div>
        </div>

        {/* === FOOTER === */}
        <div className="modal-footer">
          <button onClick={onClose} className="button button-secondary">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
