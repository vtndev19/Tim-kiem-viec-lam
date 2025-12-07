import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ApplyModal from "../components/Applications/ApplyModal";
import "../styles/page/JobDetail.scss";

// Component Toast nhỏ gọn nằm trong file (hoặc tách ra file riêng nếu muốn tái sử dụng)
const Toast = ({ message, type, show }) => {
  if (!show) return null;
  return (
    <div className={`toast-notification ${type} ${show ? "show" : ""}`}>
      <div className="toast-icon">{type === "success" ? "✓" : "!"}</div>
      <div className="toast-message">{message}</div>
    </div>
  );
};

const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // State cho Toast
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // State điều khiển Modal
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);

  // Hàm hiển thị Toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    // Tự động tắt sau 3 giây
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // 1. Lấy thông tin chi tiết công việc
  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/jobs/${jobId}`);
        if (!response.ok) throw new Error("Không thể tải dữ liệu công việc!");

        const resData = await response.json();
        const jobData = resData.data || resData;

        if (jobData) {
          setJob(jobData);
        } else {
          setError("Không tìm thấy dữ liệu công việc!");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);

  // 2. KIỂM TRA TRẠNG THÁI ĐÃ LƯU (Sửa lại logic này)
  useEffect(() => {
    const checkSavedStatus = async () => {
      const token = localStorage.getItem("authToken");
      // Nếu chưa đăng nhập thì thôi, không cần check
      if (!token) return;

      try {
        // Gọi API lấy danh sách TẤT CẢ công việc đã lưu của user
        // (Thay vì gọi /check/id có thể gây lỗi 404 nếu backend không hỗ trợ)
        const res = await fetch(`http://localhost:8080/api/saved-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const resData = await res.json();

          // 👇 QUAN TRỌNG: Kiểm tra cấu trúc dữ liệu Backend trả về
          // Trường hợp 1: Backend trả về mảng trực tiếp: [{job_id: 1}, {job_id: 2}]
          let listSaved = resData;

          // Trường hợp 2: Backend trả về object: { success: true, data: [...] }
          if (resData.data && Array.isArray(resData.data)) {
            listSaved = resData.data;
          } else if (resData.saved_jobs) {
            listSaved = resData.saved_jobs;
          }

          if (Array.isArray(listSaved)) {
            // Kiểm tra xem jobId hiện tại có nằm trong danh sách đã lưu không
            // Lưu ý: So sánh bằng String để tránh lỗi '1' khác 1
            const isExist = listSaved.some(
              (item) => String(item.job_id || item.id) === String(jobId)
            );

            if (isExist) {
              setSaved(true);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái lưu:", error);
      }
    };

    if (jobId) {
      checkSavedStatus();
    }
  }, [jobId]);
  // 3. Hàm lưu công việc
  const handleSaveJob = async () => {
    // Nếu đã lưu rồi thì không làm gì hoặc có thể làm logic Bỏ lưu (Unsave)
    if (saved) return;
    if (saving) return;

    setSaving(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Vui lòng đăng nhập để lưu công việc!", "error");
        setSaving(false);
        return;
      }

      const res = await fetch(`http://localhost:8080/api/saved-jobs/${jobId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSaved(true); // Cập nhật trạng thái nút sang màu xanh
        showToast("Đã lưu công việc vào danh sách yêu thích!", "success");
      } else {
        showToast(data.message || "Không thể lưu công việc.", "error");
      }
    } catch (error) {
      console.error("Lỗi khi lưu công việc:", error);
      showToast("Đã xảy ra lỗi kết nối.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="job-detail-page container">
        <h2>Đang tải dữ liệu...</h2>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail-page container">
        <h2>Không tìm thấy công việc</h2>
        <p>{error || "Công việc không tồn tại."}</p>
        <Link to="/" className="back-link">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="job-detail-page container">
      {/* Toast Notification Component */}
      <Toast message={toast.message} type={toast.type} show={toast.show} />

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

        <div className="job-detail-buttons">
          <button className="btn-apply" onClick={() => setApplyModalOpen(true)}>
            Ứng tuyển ngay
          </button>

          <ApplyModal
            isOpen={isApplyModalOpen}
            onClose={() => setApplyModalOpen(false)}
            jobId={jobId}
            jobTitle={job.title}
          />

          {/* Logic hiển thị nút Lưu */}
          <button
            className={`save-job-btn ${saved ? "saved" : ""}`}
            onClick={handleSaveJob}
            disabled={saving || saved} // Disable nếu đang lưu hoặc đã lưu
          >
            {saving ? (
              "Đang xử lý..."
            ) : saved ? (
              <>
                <span style={{ marginRight: "5px" }}>✓</span> Đã lưu
              </>
            ) : (
              <>
                <span style={{ marginRight: "5px" }}>♥</span> Lưu công việc
              </>
            )}
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
            {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
              job.requirements.map((req, index) => <li key={index}>{req}</li>)
            ) : (
              <li>Không có yêu cầu cụ thể</li>
            )}
          </ul>
        </div>

        <div className="job-section">
          <h2>Quyền lợi</h2>
          <ul>
            {Array.isArray(job.benefits) && job.benefits.length > 0 ? (
              job.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))
            ) : (
              <li>Không có thông tin quyền lợi</li>
            )}
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
