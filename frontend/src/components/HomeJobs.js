import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/components/HomeJobs.scss";

const HomeJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // ✅ trang hiện tại
  const jobsPerPage = 9; // ✅ 3x3

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/jobs/featured");
        if (!res.ok) throw new Error("Lỗi khi kết nối đến server!");
        const data = await res.json();
        setJobs(data || []);
      } catch (err) {
        console.error("❌ Lỗi khi lấy việc làm nổi bật:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <p className="loading">Đang tải việc làm nổi bật...</p>;

  // ✅ Tính toán phân trang
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = jobs.slice(startIndex, startIndex + jobsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="home-jobs-container">
      <div className="section-header">
        <h2>Việc làm tốt nhất</h2>
      </div>

      {currentJobs.length === 0 ? (
        <p>Không có việc làm nào.</p>
      ) : (
        <>
          <div className="job-list">
            {currentJobs.map((job) => (
              <Link to={`/job/${job.id}`} key={job.id} className="job-card">
                <div className="job-card-header">
                  <h3 className="job-title">{job.title}</h3>
                  <span className="job-salary">
                    {job.salary || "Thoả thuận"}
                  </span>
                </div>
                <div className="job-card-company">
                  <span>{job.company}</span>
                </div>
                <div className="job-card-footer">
                  <span className="job-location">{job.location}</span>
                  <span className="job-posted-date">
                    {job.posted_date
                      ? new Date(job.posted_date).toLocaleDateString("vi-VN")
                      : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* ✅ Nút chuyển trang */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="page-btn"
              >
                ⬅ Trước
              </button>
              <span className="page-info">
                Trang {currentPage}/{totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Sau ➡
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomeJobs;
