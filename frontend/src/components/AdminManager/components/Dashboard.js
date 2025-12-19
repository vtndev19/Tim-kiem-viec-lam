import React, { useState } from "react";
import Sidebar from "./Sidebar";
import UserManagement from "./UserManagement";
import NewsPost from "./NewsPost";
import EmailMarketing from "./EmailMarketing";
import NotificationPanel from "./NotificationPanel";
import "../styles/Sidebar.scss";
import "../styles/Dashboard.scss";

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const renderContent = () => {
    switch (activeMenu) {
      case "users":
        return <UserManagement />;
      case "news":
        return <NewsPost />;
      case "email":
        return <EmailMarketing />;
      case "notification":
        return <NotificationPanel />;
      case "dashboard":
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="dashboard-content">{renderContent()}</main>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = () => {
  return (
    <div className="dashboard-home">
      <div className="home-header">
        <h1>Chào mừng quay trở lại, Admin</h1>
        <p>Đây là bảng điều khiển quản lý của bạn</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-large">
        <div className="stat-card-large">
          <div className="stat-header">
            <h3>Tổng người dùng</h3>
            <span className="stat-icon users">👥</span>
          </div>
          <div className="stat-body">
            <div className="stat-value">2,543</div>
            <div className="stat-change positive">+12% so với tuần trước</div>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-header">
            <h3>Việc làm hoạt động</h3>
            <span className="stat-icon jobs">💼</span>
          </div>
          <div className="stat-body">
            <div className="stat-value">1,248</div>
            <div className="stat-change positive">+8% so với tuần trước</div>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-header">
            <h3>Đơn ứng tuyển</h3>
            <span className="stat-icon applications">📄</span>
          </div>
          <div className="stat-body">
            <div className="stat-value">3,892</div>
            <div className="stat-change positive">+25% so với tuần trước</div>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-header">
            <h3>Doanh thu</h3>
            <span className="stat-icon revenue">💰</span>
          </div>
          <div className="stat-body">
            <div className="stat-value">$24,567</div>
            <div className="stat-change positive">+18% so với tuần trước</div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="activity-section">
        <div className="activity-container">
          <div className="activity-card">
            <h2>Hoạt động gần đây</h2>
            <ul className="activity-list">
              <li className="activity-item">
                <span className="activity-icon">✓</span>
                <div>
                  <p className="activity-title">Người dùng mới đăng ký</p>
                  <p className="activity-time">Nguyễn Văn A đã tạo tài khoản</p>
                </div>
                <span className="activity-time-ago">5 phút trước</span>
              </li>
              <li className="activity-item">
                <span className="activity-icon">📝</span>
                <div>
                  <p className="activity-title">Việc làm mới được tạo</p>
                  <p className="activity-time">
                    Công ty ABC đã đăng tin tuyển dụng
                  </p>
                </div>
                <span className="activity-time-ago">15 phút trước</span>
              </li>
              <li className="activity-item">
                <span className="activity-icon">💬</span>
                <div>
                  <p className="activity-title">Khiếu nại từ người dùng</p>
                  <p className="activity-time">Trần Thị B đã gửi khiếu nại</p>
                </div>
                <span className="activity-time-ago">1 tiếng trước</span>
              </li>
              <li className="activity-item">
                <span className="activity-icon">🔔</span>
                <div>
                  <p className="activity-title">Cập nhật hệ thống</p>
                  <p className="activity-time">
                    Hệ thống đã được cập nhật phiên bản mới
                  </p>
                </div>
                <span className="activity-time-ago">3 tiếng trước</span>
              </li>
            </ul>
          </div>

          <div className="activity-card">
            <h2>Tóm tắt nhanh</h2>
            <div className="quick-summary">
              <div className="summary-item">
                <h4>Đơn ứng tuyển chưa xử lý</h4>
                <p className="summary-value">245</p>
              </div>
              <div className="summary-item">
                <h4>Email chưa gửi</h4>
                <p className="summary-value">12</p>
              </div>
              <div className="summary-item">
                <h4>Báo cáo mới</h4>
                <p className="summary-value">8</p>
              </div>
              <div className="summary-item">
                <h4>Người dùng kém hoạt động</h4>
                <p className="summary-value">34</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
