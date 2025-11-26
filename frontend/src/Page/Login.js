import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/page/Login.scss";

import backLogin from "../assets/images/loginBack.png";
import googleIcon from "../assets/images/google.png";
import facebookIcon from "../assets/images/facebook.png";
import githubIcon from "../assets/images/github.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        const token = localStorage.getItem("authToken");

        // ✅ Gọi API lưu lịch sử đăng nhập
        try {
          await axios.post(
            "http://localhost:8080/api/searchHistory/save",
            { action: "Đăng nhập hệ thống" },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("🟢 Đã lưu lịch sử đăng nhập thành công!");
        } catch (saveErr) {
          console.warn("⚠️ Không thể lưu lịch sử đăng nhập:", saveErr.message);
        }

        navigate("/");
      } else {
        setError(result.message || "Đăng nhập thất bại, vui lòng thử lại.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div
        className="login-background"
        style={{ backgroundImage: `url(${backLogin})` }}
      >
        <div className="login-overlay">
          <div className="login-container">
            <div className="login-header">
              <h2>Đăng nhập</h2>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  className="error-message"
                  style={{
                    color: "red",
                    textAlign: "center",
                    marginBottom: "1rem",
                  }}
                >
                  {error}
                </div>
              )}

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

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="remember-forgot">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Ghi nhớ tôi</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">
                  Quên mật khẩu?
                </Link>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>

              <div className="social-login">
                <p>Hoặc đăng nhập với</p>
                <div className="social-buttons">
                  <button type="button">
                    <img src={googleIcon} alt="Google" />
                  </button>
                  <button type="button">
                    <img src={facebookIcon} alt="Facebook" />
                  </button>
                  <button type="button">
                    <img src={githubIcon} alt="GitHub" />
                  </button>
                </div>
              </div>

              <div className="register-link">
                <p>
                  Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
