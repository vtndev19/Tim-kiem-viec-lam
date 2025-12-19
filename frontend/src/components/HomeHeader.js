import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/components/HomeHeader.scss";
import db from "../data/db.json";
import { AuthContext } from "../context/AuthContext";

export default function HomeHeader({ siteName }) {
  const { user, logout } = useContext(AuthContext);
  const [industries, setIndustries] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isUserMenuVisible, setUserMenuVisible] = useState(false);

  // State lưu role người dùng
  const [userRole, setUserRole] = useState(null);

  const userMenuRef = useRef(null);
  const loc = useLocation();
  const navigate = useNavigate();

  // Load danh sách ngành nghề từ db.json
  useEffect(() => {
    setIndustries(db.industries || []);
  }, []);

  // --- HÀM GIẢI MÃ TOKEN (Logic gốc) ---
  const getUserRoleFromToken = () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return null;

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const parsedToken = JSON.parse(jsonPayload);
      return parsedToken.role ? parsedToken.role.toString() : null;
    } catch (error) {
      console.error("Lỗi khi đọc token:", error);
      return null;
    }
  };

  // --- CẬP NHẬT ROLE ---
  useEffect(() => {
    if (user) {
      // Ưu tiên lấy role từ object user (nếu Context đã có), nếu không thì decode token
      const role = user.role || getUserRoleFromToken();
      // Chuẩn hóa về chữ thường
      setUserRole(role ? role.toLowerCase() : null);
    } else {
      setUserRole(null);
    }
  }, [user]);

  // --- CLICK OUTSIDE ĐỂ ĐÓNG MENU ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 1. ĐỊNH NGHĨA HÀM LOGOUT TRƯỚC ĐỂ SỬ DỤNG TRONG CHECK TOKEN ---
  const handleLogout = () => {
    console.log("Đang đăng xuất do người dùng click hoặc token hết hạn...");
    logout(); // Xóa user trong context và localStorage
    setUserMenuVisible(false);
    setUserRole(null);
    navigate("/login"); // Chuyển về trang login thay vì trang chủ để user biết cần đăng nhập lại
  };
  return (
    <header className="header">
      <div className="header-inner container">
        {/* Logo */}
        <div className="brand">
          <Link to="/">
            <h1>{siteName}</h1>
          </Link>
        </div>

        {/* Navbar */}
        <nav className="nav">
          <Link className={loc.pathname === "/" ? "active" : ""} to="/">
            Trang chủ
          </Link>

          {/* Menu Việc làm */}
          <div
            className="jobs-menu-item"
            onMouseEnter={() => setDropdownVisible(true)}
            onMouseLeave={() => setDropdownVisible(false)}
          >
            <Link to="/jobs">Việc làm</Link>
            {isDropdownVisible && (
              <div className="jobs-dropdown">
                <ul>
                  {industries.map((industry) => (
                    <li key={industry.id}>
                      <Link to={`/jobs/industry/${industry.id}`}>
                        {industry.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link
            className={loc.pathname.startsWith("/companies") ? "active" : ""}
            to="/companies-landing"
          >
            Công ty
          </Link>

          <Link className={loc.pathname === "/blog" ? "active" : ""} to="/blog">
            Blog
          </Link>

          <Link className={loc.pathname === "/cv" ? "active" : ""} to="/cv">
            Tạo CV
          </Link>
        </nav>

        {/* User Auth */}
        <div className="auth">
          {!user ? (
            <>
              <Link className="btn" to="/login">
                Đăng nhập
              </Link>
              <Link className="btn outline" to="/register">
                Đăng ký
              </Link>
            </>
          ) : (
            <div className="user-menu" ref={userMenuRef}>
              <div
                className="user-avatar"
                onClick={() => setUserMenuVisible(!isUserMenuVisible)}
              >
                <img
                  src={user.avatar || "/images/default-avatar.png"}
                  alt="avatar"
                />
                <span>{user.full_name || user.name || user.email}</span>
              </div>

              {isUserMenuVisible && (
                <div className="user-dropdown">
                  <ul>
                    <li>
                      <Link to="/profile">Thông tin tài khoản</Link>
                    </li>
                    <li>
                      <Link to="/saved-jobs">Việc làm đã lưu</Link>
                    </li>

                    {/* MENU CHO NHÀ TUYỂN DỤNG (RECRUITER) */}
                    {userRole === "recruiter" && (
                      <>
                        <li>
                          <Link
                            to="/hiring-dashboard"
                            className="highlight-link"
                          >
                            Trang tuyển dụng
                          </Link>
                        </li>
                        <li>
                          <Link to="/recruiter-dashboard">
                            Quản lý ứng viên
                          </Link>
                        </li>
                      </>
                    )}

                    {/* MENU CHO ADMIN (Đã sửa label hiển thị) */}
                    {userRole === "admin" && (
                      <li>
                        <Link to="/admin-dashboard" className="highlight-link">
                          Trang quản trị
                        </Link>
                      </li>
                    )}

                    <li className="logout" onClick={handleLogout}>
                      Đăng xuất
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
