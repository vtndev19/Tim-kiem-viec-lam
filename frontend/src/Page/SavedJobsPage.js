import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/page/SavedJobsPage.scss";
import { color } from "chart.js/helpers";

// --- Component Toast ---
const Toast = ({ message, type, show }) => {
  if (!show) return null;
  return (
    <div className={`toast-notification ${type} ${show ? "show" : ""}`}>
      <div className="toast-icon">{type === "success" ? "✓" : "!"}</div>
      <div className="toast-message">{message}</div>
    </div>
  );
};

// --- Component Modal Xác Nhận ---
const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h3>Xác nhận bỏ lưu</h3>
        <p>
          Bạn có chắc chắn muốn xóa công việc này khỏi danh sách đã lưu không?
        </p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 1. State lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    jobId: null,
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await axios.get("http://localhost:8080/api/saved-jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.savedJobs || res.data.data || res.data || [];
        setSavedJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        showToast("Không thể tải danh sách công việc.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, []);

  const initiateUnsave = (jobId) => setConfirmState({ isOpen: true, jobId });

  const handleConfirmUnsave = async () => {
    const { jobId } = confirmState;
    setConfirmState({ isOpen: false, jobId: null });
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:8080/api/saved-jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedJobs((prev) =>
        prev.filter((job) => (job.job_id || job.id) !== jobId)
      );
      showToast("Đã bỏ lưu công việc thành công!", "success");
    } catch (err) {
      showToast("Có lỗi xảy ra, vui lòng thử lại.", "error");
    }
  };

  // ✅ 2. LOGIC TÌM KIẾM (FILTERING)
  // Lọc danh sách dựa trên Title jobs
  const filteredJobs = savedJobs.filter((job) => {
    // Nếu không nhập gì -> Giữ nguyên danh sách
    if (!searchTerm) return true;

    // Chuẩn hóa về chữ thường để tìm kiếm không phân biệt hoa thường
    const keyword = searchTerm.toLowerCase().trim();
    const title = job.title ? job.title.toLowerCase() : "";

    // Kiểm tra xem title có chứa keyword không
    return title.includes(keyword);
  });

  // Hàm xóa nhanh từ khóa tìm kiếm
  const clearSearch = () => setSearchTerm("");

  if (loading)
    return (
      <div className="saved-jobs-page loading-center">
        <h2>Đang tải...</h2>
      </div>
    );

  return (
    <div className="saved-jobs-page">
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, jobId: null })}
        onConfirm={handleConfirmUnsave}
      />

      <div className="container">
        <div className="top-nav">
          <Link to="/" className="back-link-simple">
            ← Quay lại trang chủ
          </Link>
        </div>

        <div className="saved-layout">
          {/* === CỘT TRÁI: TÌM KIẾM === */}
          <aside className="saved-sidebar left">
            <div className="sidebar-header">
              <h3>Tìm kiếm</h3>
            </div>

            {/* ✅ 3. Gắn State vào Input */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Nhập tiêu đề công việc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Nếu có chữ thì hiện nút X để xóa, không thì hiện kính lúp */}
              {searchTerm ? (
                <i className="clear-icon" onClick={clearSearch}>
                  ✕
                </i>
              ) : (
                <i className="search-icon"></i>
              )}
            </div>

            <div className="info-box">
              <p>
                <strong>Mẹo:</strong> Nhập từ khóa để lọc nhanh các công việc
                bạn đã lưu trong danh sách.
              </p>
            </div>
          </aside>

          {/* === CỘT GIỮA: DANH SÁCH (Dùng filteredJobs) === */}
          <main className="saved-main">
            <div className="main-header-fixed">
              <h1>Công việc đã lưu</h1>
              {/* Hiển thị số lượng dựa trên kết quả tìm kiếm */}
              <p className="subtitle">
                {searchTerm
                  ? `Tìm thấy ${filteredJobs.length} kết quả cho "${searchTerm}"`
                  : `Đang quan tâm (${savedJobs.length})`}
              </p>
            </div>

            <div className="scrollable-list">
              {savedJobs.length === 0 ? (
                <div className="empty-state">
                  <p>Bạn chưa lưu công việc nào.</p>
                  <Link to="/jobs">Tìm việc ngay</Link>
                </div>
              ) : filteredJobs.length === 0 ? (
                // ✅ Hiển thị khi tìm kiếm không ra kết quả
                <div className="empty-state">
                  <img
                    src="/images/no-result.png"
                    alt=""
                    style={{
                      width: "60px",
                      opacity: 0.5,
                      marginBottom: "10px",
                    }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <p>Không tìm thấy công việc nào có tên "{searchTerm}"</p>
                  <button className="btn-clear-filter" onClick={clearSearch}>
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <div className="job-list-grid">
                  {/* ✅ Render danh sách đã lọc */}
                  {filteredJobs.map((job) => (
                    <div
                      key={job.job_id || job.id}
                      className="job-card-compact"
                    >
                      <div className="card-top">
                        <div className="top-info">
                          <Link
                            to={`/job/${job.job_id || job.id}`}
                            className="job-title"
                          >
                            {job.title}
                          </Link>
                          <span className="job-salary">{job.salary}</span>
                        </div>
                        <button
                          className="btn-delete-red"
                          onClick={(e) => {
                            e.preventDefault();
                            initiateUnsave(job.job_id || job.id);
                          }}
                        >
                          Xóa
                        </button>
                      </div>

                      <div className="card-mid">
                        <p className="company-name">🏢 {job.company}</p>
                      </div>

                      <div className="card-bot">
                        <div className="meta-info">
                          <span>📍 {job.location}</span>
                          <span className="date">
                            🕒{" "}
                            {job.saved_at
                              ? new Date(job.saved_at).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "Mới đây"}
                          </span>
                        </div>
                        <Link
                          to={`/job/${job.job_id || job.id}`}
                          className="btn-view-detail"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* === CỘT PHẢI === */}
          <aside className="saved-sidebar right">
            <div className="ad-box">
              <h4>Quảng cáo</h4>
              <p>Nâng cấp VIP để ứng tuyển nhanh.</p>
              <button>Xem ngay</button>
            </div>
            <div className="ad-box secondary">
              <p>Tạo CV chuyên nghiệp miễn phí</p>
              <button className="link-btn">
                <Link
                  to="/cv"
                  style={{ textDecoration: "none", color: "white" }}
                >
                  Tạo ngay
                </Link>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SavedJobsPage;
