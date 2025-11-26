import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "../styles/page/AllJobs.scss";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

const AllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;

  // ✅ Lấy dữ liệu từ backend khi load trang
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, indRes] = await Promise.all([
          fetch(`${API_BASE}/api/jobs`, { signal: controller.signal }),
          fetch(`${API_BASE}/api/jobs/industries`, {
            signal: controller.signal,
          }),
        ]);

        if (!jobsRes.ok) throw new Error(`Jobs API lỗi: ${jobsRes.status}`);
        if (!indRes.ok) throw new Error(`Industries API lỗi: ${indRes.status}`);

        const jobsData = await jobsRes.json();
        const industriesData = await indRes.json();

        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setIndustries(Array.isArray(industriesData) ? industriesData : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("❌ Lỗi khi tải dữ liệu:", error);
          setJobs([]);
          setIndustries([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => controller.abort();
  }, []);

  // ✅ Lấy danh sách địa điểm duy nhất
  const locations = useMemo(() => {
    return [...new Set(jobs.map((job) => job.location).filter(Boolean))];
  }, [jobs]);

  // ✅ Lọc dữ liệu
  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const title = (job.title || "").toString();
      const company = (job.company || "").toString();

      const searchTermMatch =
        searchTerm === "" ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.toLowerCase().includes(searchTerm.toLowerCase());

      const industryMatch =
        selectedIndustry === "" ||
        String(job.industry_id ?? job.industryId ?? "") === selectedIndustry;

      const locationMatch =
        selectedLocation === "" || job.location === selectedLocation;

      return searchTermMatch && industryMatch && locationMatch;
    });

    // ✅ Sắp xếp
    switch (sortBy) {
      case "salary-high":
        result.sort(
          (a, b) => (parseFloat(b.salary) || 0) - (parseFloat(a.salary) || 0)
        );
        break;
      case "salary-low":
        result.sort(
          (a, b) => (parseFloat(a.salary) || 0) - (parseFloat(b.salary) || 0)
        );
        break;
      case "relevant":
        // Giữ thứ tự gốc (hoặc có thể thêm logic relevance)
        break;
      case "newest":
      default:
        result.sort(
          (a, b) => new Date(b.posted_date) - new Date(a.posted_date)
        );
    }

    return result;
  }, [searchTerm, selectedIndustry, selectedLocation, jobs, sortBy]);

  // ✅ Phân trang
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  // 🕓 Hiển thị khi đang tải
  if (loading) {
    return (
      <div className="all-jobs-page">
        <div className="container">
          <p className="loading">Đang tải danh sách việc làm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-jobs-page">
      <div className="container">
        {/* Main layout: sidebar + content + featured */}
        <div className="jobs-layout">
          {/* LEFT SIDEBAR - Filters */}
          <aside className="jobs-sidebar">
            <div className="sidebar-search">
              <input
                type="text"
                placeholder="Tìm kiếm công việc..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="sidebar-search-input"
              />
            </div>

            {/* Filter Groups */}
            <div className="filter-group">
              <label className="filter-label">Ngành nghề</label>
              <select
                value={selectedIndustry}
                onChange={(e) => {
                  setSelectedIndustry(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="">Tất cả ngành nghề</option>
                {industries.map((ind) => (
                  <option
                    key={ind.industry_id ?? ind.id}
                    value={String(ind.industry_id ?? ind.id)}
                  >
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Địa điểm</label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="">Tất cả địa điểm</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="sort-group">
              <p className="sort-title">Sắp xếp theo</p>
              <div className="sort-options">
                <label className="sort-option">
                  <input
                    type="radio"
                    name="sort"
                    value="newest"
                    checked={sortBy === "newest"}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  <span>Ngày đăng (mới nhất)</span>
                </label>
                <label className="sort-option">
                  <input
                    type="radio"
                    name="sort"
                    value="relevant"
                    checked={sortBy === "relevant"}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  <span>Liên quan nhất</span>
                </label>
                <label className="sort-option">
                  <input
                    type="radio"
                    name="sort"
                    value="salary-high"
                    checked={sortBy === "salary-high"}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  <span>Lương (cao - thấp)</span>
                </label>
                <label className="sort-option">
                  <input
                    type="radio"
                    name="sort"
                    value="salary-low"
                    checked={sortBy === "salary-low"}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  <span>Lương (thấp - cao)</span>
                </label>
              </div>
            </div>
          </aside>

          {/* CENTER - Main Job Grid */}
          <main className="jobs-main">
            {currentJobs.length > 0 ? (
              <>
                <div className="job-grid">
                  {currentJobs.map((job) => {
                    const postedDate = job.posted_date
                      ? new Date(job.posted_date)
                      : null;
                    const companyName = job.company || "Công ty";
                    const salary = job.salary || "Thoả thuận";
                    const industryLabel =
                      job.industry_name ||
                      (() => {
                        const found = industries.find(
                          (i) =>
                            String(i.industry_id ?? i.id) ===
                            String(job.industry_id ?? job.industryId ?? "")
                        );
                        return found ? found.name : "";
                      })();

                    return (
                      <Link
                        to={`/job/${job.id}`}
                        key={job.id}
                        className="job-card"
                      >
                        <div className="job-card-header">
                          <h3 className="job-title">{job.title}</h3>
                          <span className="job-salary">{salary}</span>
                        </div>

                        <div className="job-card-body">
                          <p className="job-company">{companyName}</p>
                          {industryLabel && (
                            <p className="job-industry">{industryLabel}</p>
                          )}
                        </div>

                        <div className="job-card-footer">
                          <span className="job-location">
                            {job.location || "—"}
                          </span>
                          <span className="job-posted-date">
                            {postedDate
                              ? postedDate.toLocaleDateString("vi-VN")
                              : "—"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      ← Trước
                    </button>
                    <span className="pagination-info">
                      Trang {currentPage}/{totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="no-results">Không tìm thấy việc làm phù hợp.</p>
            )}
          </main>

          {/* RIGHT SIDEBAR - Featured & Ads */}
          <aside className="jobs-featured">
            <div className="featured-section">
              <h3 className="featured-title">Việc làm nổi bật</h3>
              <div className="featured-list">
                {jobs.slice(0, 3).map((job) => (
                  <Link
                    to={`/job/${job.id}`}
                    key={job.id}
                    className="featured-card"
                  >
                    <div className="featured-salary">
                      {job.salary || "Thoả thuận"}
                    </div>
                    <h4>{job.title}</h4>
                    <p className="featured-company">{job.company}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Ad Space */}
            <div className="ad-space">
              <p className="ad-text">Quảng cáo</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AllJobs;
