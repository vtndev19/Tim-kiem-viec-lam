import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import notificationIcon from "../assets/images/notification-bell.png";
import "../styles/components/Notification.scss";

const API_NOTIFICATIONS = "http://localhost:8080/api/notifications";

const Notification = () => {
  const [hasNotification, setHasNotification] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notificationRef = useRef(null);
  const socketRef = useRef(null);

  // 1. Click outside để đóng popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Kết nối Socket & Lắng nghe thông báo
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (currentUser && currentUser.user_id) {
      socketRef.current = io("http://localhost:8080");
      const roomName = `room_user_${currentUser.user_id}`;
      socketRef.current.emit("join_room", roomName);

      socketRef.current.on("new_notification", (data) => {
        setHasNotification(true);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 1000);

        setNotifications((prev) => [
          {
            id: data.notification_id || Date.now(),
            message: data.message,
            time: data.created_at,
            is_read: false,
          },
          ...prev,
        ]);
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // 3. Lấy dữ liệu API ban đầu
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const res = await axios.get(API_NOTIFICATIONS, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const formattedData = res.data.data.map((n) => ({
            id: n.notification_id,
            message: n.message,
            time: n.created_at,
            is_read: n.is_read === 1,
          }));
          setNotifications(formattedData);
          setHasNotification(formattedData.some((n) => !n.is_read));
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };
    fetchNotifications();
  }, []);

  const handleBellClick = () => {
    setHasNotification(false);
    setShowNotifications((prev) => !prev);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="notification-wrapper" ref={notificationRef}>
      <div
        className={`notification-bell ${isShaking ? "shake" : ""}`}
        onClick={handleBellClick}
      >
        <img src={notificationIcon} alt="Thông báo" />
        {unreadCount > 0 && (
          <span className="badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {showNotifications && (
        <div className="notification-popup">
          <div className="popup-header">Thông báo</div>
          <ul className="popup-list">
            {notifications.length === 0 ? (
              <li className="empty">Không có thông báo nào</li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className={n.is_read ? "read" : "unread"}>
                  <p className="msg">{n.message}</p>
                  <span className="time">
                    {new Date(n.time).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notification;
