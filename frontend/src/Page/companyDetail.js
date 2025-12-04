import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Globe,
  MapPin,
  Users,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  DollarSign,
} from "lucide-react"; // Gợi ý cài thêm lucide-react để có icon đẹp
import "../styles/page/companyDetail.scss";

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/companies/${id}`
        );
        setCompany(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu công ty:", err);
        setError("Không thể tải thông tin công ty.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCompany();
  }, [id]);

  if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!company)
    return <div className="error-state">Không tìm thấy công ty.</div>;

  return (
    <div className="company-detail-page container">
      {/* --- HERO SECTION --- */}
      <div className="company-hero">
        <div className="hero-content">
          <div className="logo-wrapper">
            <img
              src={
                company.logo_url?.startsWith("http")
                  ? company.logo_url
                  : `http://localhost:8080${company.logo_url}` ||
                    "https://via.placeholder.com/150"
              }
              alt={company.company_name}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150";
              }} // Fallback nếu ảnh lỗi
              className="company-logo"
            />
          </div>

          <div className="info-wrapper">
            <h1 className="company-name">{company.company_name}</h1>
            <div className="meta-grid">
              <div className="meta-item">
                <Briefcase size={16} /> <span>{company.industry}</span>
              </div>
              <div className="meta-item">
                <Users size={16} /> <span>{company.company_size} nhân sự</span>
              </div>
              <div className="meta-item">
                <MapPin size={16} /> <span>{company.address}</span>
              </div>
              <div className="meta-item">
                <Calendar size={16} />{" "}
                <span>Thành lập: {company.founded_year}</span>
              </div>
            </div>

            <div className="contact-actions">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                >
                  <Globe size={16} /> Website
                </a>
              )}
              <span className="contact-info">
                <Mail size={16} /> {company.email}
              </span>
              <span className="contact-info">
                <Phone size={16} /> {company.phone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- DESCRIPTION SECTION --- */}
      <div className="section-container">
        <h3 className="section-title">Giới thiệu công ty</h3>
        <div className="description-content">
          <p>{company.description}</p>
        </div>
      </div>

      {/* --- JOBS GRID SECTION --- */}
      <div className="section-container">
        <div className="jobs-header">
          <h3 className="section-title">
            Việc làm đang tuyển dụng ({company.jobs?.length || 0})
          </h3>
        </div>

        {company.jobs && company.jobs.length > 0 ? (
          <div className="jobs-grid">
            {company.jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <h4>{job.title}</h4>
                  <span className="job-type-badge">{job.job_type}</span>
                </div>

                <div className="job-card-body">
                  <div className="salary-row">
                    <DollarSign size={16} className="text-green" />
                    <span className="salary-text">{job.salary}</span>
                  </div>
                  <p className="job-desc-short">{job.description}</p>

                  <div className="job-meta">
                    <span className="date">
                      📅 {new Date(job.posted_date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div className="job-card-footer">
                  <Link to={`/job/${job.id}`} className="btn-view-job">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-jobs">
            Hiện tại công ty chưa có vị trí nào đang mở.
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;
