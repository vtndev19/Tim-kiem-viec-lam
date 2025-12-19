import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
import "../styles/NotificationPanel.scss";

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    targetUsers: "all",
  });
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        title: "Thành công",
        message: "Hệ thống cập nhật thành công",
        type: "success",
        createdDate: "2024-12-15",
        read: false,
      },
      {
        id: 2,
        title: "Cảnh báo",
        message: "Dung lượng server sắp đầy",
        type: "warning",
        createdDate: "2024-12-14",
        read: false,
      },
      {
        id: 3,
        title: "Lỗi",
        message: "Lỗi kết nối cơ sở dữ liệu đã xảy ra",
        type: "error",
        createdDate: "2024-12-13",
        read: true,
      },
      {
        id: 4,
        title: "Thông tin",
        message: "Bảo trì hệ thống từ 2-4 AM",
        type: "info",
        createdDate: "2024-12-12",
        read: true,
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  const handleOpenModal = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      targetUsers: "all",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newNotification = {
        id: Math.max(...notifications.map((n) => n.id), 0) + 1,
        ...formData,
        createdDate: new Date().toISOString().split("T")[0],
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      handleCloseModal();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="icon-success" />;
      case "warning":
        return <FaExclamationCircle className="icon-warning" />;
      case "error":
        return <FaTimesCircle className="icon-error" />;
      case "info":
      default:
        return <FaInfoCircle className="icon-info" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-panel">
      <div className="management-header">
        <div className="header-content">
          <h1>Quản lý thông báo</h1>
          <p>Gửi thông báo tới người dùng ({unreadCount} chưa đọc)</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <FaPlus /> Gửi thông báo
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.type} ${
                  !notification.read ? "unread" : ""
                }`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div
                  className="notification-content"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <h3 className="notification-title">{notification.title}</h3>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-date">
                    {notification.createdDate}
                  </span>
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <span className="unread-badge">New</span>
                  )}
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaBell className="empty-icon" />
            <p>Không có thông báo nào</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Gửi thông báo mới</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Tiêu đề</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tiêu đề thông báo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Nội dung</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập nội dung thông báo"
                  rows="6"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Loại thông báo</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="info">Thông tin</option>
                    <option value="success">Thành công</option>
                    <option value="warning">Cảnh báo</option>
                    <option value="error">Lỗi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="targetUsers">Gửi tới</label>
                  <select
                    id="targetUsers"
                    name="targetUsers"
                    value={formData.targetUsers}
                    onChange={handleInputChange}
                  >
                    <option value="all">Tất cả người dùng</option>
                    <option value="users">Chỉ người dùng</option>
                    <option value="recruiters">Chỉ nhà tuyển dụng</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Đang gửi..." : "Gửi thông báo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
