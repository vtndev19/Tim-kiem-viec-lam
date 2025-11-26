// src/pages/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/page/Register.scss"; // ✅ import file SCSS
import registerBack from "../assets/images/registerBack.png"; // ✅ import ảnh nền

export default function Register() {
  // State cho các trường input
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // State cho việc xử lý logic
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Xóa lỗi cũ

    // --- Kiểm tra dữ liệu đầu vào ---
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!agreedToTerms) {
      setError("Bạn phải đồng ý với Điều khoản dịch vụ để tiếp tục.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        {
          full_name: `${firstName} ${lastName}`, // Ghép họ và tên
          email,
          password,
        }
      );

      // Đăng ký thành công, lưu token và chuyển hướng
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/"); // Chuyển về trang chủ
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-page"
      style={{
        backgroundImage: `url(${registerBack})`, // ✅ ảnh nền động
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="register-container">
        <div className="register-header">
          <h2>Tạo tài khoản</h2>
          <p>Bắt đầu hành trình tìm kiếm việc làm của bạn</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Hiển thị thông báo lỗi nếu có */}
          {error && (
            <div
              className="error-message"
              style={{
                color: "red",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Họ</label>
              <input
                id="firstName"
                type="text"
                placeholder="Nhập họ của bạn"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Tên</label>
              <input
                id="lastName"
                type="text"
                placeholder="Nhập tên của bạn"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group password-field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="Tạo mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group password-field">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="terms">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <label htmlFor="terms">
              Tôi đồng ý với <Link to="/terms">Điều khoản dịch vụ</Link>
            </label>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>

          <div className="login-link">
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
