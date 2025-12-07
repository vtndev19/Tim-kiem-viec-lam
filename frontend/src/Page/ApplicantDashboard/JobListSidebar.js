import React from "react";
import "./styles/JobListSidebar.scss"; // Bạn tự style CSS cho đẹp (width: 300px, overflow-y: auto)

const JobListSidebar = ({ jobs, selectedJobId, onSelectJob, loading }) => {
  if (loading)
    return <div className="sidebar-loading">Đang tải danh sách...</div>;

  return (
    <div className="job-sidebar">
      <div className="sidebar-header">
        <h3>Việc làm của tôi ({jobs.length})</h3>
      </div>
      <div className="job-list">
        {jobs.length === 0 ? (
          <p className="empty-msg">Chưa có tin tuyển dụng nào</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.job_id}
              className={`job-item ${
                selectedJobId === job.job_id ? "active" : ""
              }`}
              onClick={() => onSelectJob(job)}
            >
              <div className="job-title">{job.title}</div>
              <div className="job-meta">
                <span className={`status-dot ${job.status || "open"}`}></span>
                {/* <span className="count-badge">
                  {job.application_count || 0} hồ sơ
                </span> */}
              </div>
              <div className="job-date">
                {new Date(job.posted_date).toLocaleDateString("vi-VN")}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobListSidebar;
