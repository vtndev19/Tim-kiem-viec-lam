import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/page/CompanyLanding.scss";

const CompanyLanding = () => {
  const [companies, setCompanies] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/companies");
        setCompanies(res.data || []);
        // Lấy 6 công ty đầu tiên làm Top Companies
        setTopCompanies((res.data || []).slice(0, 6));
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách công ty:", error);
        setCompanies([]);
        setTopCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="company-landing">
      {/* ===== BANNER SECTION ===== */}
      <section className="company-banner">
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1 className="banner-title">Khám phá các công ty hàng đầu</h1>
          <p className="banner-subtitle">
            Tìm kiếm công ty lý tưởng để phát triển sự nghiệp của bạn
          </p>
          <div className="banner-search">
            <input
              type="text"
              placeholder="Tìm kiếm công ty..."
              className="search-input"
            />
            <button className="search-btn">Tìm kiếm</button>
          </div>
        </div>
      </section>

      {/* ===== TOP COMPANIES SECTION ===== */}
      <section className="top-companies-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Top Công ty Nổi Bật</h2>
            <p className="section-subtitle">
              Những công ty hàng đầu đang tuyển dụng
            </p>
          </div>

          <div className="companies-grid top-grid">
            {topCompanies.length > 0 ? (
              topCompanies.map((company, index) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  rank={index + 1}
                  isTop={true}
                />
              ))
            ) : (
              <p className="no-data">Không có công ty nào</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== ALL COMPANIES SECTION ===== */}
      <section className="all-companies-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Tất cả Công ty</h2>
            <p className="section-subtitle">
              Danh sách đầy đủ tất cả các công ty
            </p>
          </div>

          <div className="companies-grid all-grid">
            {companies.length > 0 ? (
              companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))
            ) : (
              <p className="no-data">Không có công ty nào</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// ===== COMPANY CARD COMPONENT =====
const CompanyCard = ({ company, rank, isTop }) => {
  return (
    <Link to={`/companies/${company.id}`} className="company-card-link">
      <div className={`company-card ${isTop ? "top-card" : ""}`}>
        {/* Rank Badge */}
        {isTop && rank && (
          <div className={`rank-badge rank-${rank}`}>#{rank}</div>
        )}

        {/* Company Logo */}
        <div className="card-logo-wrapper">
          <img
            src={company.logo_url || "/images/default-company.png"}
            alt={company.company_name}
            className="card-logo"
          />
        </div>

        {/* Company Info */}
        <div className="card-info">
          <h3 className="card-title">{company.company_name}</h3>
          <p className="card-industry">
            {company.industry || "Không xác định"}
          </p>
          <p className="card-location">
            📍 {company.address || "Không xác định"}
          </p>

          {/* Quick Stats */}
          <div className="card-stats">
            <div className="stat-item">
              <span className="stat-value">12</span>
              <span className="stat-label">Việc làm</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">4.5★</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card-actions">
            <button className="btn-primary">Xem chi tiết</button>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                Website
              </a>
            )}
          </div>
        </div>

        {/* Hover Effect */}
        <div className="card-hover-effect"></div>
      </div>
    </Link>
  );
};

export default CompanyLanding;
