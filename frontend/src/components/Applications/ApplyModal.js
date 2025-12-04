import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, CheckCircle, AlertCircle } from "lucide-react"; // Thêm icon cho toast
import "./style/ApplyModal.scss";

const ApplyModal = ({ isOpen, onClose, jobId, jobTitle }) => {
  const [cvList, setCvList] = useState([]);
  const [formData, setFormData] = useState({
    cv_id: "",
    email: "",
    phone: "",
    cover_letter: "",
  });
  const [loading, setLoading] = useState(false);

  // --- STATE CHO TOAST ---
  const [toast, setToast] = useState(null); // null | { message, type: 'success' | 'error' }

  // Reset toast khi đóng/mở modal
  useEffect(() => {
    if (isOpen) {
      fetchUserCVs();
      setToast(null);
    }
  }, [isOpen]);

  // Tự động tắt toast sau 3 giây
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchUserCVs = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:8080/api/cv", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setCvList(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải CV:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobId) {
      setToast({ message: "Lỗi: Không tìm thấy ID công việc!", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      await axios.post(
        "http://localhost:8080/api/applications/apply",
        {
          ...formData,
          job_id: jobId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ THAY THẾ ALERT BẰNG TOAST SUCCESS
      setToast({
        message: "Ứng tuyển thành công! Vui lòng kiểm tra email.",
        type: "success",
      });

      // Đợi 2 giây để người dùng đọc thông báo rồi mới đóng Modal
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Lỗi:", error);
      // ✅ THAY THẾ ALERT BẰNG TOAST ERROR
      setToast({
        message:
          error.response?.data?.message || "Lỗi ứng tuyển, vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {/* --- PHẦN HIỂN THỊ TOAST --- */}
      {toast && (
        <div className={`custom-toast ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
          </div>
          <span className="toast-text">{toast.message}</span>
        </div>
      )}

      <div className="modal-content">
        <div className="modal-header">
          <h3>Ứng tuyển: {jobTitle}</h3>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Chọn CV */}
          <div className="form-group">
            <label>Chọn CV của bạn (*)</label>
            <select
              name="cv_id"
              required
              onChange={handleChange}
              value={formData.cv_id}
            >
              <option value="">-- Chọn CV --</option>
              {cvList.map((cv) => (
                <option key={cv.cv_id} value={cv.cv_id}>
                  {cv.title}
                </option>
              ))}
            </select>
            {cvList.length === 0 && (
              <small className="error-hint">
                Bạn chưa có CV nào. Hãy tạo CV trước!
              </small>
            )}
          </div>

          {/* 2. Thông tin liên hệ */}
          <div className="form-row">
            <div className="form-group">
              <label>Email liên hệ (*)</label>
              <input
                type="email"
                name="email"
                required
                placeholder="VD: name@gmail.com"
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại (*)</label>
              <input
                type="text"
                name="phone"
                required
                placeholder="VD: 0912345678"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 3. Thư giới thiệu */}
          <div className="form-group">
            <label>Thư giới thiệu (Optional)</label>
            <textarea
              name="cover_letter"
              rows="4"
              placeholder="Viết đôi lời gửi tới nhà tuyển dụng..."
              onChange={handleChange}
            ></textarea>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || cvList.length === 0}
          >
            {loading ? "Đang gửi..." : "Gửi hồ sơ ứng tuyển"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
