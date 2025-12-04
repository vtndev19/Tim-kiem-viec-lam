import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./JobDetailModal.scss";

// CẬP NHẬT 1: Trỏ đúng vào route lấy chi tiết Job (Route này đã trả về cả số lượng)
const API_BASE = "http://localhost:8080/api/jobs";

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

  // State lưu trữ dữ liệu job mới nhất (bao gồm số lượng ứng viên)
  const [jobDetail, setJobDetail] = useState(job);
  const [loadingCount, setLoadingCount] = useState(false);
  const [countError, setCountError] = useState(null);

  useEffect(() => {
    if (!isOpen || !job) return;

    // Reset lại job detail bằng job props ban đầu khi mở modal
    setJobDetail(job);

    const jobId = job.job_id || job.id;
    let mounted = true;

    const fetchJobDetail = async () => {
      setLoadingCount(true);
      setCountError(null);

      try {
        // CẬP NHẬT 2: Gọi API chi tiết job (đã bao gồm count trong backend)
        const url = `${API_BASE}/${jobId}`;
        const res = await axios.get(url, getAuthHeaders());

        if (!mounted) return;

        if (res.data && res.data.success) {
          // Backend trả về: { success: true, data: { ..., total_applicants: 5 } }
          setJobDetail(res.data.data);
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết job:", err);
        if (!mounted) return;
        setCountError("Không cập nhật được số liệu");
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

  // Helper hiển thị ngày
  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleViewApplicantsClick = () => {
    onClose();
    const jobId = jobDetail.job_id || jobDetail.id;
    navigate(`/recruiter-dashboard/${jobId}`);
  };

  // CẬP NHẬT 3: Lấy số lượng từ dữ liệu mới fetch được hoặc fallback về dữ liệu cũ
  const displayCount =
    jobDetail.total_applicants ??
    job.total_applicants ??
    job.applicant_count ??
    0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal job-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* === HEADER === */}
        <div className="modal-header">
          <div>
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
          {/* === SECTION THỐNG KÊ (GIỮ NGUYÊN HTML) === */}
          <div
            className="applicant-stats-section"
            style={{
              background: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #e9ecef",
            }}
          >
            <div className="stats-info">
              <span
                className="stats-label"
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  color: "#6c757d",
                }}
              >
                Hồ sơ đã nộp
              </span>
              <span
                className="stats-count"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#0d6efd",
                }}
              >
                {/* Logic hiển thị loading hoặc số lượng */}
                {loadingCount ? "..." : displayCount}
              </span>
              {countError && (
                <div style={{ color: "#ef4444", fontSize: "0.8rem" }}>
                  {countError}
                </div>
              )}
            </div>

            <button
              className="button button-view-applicants"
              onClick={handleViewApplicantsClick}
              style={{
                backgroundColor: "#0d6efd",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Xem danh sách hồ sơ →
            </button>
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

          {/* === CÁC PHẦN MÔ TẢ CHI TIẾT === */}
          <div className="detail-section">
            <h3>Mô Tả Công Việc</h3>
            {/* Sử dụng jobDetail để nội dung cập nhật mới nhất nếu có thay đổi */}
            <p className="detail-text" style={{ whiteSpace: "pre-line" }}>
              {jobDetail.description || "Chưa có mô tả"}
            </p>
          </div>

          <div className="detail-section">
            <h3>Yêu Cầu Công Việc</h3>
            <div className="detail-text" style={{ whiteSpace: "pre-line" }}>
              {/* Xử lý hiển thị mảng hoặc chuỗi cho Requirements */}
              {Array.isArray(jobDetail.requirements) ? (
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {jobDetail.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              ) : (
                jobDetail.requirements || "Không có yêu cầu cụ thể"
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>Quyền Lợi</h3>
            <div className="detail-text" style={{ whiteSpace: "pre-line" }}>
              {/* Xử lý hiển thị mảng hoặc chuỗi cho Benefits */}
              {Array.isArray(jobDetail.benefits) ? (
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {jobDetail.benefits.map((ben, idx) => (
                    <li key={idx}>{ben}</li>
                  ))}
                </ul>
              ) : (
                jobDetail.benefits || "Theo quy định công ty"
              )}
            </div>
          </div>

          <div className="detail-section info-section">
            <p>
              <strong>Ngày đăng:</strong>{" "}
              {formatDate(jobDetail.posted_date || jobDetail.created_at)}
            </p>
          </div>
        </div>

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
