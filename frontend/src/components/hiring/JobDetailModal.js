import React from "react";
import "./JobDetailModal.scss";

const JobDetailModal = ({ job, isOpen, onClose }) => {
  if (!isOpen || !job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal job-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>{job.jobTitle}</h2>
            <p className="modal-subtitle">@ {job.companyName}</p>
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
                <p>{job.salary}</p>
              </div>
              <div className="detail-item">
                <label>📍 Địa Điểm</label>
                <p>{job.location}</p>
              </div>
              <div className="detail-item">
                <label>📅 Hạn Chót</label>
                <p>{job.deadline}</p>
              </div>
              <div className="detail-item">
                <label>👥 Ứng Viên</label>
                <p>{job.applicants || 0} người</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>📋 Mô Tả Công Việc</h3>
            <p className="detail-text">{job.description}</p>
          </div>

          <div className="detail-section">
            <h3>⭐ Yêu Cầu Công Việc</h3>
            <p className="detail-text">{job.requirements}</p>
          </div>

          <div className="detail-section">
            <h3>🎁 Lợi Ích Công Việc</h3>
            <p className="detail-text">{job.benefits}</p>
          </div>

          <div className="detail-section info-section">
            <p>
              <strong>Ngày đăng:</strong> {job.createdAt}
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
