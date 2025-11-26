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
  const userMenuRef = useRef(null);
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIndustries(db.industries || []);
  }, []);

  // Ẩn menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Đăng xuất → quay về trang chủ
  const handleLogout = () => {
    logout();
    setUserMenuVisible(false);
    navigate("/");
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
            to="/companies"
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

        {/* User */}
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
                <span>{user.name}</span>
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
                    <li></li>
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
