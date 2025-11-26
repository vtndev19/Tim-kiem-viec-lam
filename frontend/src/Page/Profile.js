import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/page/Profile.scss";

export default function Profile() {
  const { user: currentUser, setUser } = useContext(AuthContext);

  // =========================
  // PERSONAL INFO STATE
  // =========================
  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || "",
    email: currentUser?.email || "",
    location: currentUser?.location || "Hà Nội",
    phone: currentUser?.phone || "",
    bio: currentUser?.bio || "",
  });

  // =========================
  // PASSWORD CHANGE STATE
  // =========================
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // =========================
  // HANDLERS
  // =========================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // =========================
  // SAVE PERSONAL INFO
  // =========================
  const handleSavePersonalInfo = () => {
    const updatedUser = {
      ...currentUser,
      ...formData,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    alert("Lưu thông tin thành công!");
  };

  // =========================
  // CHANGE PASSWORD VIA API
  // =========================
  const handleSavePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        "http://localhost:8080/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            old_password: passwordData.currentPassword,
            new_password: passwordData.newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Đổi mật khẩu thất bại");
        return;
      }

      alert("Đổi mật khẩu thành công!");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      alert("Không thể kết nối máy chủ!");
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const handleCancel = () => {
    setFormData({
      full_name: currentUser?.full_name || "",
      email: currentUser?.email || "",
      location: currentUser?.location || "Hà Nội",
      phone: currentUser?.phone || "",
      bio: currentUser?.bio || "",
    });
  };

  if (!currentUser) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Vui lòng đăng nhập để xem hồ sơ</h2>
          <Link to="/login" className="btn">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>Hồ sơ cá nhân</span>
        </div>

        <div className="profile-main-layout">
          {/* LEFT SIDEBAR */}
          <div className="profile-left-sidebar">
            <div className="sidebar-card profile-user-card">
              <div className="user-avatar">
                <img
                  src={currentUser?.avatar || "/default-avatar.png"}
                  alt="Avatar"
                />
              </div>

              {/* ⭐ HIỂN THỊ TÊN NGƯỜI DÙNG */}
              <p className="user-name">
                {currentUser?.full_name || "Người dùng"}
              </p>

              <p className="user-email">{currentUser?.email}</p>

              <div className="user-status">
                <div className="status-badge">Đã xác thực</div>
              </div>

              <button className="upgrade-btn">Nâng cấp tài khoản</button>
            </div>

            {/* VERIFICATION STATUS */}
            <div className="sidebar-card verification-section">
              <div className="section-title">Trạng thái xác thực</div>

              <div className="verification-item verified">
                <span className="verification-icon">✓</span>Email đã xác thực
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="profile-right-content">
            <div className="profile-block">
              {/* PERSONAL INFO */}
              <div className="form-section">
                <h2 className="block-title">Thông tin cá nhân</h2>

                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="form-group">
                  <label>Địa điểm</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Giới thiệu bản thân</label>
                  <textarea
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Giới thiệu về bản thân..."
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSavePersonalInfo}
                  >
                    Lưu thay đổi
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancel}>
                    Hủy
                  </button>
                </div>
              </div>

              <div className="form-divider"></div>

              {/* PASSWORD CHANGE */}
              <div className="form-section">
                <h2 className="block-title">Đổi mật khẩu</h2>

                <div className="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Xác nhận mật khẩu mới"
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSavePassword}
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
