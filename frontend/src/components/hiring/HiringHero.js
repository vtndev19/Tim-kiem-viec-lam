import React from "react";
import "./HiringHero.scss";

const HiringHero = ({ onPostJobClick, onManageJobsClick }) => {
  return (
    <section id="hero" className="hiring-hero">
      <div className="hero-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="container">
        <div className="hero-content fade-in-up">
          <h1 className="hero-title">
            Tìm kiếm những
            <span className="highlight-text"> Ứng viên tuyệt vời</span>
          </h1>

          <p className="hero-subtitle">
            Nền tảng tuyển dụng hiện đại với công cụ quản lý toàn diện cho nhà
            tuyển dụng. Đăng tuyển, quản lý ứng viên, và phát triển đội ngũ của
            bạn một cách dễ dàng.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Nhà Tuyển Dụng</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50,000+</div>
              <div className="stat-label">Tin Tuyển Dụng</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100,000+</div>
              <div className="stat-label">Ứng Viên Tiềm Năng</div>
            </div>
          </div>

          <div className="hero-cta">
            <button
              onClick={onPostJobClick}
              className="button button-primary button-large"
            >
              <span className="button-icon">+</span> Đăng Tuyển Ngay
            </button>
            <button
              onClick={onManageJobsClick}
              className="button button-secondary button-large"
            >
              Quản Lý Tin Tuyển Dụng
            </button>
          </div>

          <p className="hero-footer-text">
            ✨ Miễn phí đăng tuyển cho 30 ngày đầu tiên
          </p>
        </div>

        <div className="hero-image">
          <div className="image-card card">
            <div className="image-header">
              <div className="header-dot"></div>
              <div className="header-dot"></div>
              <div className="header-dot"></div>
            </div>
            <div className="image-body">
              <div className="mock-item"></div>
              <div className="mock-item"></div>
              <div className="mock-item"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HiringHero;
