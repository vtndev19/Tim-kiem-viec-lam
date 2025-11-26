import React, { useState, useEffect } from "react";
import JobCard from "./JobCard"; // Đảm bảo đường dẫn đúng
import "./JobManagementList.scss";

// ⭐ CẤU HÌNH API
const API_URL = "http://localhost:8080/api/jobs/list-jobs";

const JobManagementList = ({ onEdit, onDelete, onViewDetail }) => {
  // 1. STATE QUẢN LÝ DỮ LIỆU & UI
  const [jobs, setJobs] = useState([]); // Danh sách job từ API
  const [loading, setLoading] = useState(true); // Trạng thái tải
  const [error, setError] = useState(null); // Trạng thái lỗi

  // 2. STATE CHO BỘ LỌC (GIỮ NGUYÊN)
  const [filterLocation, setFilterLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 3. GỌI API LẤY DỮ LIỆU (Khi component được mount)
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Lấy token
        if (!token) {
          throw new Error("Bạn chưa đăng nhập!");
        }

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Gửi kèm Token
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải danh sách công việc.");
        }

        // Cập nhật state jobs (Dữ liệu backend trả về thường nằm trong data.jobs hoặc data)
        setJobs(data.jobs || []);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []); // [] rỗng nghĩa là chỉ chạy 1 lần khi load trang

  // 4. LOGIC LỌC DỮ LIỆU (AN TOÀN & CHỐNG CRASH)
  const filteredJobs = jobs.filter((job) => {
    // A. Lấy dữ liệu an toàn (Fallback về chuỗi rỗng nếu null)
    // Backend trả về: title, company_name, city
    const title = job.title || job.jobTitle || "";
    const company = job.company_name || job.companyName || "";
    const location = job.location || job.city || "";

    // B. Chuẩn hóa từ khóa
    const term = searchTerm.toLowerCase();

    // C. So sánh
    const matchesSearch =
      title.toLowerCase().includes(term) ||
      company.toLowerCase().includes(term);

    const matchesLocation = !filterLocation || location === filterLocation;

    return matchesSearch && matchesLocation;
  });

  // 5. LẤY LIST ĐỊA ĐIỂM (Unique)
  const uniqueLocations = [
    ...new Set(
      jobs
        .map((job) => job.location || job.city || "")
        .filter((loc) => loc !== "")
    ),
  ];

  // 6. GIAO DIỆN (RENDER)
  if (loading)
    return (
      <div className="loading-spinner">
        ⏳ Đang tải danh sách tin tuyển dụng...
      </div>
    );
  if (error) return <div className="error-message">❌ Lỗi: {error}</div>;

  return (
    <section id="jobs" className="job-management-section">
      <div className="container">
        <h2 className="section-title">Quản Lý Tin Tuyển Dụng</h2>
        <p className="section-subtitle">
          Danh sách các công việc bạn đã đăng tải lên hệ thống.
        </p>

        <div className="management-header card">
          {/* Box Tìm kiếm */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên vị trí hoặc công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Box Lọc địa điểm */}
          <div className="filter-box">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả địa điểm</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Thống kê */}
          <div className="job-stats">
            <div className="stat">
              <span className="stat-label">Tổng bài đăng:</span>
              <span className="stat-value">{jobs.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Hiển thị:</span>
              <span className="stat-value highlight">
                {filteredJobs.length}
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách Job hoặc Thông báo trống */}
        {filteredJobs.length > 0 ? (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.job_id || job.id} // Ưu tiên ID từ DB
                job={job}
                onEdit={onEdit}
                onDelete={(id) => {
                  // Nếu người dùng xóa thành công, ta xóa khỏi giao diện luôn
                  if (onDelete) onDelete(id);
                  // Cập nhật lại state để mất dòng đó ngay lập tức
                  setJobs((prevJobs) =>
                    prevJobs.filter((j) => (j.job_id || j.id) !== id)
                  );
                }}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <div
              className="empty-icon"
              style={{ fontSize: "40px", marginBottom: "10px" }}
            >
              🔍
            </div>
            <h3>Không tìm thấy tin tuyển dụng</h3>
            {searchTerm || filterLocation ? (
              <>
                <p>Thử thay đổi từ khóa hoặc bộ lọc địa điểm</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterLocation("");
                  }}
                  className="button button-primary button-small"
                >
                  Xóa bộ lọc
                </button>
              </>
            ) : (
              <p>Bạn chưa đăng tin tuyển dụng nào.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default JobManagementList;
