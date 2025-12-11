import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/components/HomeBanner.scss";
import ImageSlideBox from "./ImageSlideBox";

// Helper: Chuẩn hóa chuỗi (bỏ dấu, lowercase)
const normalizeText = (str) => {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
};

export default function HomeBanner({ industries = [] }) {
  const navigate = useNavigate();

  // --- STATE ---
  const [cities, setCities] = useState([]); // Danh sách tên thành phố từ API
  const [jobs, setJobs] = useState([]); // Danh sách jobs từ API

  // State tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [jobCategory, setJobCategory] = useState("All");

  // State cho Location (Đã đổi tên để fix lỗi ESLint)
  const [locationInput, setLocationInput] = useState("");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityWrapperRef = useRef(null);

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

  // --- 1. FETCH DATA TỪ API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCities, resJobs] = await Promise.all([
          axios.get("http://localhost:8080/api/locations/provinces"),
          axios.get("http://localhost:8080/api/jobs"),
        ]);

        // Xử lý City (Map object -> array string names)
        const cityData = resCities.data;
        if (Array.isArray(cityData)) {
          const cityNames = cityData.map((item) => {
            return item.province_name || item.name || item.label || item;
          });
          setCities(cityNames);
        }

        // Xử lý Jobs
        setJobs(Array.isArray(resJobs.data) ? resJobs.data : []);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        setCities([]);
        setJobs([]);
      }
    };
    fetchData();
  }, []);

  // --- 2. XỬ LÝ CLICK OUTSIDE (Đóng dropdown thành phố) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityWrapperRef.current &&
        !cityWrapperRef.current.contains(event.target)
      ) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 3. LOGIC LỌC THÀNH PHỐ (Autocomplete) ---
  const filteredCities = useMemo(() => {
    if (!locationInput || locationInput === "Toàn quốc") return cities;
    const normInput = normalizeText(locationInput);
    return cities.filter((city) => normalizeText(city).includes(normInput));
  }, [locationInput, cities]);

  // --- 4. LOGIC LỌC JOBS ---
  const filteredJobs = useMemo(() => {
    const isLocAll =
      !locationInput ||
      locationInput === "Toàn quốc" ||
      locationInput === "All";

    // Nếu chưa nhập gì thì không hiện dropdown kết quả job
    if (!searchQuery && isLocAll && jobCategory === "All") return [];

    const normKey = normalizeText(searchQuery);
    const normLoc = normalizeText(isLocAll ? "" : locationInput);
    const normCat = normalizeText(jobCategory === "All" ? "" : jobCategory);

    return jobs.filter((job) => {
      const jTitle = normalizeText(job.title);
      const jComp = normalizeText(job.company || job.companyName);
      const jLoc = normalizeText(job.location || job.address || job.city);
      const jInd = normalizeText(job.industry || job.field || job.category);

      const matchLoc = isLocAll || jLoc.includes(normLoc);
      const matchCat = jobCategory === "All" || jInd.includes(normCat);
      const matchKey =
        !normKey ||
        jTitle.includes(normKey) ||
        jComp.includes(normKey) ||
        jLoc.includes(normKey);

      return matchLoc && matchCat && matchKey;
    });
  }, [searchQuery, locationInput, jobCategory, jobs]);

  // --- 5. LOGIC LƯU LỊCH SỬ TÌM KIẾM (Search History) ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = localStorage.getItem("authToken");
      // Chỉ lưu nếu có token VÀ có ít nhất 1 điều kiện lọc
      if (
        token &&
        (searchQuery ||
          (locationInput && locationInput !== "Toàn quốc") ||
          jobCategory !== "All")
      ) {
        try {
          await axios.post(
            "http://localhost:8080/api/search-history",
            {
              city:
                locationInput && locationInput !== "Toàn quốc"
                  ? locationInput
                  : null,
              industry: jobCategory !== "All" ? jobCategory : null,
              keyword: searchQuery || null,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          // console.error("Không lưu được lịch sử:", err);
        }
      }
    }, 1500); // Debounce 1.5s
    return () => clearTimeout(timer);
  }, [searchQuery, locationInput, jobCategory]);

  // --- HANDLERS ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const locParam =
      !locationInput || locationInput === "Toàn quốc" ? "All" : locationInput;
    navigate(
      `/jobs?q=${encodeURIComponent(
        searchQuery
      )}&loc=${locParam}&cat=${jobCategory}`
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setLocationInput(""); // Reset input địa điểm
    setJobCategory("All");
  };

  const handleCitySelect = (cityName) => {
    setLocationInput(cityName);
    setIsCityDropdownOpen(false);
  };

  const isFiltering =
    filteredJobs.length > 0 ||
    searchQuery ||
    (locationInput && locationInput !== "Toàn quốc") ||
    jobCategory !== "All";

  return (
    <div className="banner">
      <div className="banner-content">
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
                  {/* --- 1. CATEGORY --- */}
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

                  {/* --- 2. KEYWORD INPUT --- */}
                  <div className="search-input-box">
                    <svg
                      className="search-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="11" cy="11" r="8"></circle>{" "}
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Tìm kiếm việc làm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* --- 3. LOCATION AUTOCOMPLETE --- */}
                  <div
                    className="search-select location-select"
                    ref={cityWrapperRef}
                  >
                    <svg
                      className="location-icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
                    </svg>

                    <input
                      type="text"
                      className="location-input"
                      placeholder="Toàn quốc"
                      value={locationInput} // Bind vào state mới
                      onChange={(e) => {
                        setLocationInput(e.target.value);
                        setIsCityDropdownOpen(true);
                      }}
                      onFocus={() => setIsCityDropdownOpen(true)}
                    />

                    {/* Dropdown gợi ý thành phố */}
                    {isCityDropdownOpen && (
                      <div className="city-dropdown-list">
                        <div
                          className="city-item"
                          onClick={() => handleCitySelect("Toàn quốc")}
                        >
                          Toàn quốc
                        </div>
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city, idx) => (
                            <div
                              key={idx}
                              className="city-item"
                              onClick={() => handleCitySelect(city)}
                            >
                              {city}
                            </div>
                          ))
                        ) : (
                          <div className="city-empty">
                            {cities.length === 0
                              ? "Đang tải..."
                              : "Không tìm thấy"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="search-button">
                    Tìm kiếm
                  </button>
                </div>
              </form>

              {/* --- DROPDOWN JOB RESULTS --- */}
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
                        Không tìm thấy kết quả phù hợp
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

            {/* TAGS */}
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

        <div className="banner-bottom-section">
          <ImageSlideBox />
        </div>
      </div>
    </div>
  );
}
