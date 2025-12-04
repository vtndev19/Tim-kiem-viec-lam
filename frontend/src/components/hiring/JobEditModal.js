import React from "react";
import "./JobDetailModal.scss";

const JobDetailModal = ({ job, isOpen, onClose }) => {
  if (!isOpen || !job) return null;

  // Helper format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal job-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            {/* ✅ SỬA: job.title */}
            <h2>{job.title || "Tiêu đề công việc"}</h2>
            {/* ✅ SỬA: job.company_name nếu join bảng, hoặc fallback */}
            <p className="modal-subtitle">
              @ {job.company_name || job.company || "Công ty của bạn"}
            </p>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <div className="detail-grid">
              <div className="detail-item">
                <label>💰 Mức Lương</label>
                {/* ✅ SỬA: salary_range */}
                <p>{job.salary_range || job.salary || "Thỏa thuận"}</p>
              </div>
              <div className="detail-item">
                <label>📍 Địa Điểm</label>
                <p>{job.location}</p>
              </div>
              <div className="detail-item">
                <label>📅 Hạn Chót</label>
                <p>{formatDate(job.deadline)}</p>
              </div>
              <div className="detail-item">
                <label>📝 Loại hình</label>
                <p>{job.job_type || "Toàn thời gian"}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>📋 Mô Tả Công Việc</h3>
            <p className="detail-text">{job.description || "Chưa có mô tả"}</p>
          </div>

          <div className="detail-section">
            <h3>⭐ Yêu Cầu Công Việc</h3>
            <p className="detail-text">
              {job.requirements || "Không có yêu cầu cụ thể"}
            </p>
          </div>

          <div className="detail-section">
            <h3>🎁 Quyền Lợi</h3>
            {/* ✅ SỬA: benefits */}
            <p className="detail-text">
              {job.benefits || "Theo quy định công ty"}
            </p>
          </div>

          <div className="detail-section info-section">
            <p>
              <strong>Ngày đăng:</strong>{" "}
              {formatDate(job.posted_date || job.created_at)}
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="button button-primary">
            ✓ Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
