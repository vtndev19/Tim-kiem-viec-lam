import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/page/Company.scss";

const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Gọi API backend để lấy danh sách công ty
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/companies");
        setCompanies(res.data);
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách công ty:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) return <p className="loading">Đang tải dữ liệu...</p>;

  return (
    <div className="company-page container">
      <h1 className="page-title">Danh sách công ty nổi bật</h1>
      <div className="company-grid">
        {companies.length > 0 ? (
          companies.map((company) => (
            <div key={company.id} className="company-card">
              <div className="company-logo">
                <img
                  src={company.logo_url || "/images/default-company.png"}
                  alt={company.company_name}
                />
              </div>

              <div className="company-info">
                <h2>{company.company_name}</h2>
                <p className="company-industry">{company.industry}</p>
                <p className="company-location">{company.address}</p>

                <div className="company-actions">
                  {/* ✅ Nút xem chi tiết */}
                  <Link
                    to={`/companies/${company.id}`}
                    className="btn company-detail-btn"
                  >
                    Xem chi tiết
                  </Link>

                  {/* ✅ Nút truy cập website */}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="btn outline company-link-btn"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">Không có công ty nào trong cơ sở dữ liệu</p>
        )}
      </div>
    </div>
  );
};

export default Company;
