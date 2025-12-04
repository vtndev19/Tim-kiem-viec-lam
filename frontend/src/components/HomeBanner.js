import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/components/HomeBanner.scss";
import ImageSlideBox from "./ImageSlideBox";

// Helper: Chuẩn hóa chuỗi (bỏ dấu, lowercase)
const normalizeText = (str) => {
  return (
    str
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s]/g, "")
      .trim() || ""
  );
};

export default function HomeBanner({ industries = [] }) {
  const navigate = useNavigate();

  // --- STATE ---
  const [cities, setCities] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [jobCategory, setJobCategory] = useState("All");
  const [location, setLocation] = useState("All");

  // Fallback data
  const displayIndustries =
    industries.length > 0
      ? industries
      : [
          "Kinh doanh/Bán hàng",
          "Marketing/PR",
          "IT - Phần mềm",
          "Hành chính/Nhân sự",
          "Kế toán/Kiểm toán",
        ];

  const popularTags = ["Tester", "Java", "PHP", "Marketing", "Sales"];

  // --- EFFECT: Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCities, resJobs] = await Promise.all([
          axios.get("http://localhost:8080/api/locations/provinces"),
          axios.get("http://localhost:8080/api/jobs"),
        ]);

        setCities(
          resCities.data.map((i) => i.province_name || i.name || i.label || i)
        );
        setJobs(Array.isArray(resJobs.data) ? resJobs.data : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // --- EFFECT: Filter Logic ---
  useEffect(() => {
    if (!searchQuery && location === "All" && jobCategory === "All") {
      setFilteredJobs([]);
      return;
    }

    const normLoc = normalizeText(location === "All" ? "" : location);
    const normCat = normalizeText(jobCategory === "All" ? "" : jobCategory);
    const normKey = normalizeText(searchQuery);

    const results = jobs.filter((job) => {
      const jLoc = normalizeText(job.location || job.address);
      const jInd = normalizeText(job.industry || job.field);
      const jTitle = normalizeText(job.title);
      const jComp = normalizeText(job.company);

      const matchLoc = location === "All" || jLoc.includes(normLoc);
      const matchCat = jobCategory === "All" || jInd.includes(normCat);
      const matchKey =
        !normKey ||
        jTitle.includes(normKey) ||
        jComp.includes(normKey) ||
        jLoc.includes(normKey);

      return matchLoc && matchCat && matchKey;
    });

    setFilteredJobs(results);
  }, [searchQuery, location, jobCategory, jobs]);

  // --- EFFECT: Save History ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = localStorage.getItem("authToken");
      if (
        token &&
        (searchQuery || location !== "All" || jobCategory !== "All")
      ) {
        try {
          await axios.post(
            "http://localhost:8080/api/search-history",
            {
              city: location !== "All" ? location : null,
              industry: jobCategory !== "All" ? jobCategory : null,
              keyword: searchQuery || null,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          /* Silent fail */
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchQuery, location, jobCategory]);

  // --- HANDLERS ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(
      `/jobs?q=${encodeURIComponent(
        searchQuery
      )}&loc=${location}&cat=${jobCategory}`
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setLocation("All");
    setJobCategory("All");
  };

  const isFiltering =
    searchQuery || location !== "All" || jobCategory !== "All";

  return (
    <div className="banner">
      <div className="banner-content">
        {/* --- SECTION 1: SEARCH --- */}
        <div className="banner-top-section">
          <div className="hero-container">
            <h1 className="hero-title">
              Tìm việc làm nhanh 24h, việc làm mới nhất toàn quốc
            </h1>
            <p className="hero-subtitle">
              Tiếp cận 60,000+ tin tuyển dụng uy tín mỗi ngày
            </p>

            <div className="search-box-container">
              <form className="hero-search" onSubmit={handleSearchSubmit}>
                <div className="search-wrapper">
                  {/* Category */}
                  <div className="search-select">
                    <svg
                      className="menu-icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"></path>
                    </svg>
                    <select
                      value={jobCategory}
                      onChange={(e) => setJobCategory(e.target.value)}
                    >
                      <option value="All">Danh mục</option>
                      {displayIndustries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input */}
                  <div className="search-input-box">
                    <svg
                      className="search-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Tìm kiếm việc làm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Location */}
                  <div className="search-select location-select">
                    <svg
                      className="location-icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
                    </svg>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="All">Toàn quốc</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="search-button">
                    Tìm kiếm
                  </button>
                </div>
              </form>

              {/* Dropdown Results */}
              {isFiltering && (
                <div className="search-results-dropdown">
                  <div className="dropdown-header">
                    <span>
                      Tìm thấy <b>{filteredJobs.length}</b> kết quả
                    </span>
                    <button
                      className="close-dropdown"
                      onClick={handleClearFilters}
                    >
                      ✕ Đóng
                    </button>
                  </div>

                  <div className="dropdown-list">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.slice(0, 6).map((job) => (
                        <Link
                          to={`/job/${job.id}`}
                          key={job.id}
                          className="dropdown-item"
                        >
                          <div className="item-title">{job.title}</div>
                          <div className="item-company">{job.company}</div>
                          <div className="item-meta">
                            <span className="meta-loc">{job.location}</span>
                            {job.salary && (
                              <span className="meta-salary">
                                • {job.salary}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="dropdown-empty">
                        Không tìm thấy kết quả
                      </div>
                    )}

                    {filteredJobs.length > 6 && (
                      <div
                        className="dropdown-footer"
                        onClick={handleSearchSubmit}
                      >
                        Xem tất cả
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tags */}
            <div className="quick-tags">
              <span className="tag-label">Gợi ý:</span>
              <div className="tags">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    className="tag"
                    onClick={() => setSearchQuery(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: SLIDE IMAGE --- */}
        <div className="banner-bottom-section">
          <ImageSlideBox />
        </div>
      </div>
    </div>
  );
}
