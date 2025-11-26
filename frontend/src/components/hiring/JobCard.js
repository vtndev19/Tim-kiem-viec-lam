import React from "react";
import "./JobCard.scss";

const JobCard = ({ job, onEdit, onDelete, onViewDetail }) => {
  return (
    <div className="job-card card fade-in-up">
      <div className="job-card-header">
        <div className="job-info">
          <h3 className="job-title">{job.jobTitle}</h3>
          <p className="company-name">@ {job.companyName}</p>
        </div>
        <span className="job-badge">Đang tuyển</span>
      </div>

      <div className="job-card-body">
        <div className="job-meta">
          <div className="meta-item">
            <span className="meta-icon"></span>
            <span className="meta-text">{job.salary}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon"></span>
            <span className="meta-text">{job.location}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon"></span>
            <span className="meta-text">Hạn: {job.deadline}</span>
          </div>
        </div>

        <div className="job-description">
          <p>{job.description.substring(0, 120)}...</p>
        </div>

        <div className="job-tags">
          <span className="tag">{job.applicants || 0} ứng viên</span>
          <span className="tag">Đăng: {job.createdAt}</span>
        </div>
      </div>

      <div className="job-card-footer">
        <button
          onClick={() => onViewDetail(job)}
          className="button button-secondary button-small"
        >
          Chi Tiết
        </button>
        <button
          onClick={() => onEdit(job)}
          className="button button-primary button-small"
        >
          Sửa
        </button>
        <button
          onClick={() => onDelete(job.id)}
          className="button button-danger button-small"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};

export default JobCard;
