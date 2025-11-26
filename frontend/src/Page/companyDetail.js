import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../styles/page/companyDetail.scss";

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        // ✅ Gọi đúng API backend
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

  if (loading) return <p>Đang tải dữ liệu công ty...</p>;
  if (error) return <p>{error}</p>;
  if (!company) return <p>Không tìm thấy thông tin công ty.</p>;

  return (
    <div className="company-detail">
      <div className="company-header">
        {company.logo_url && (
          <img
            src={
              company.logo_url.startsWith("http")
                ? company.logo_url
                : `http://localhost:8080${company.logo_url}`
            }
            alt={company.company_name}
            className="company-logo"
          />
        )}
        <div className="company-info">
          <h2>{company.company_name}</h2>
          <p>
            <strong>Ngành nghề:</strong> {company.industry}
          </p>
          <p>
            <strong>Quy mô:</strong> {company.company_size}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {company.address}
          </p>
          <p>
            <strong>Website:</strong>{" "}
            <a href={company.website} target="_blank" rel="noreferrer">
              {company.website}
            </a>
          </p>
          <p>
            <strong>Email:</strong> {company.email}
          </p>
          <p>
            <strong>Điện thoại:</strong> {company.phone}
          </p>
          <p>
            <strong>Năm thành lập:</strong> {company.founded_year}
          </p>
        </div>
      </div>

      <div className="company-description">
        <h3>Giới thiệu công ty</h3>
        <p>{company.description}</p>
      </div>

      {/* ✅ Danh sách các job */}
      <div className="company-jobs">
        <h3>Việc làm đang tuyển tại {company.company_name}</h3>
        {company.jobs && company.jobs.length > 0 ? (
          <ul className="job-list">
            {company.jobs.map((job) => (
              <li key={job.id} className="job-item">
                <div className="job-info">
                  <h4>{job.title}</h4>
                  <p>
                    <strong>Mức lương:</strong> {job.salary}
                  </p>
                  <p>
                    <strong>Hình thức:</strong> {job.job_type}
                  </p>
                  <p>
                    <strong>Ngành nghề:</strong> {job.industry}
                  </p>
                  <p>
                    <strong>Mô tả:</strong> {job.description}
                  </p>
                  <p>
                    <strong>Ngày đăng:</strong>{" "}
                    {new Date(job.posted_date).toLocaleDateString("vi-VN")}
                  </p>
                  <Link
                    to={`/job/${job.id}`}
                    key={job.id}
                    className="job-detail-link"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có việc làm nào được đăng.</p>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;
