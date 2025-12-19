import React, { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaUsers,
  FaNewspaper,
  FaEnvelope,
  FaChartBar,
  FaSignOutAlt,
  FaCog,
  FaBell,
} from "react-icons/fa";
import "../styles/Sidebar.scss";

const Sidebar = ({ activeMenu, setActiveMenu, onLogout }) => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FaChartBar,
    },
    {
      id: "users",
      label: "Quản lý người dùng",
      icon: FaUsers,
    },
    {
      id: "news",
      label: "Đăng tin tức",
      icon: FaNewspaper,
    },
    {
      id: "email",
      label: "Gửi quảng cáo",
      icon: FaEnvelope,
    },
    {
      id: "notification",
      label: "Thông báo",
      icon: FaBell,
    },
  ];

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
  };

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2>Admin Panel</h2>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-nav">
          <ul className="menu-list">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id}>
                  <button
                    className={`menu-item ${
                      activeMenu === item.id ? "active" : ""
                    }`}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <IconComponent className="menu-icon" />
                    <span className="menu-label">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Section */}
        <div className="sidebar-footer"></div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
