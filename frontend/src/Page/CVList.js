import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/page/CVList.scss";

const CVList = () => {
  const navigate = useNavigate();
  const [cvList, setCvList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE 1: NOTIFICATION (Kết quả thành công/thất bại) ---
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // --- STATE 2: CONFIRM MODAL (Hộp thoại xác nhận xóa) ---
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    cvId: null, // Lưu ID của CV đang chờ xóa
  });

  // --- HÀM HELPER ---
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const fetchCVs = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Vui lòng đăng nhập để xem danh sách.");

      const response = await fetch("http://localhost:8080/api/cv", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.success) setCvList(result.data);
      else throw new Error(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  // --- LOGIC XÓA MỚI ---

  // Bước 1: Người dùng nhấn nút Xóa trên thẻ -> Mở Modal
  const openDeleteConfirm = (e, cvId) => {
    e.stopPropagation();
    setConfirmModal({ show: true, cvId: cvId });
  };

  // Bước 2: Người dùng nhấn Hủy trong Modal -> Đóng Modal
  const closeConfirmModal = () => {
    setConfirmModal({ show: false, cvId: null });
  };

  // Bước 3: Người dùng nhấn Đồng ý -> Gọi API Xóa
  const handleConfirmDelete = async () => {
    const { cvId } = confirmModal;
    if (!cvId) return;

    // Đóng modal xác nhận ngay lập tức để UX mượt hơn
    closeConfirmModal();

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:8080/api/cv/${cvId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCvList((prev) => prev.filter((cv) => cv.cv_id !== cvId));
        showNotification("Đã xóa CV thành công!", "success");
      } else {
        showNotification("Xóa thất bại. Vui lòng thử lại.", "error");
      }
    } catch (err) {
      showNotification("Lỗi kết nối đến máy chủ.", "error");
    }
  };

  // --- NAVIGATION ---
  const handleCreate = () => navigate("/builder");
  const handleEdit = (e, cv) => {
    e.stopPropagation();
    navigate("/builder", { state: { cvData: cv } });
  };
  const handleView = (id) => navigate(`/view-cv/${id}`);

  // --- RENDER ---
  if (loading)
    return <div className="state-container loading">Đang tải...</div>;
  if (error) return <div className="state-container error">{error}</div>;

  return (
    <div className="cv-list-page container">
      {/* 1. TOAST NOTIFICATION (Góc phải - hiển thị kết quả) */}
      {notification.show && (
        <div className={`toast-notification ${notification.type}`}>
          <div className="toast-icon">
            {notification.type === "success" ? "✔" : "✖"}
          </div>
          <div className="toast-message">{notification.message}</div>
        </div>
      )}

      {/* 2. CONFIRM MODAL (Giữa màn hình - Hỏi xác nhận) */}
      {confirmModal.show && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <div className="modal-icon">⚠️</div>
            <h3>Xác nhận xóa</h3>
            <p>
              Bạn có chắc chắn muốn xóa CV này không? Hành động này không thể
              hoàn tác.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeConfirmModal}>
                Hủy bỏ
              </button>
              <button className="btn-confirm" onClick={handleConfirmDelete}>
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT */}
      <div className="page-header">
        <h1 className="title">Danh sách CV</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Tạo CV Mới
        </button>
      </div>

      {cvList.length === 0 ? (
        <div className="empty-state">
          <h3>Bạn chưa có CV nào</h3>
          <button className="btn-primary" onClick={handleCreate}>
            Tạo ngay
          </button>
        </div>
      ) : (
        <div className="cv-grid">
          {cvList.map((cv) => (
            <div
              key={cv.cv_id}
              className="cv-card"
              onClick={() => handleView(cv.cv_id)}
            >
              <div className="cv-preview">
                <span className="cv-initials">
                  {cv.title?.charAt(0) || "C"}
                </span>
              </div>
              <div className="cv-body">
                <h3 className="cv-title">{cv.title || "CV chưa đặt tên"}</h3>
                <p className="cv-date">
                  {new Date(cv.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="cv-footer">
                <button
                  className="btn-action edit"
                  onClick={(e) => handleEdit(e, cv)}
                >
                  Sửa
                </button>
                {/* Gọi hàm mở modal thay vì xóa luôn */}
                <button
                  className="btn-action delete"
                  onClick={(e) => openDeleteConfirm(e, cv.cv_id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CVList;
