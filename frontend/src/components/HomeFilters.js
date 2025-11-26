import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/components/HomeFilters.scss";

/* 🔧 Hàm chuẩn hóa chuỗi để so khớp không dấu */
const normalizeText = (str = "") => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
};

export default function HomeFilters({ industries = [] }) {
  const [cities, setCities] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [cityFilter, setCityFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [keyword, setKeyword] = useState("");

  // ==================================================
  // 1️⃣ LẤY DANH SÁCH THÀNH PHỐ
  // ==================================================
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/locations/provinces"
        );
        const data = res.data;
        const cityNames = Array.isArray(data)
          ? data.map(
              (item) => item.province_name || item.name || item.label || item
            )
          : [];
        setCities(cityNames);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tỉnh:", error);
      }
    };
    fetchCities();
  }, []);

  // ==================================================
  // 2️⃣ LẤY DANH SÁCH CÔNG VIỆC
  // ==================================================
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/jobs");
        setJobs(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Lỗi khi tải công việc:", error);
      }
    };
    fetchJobs();
  }, []);

  // ==================================================
  // 3️⃣ LỌC CÔNG VIỆC THEO BỘ LỌC
  // ==================================================
  useEffect(() => {
    if (
      (cityFilter === "All" || !cityFilter) &&
      (industryFilter === "All" || !industryFilter) &&
      keyword.trim() === ""
    ) {
      setFilteredJobs([]);
      return;
    }

    const cityNorm = normalizeText(cityFilter);
    const industryNorm = normalizeText(industryFilter);
    const keywordNorm = normalizeText(keyword);

    const filtered = jobs.filter((job) => {
      const locationNorm = normalizeText(job.location || job.address || "");
      const industryDbNorm = normalizeText(job.industry || job.field || "");
      const titleNorm = normalizeText(job.title || "");
      const companyNorm = normalizeText(job.company || job.company_name || "");

      const matchCity =
        cityFilter === "All" ||
        locationNorm.includes(cityNorm) ||
        cityNorm.includes(locationNorm);

      const matchIndustry =
        industryFilter === "All" ||
        industryDbNorm.includes(industryNorm) ||
        industryNorm.includes(industryDbNorm);

      const matchKeyword =
        keywordNorm === "" ||
        titleNorm.includes(keywordNorm) ||
        companyNorm.includes(keywordNorm) ||
        locationNorm.includes(keywordNorm) ||
        industryDbNorm.includes(keywordNorm);

      return matchCity && matchIndustry && matchKeyword;
    });

    setFilteredJobs(filtered);
  }, [cityFilter, industryFilter, keyword, jobs]);

  // ==================================================
  // 4️⃣ LƯU LỊCH SỬ TÌM KIẾM CỦA NGƯỜI DÙNG HIỆN TẠI
  // ==================================================
  useEffect(() => {
    const delay = setTimeout(async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.warn("Người dùng chưa đăng nhập, không lưu lịch sử tìm kiếm.");
        return;
      }

      // Chỉ lưu khi có hành động lọc thực sự
      if (keyword || cityFilter !== "All" || industryFilter !== "All") {
        try {
          await axios.post(
            "http://localhost:8080/api/search-history",
            {
              city: cityFilter !== "All" ? cityFilter : null,
              industry: industryFilter !== "All" ? industryFilter : null,
              keyword: keyword || null,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // ✅ Gửi token cho backend
              },
            }
          );
          console.log("Lưu lịch sử tìm kiếm thành công");
        } catch (error) {
          console.error(
            "Lỗi khi lưu lịch sử tìm kiếm:",
            error.response?.data || error.message
          );
        }
      }
    }, 800); // ⏳ Delay để tránh gửi liên tục khi user đang gõ

    return () => clearTimeout(delay);
  }, [cityFilter, industryFilter, keyword]);

  const hasActiveFilters =
    cityFilter !== "All" || industryFilter !== "All" || keyword.trim() !== "";

  // ==================================================
  // 5️⃣ GIAO DIỆN
  // ==================================================
  return (
    <section className="filters-section">
      <div className="filters container">
        {/* HEADER */}
        <div className="filters-header">
          <div>
            <h2>Tìm Kiếm Công Việc</h2>
            <p>Khám phá hàng ngàn cơ hội nghề nghiệp tuyệt vời</p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="controls">
          {/* Bộ lọc thành phố */}
          <div className="filter-group">
            <label htmlFor="city-filter">
              <span className="icon"></span> Thành phố
            </label>
            <select
              id="city-filter"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">Tất cả thành phố</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Bộ lọc ngành nghề */}
          <div className="filter-group">
            <label htmlFor="industry-filter">
              <span className="icon"></span> Ngành nghề
            </label>
            <select
              id="industry-filter"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">Tất cả ngành nghề</option>
              {industries.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          {/* Ô tìm kiếm */}
          <div className="filter-group search-group">
            <label htmlFor="keyword-search">
              <span className="icon"></span> Từ khóa
            </label>
            <div className="search-input-wrapper">
              <input
                id="keyword-search"
                type="search"
                placeholder="Lập trình viên, Designer, Product Manager..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
              />
              {keyword && (
                <button
                  className="clear-btn"
                  onClick={() => setKeyword("")}
                  aria-label="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS */}
        {hasActiveFilters && (
          <div className="results-section">
            <div className="results-header">
              <h3>
                Kết quả tìm kiếm:{" "}
                <span className="highlight">{filteredJobs.length}</span> công
                việc
              </h3>
              {filteredJobs.length > 0 && (
                <button
                  className="reset-btn"
                  onClick={() => {
                    setCityFilter("All");
                    setIndustryFilter("All");
                    setKeyword("");
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {filteredJobs.length > 0 ? (
              <div className="filtered-jobs">
                {filteredJobs.map((job) => (
                  <Link key={job.id} to={`/job/${job.id}`} className="job-card">
                    <div className="job-header">
                      <h3 className="job-title">{job.title}</h3>
                      <span className="job-badge">
                        {job.industry || "Công việc"}
                      </span>
                    </div>
                    <p className="job-company">{job.company}</p>
                    <div className="job-meta">
                      <span className="job-location">{job.location}</span>
                      {job.salary && (
                        <span className="job-salary">{job.salary}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon"></div>
                <h4>Không tìm thấy công việc phù hợp</h4>
                <p>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </div>
        )}

        {/* EMPTY STATE */}
        {!hasActiveFilters && (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <h3>Bắt đầu tìm kiếm công việc</h3>
            <p>
              Chọn thành phố, ngành nghề hoặc nhập từ khóa để khám phá những cơ
              hội tuyệt vời
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
