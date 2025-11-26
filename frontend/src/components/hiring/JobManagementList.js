import React, { useState, useEffect } from "react";
import JobCard from "./JobCard";
import "./JobManagementList.scss";

const API_URL = "http://localhost:8080/api/jobs/list-jobs";

const JobManagementList = ({ onEdit, onDelete, onViewDetail }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterLocation, setFilterLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Log khi Component bắt đầu chạy
  console.log("🎨 Render: JobManagementList đang hiển thị...");

  useEffect(() => {
    const fetchMyJobs = async () => {
      console.group("🚀 BẮT ĐẦU GỌI API LẤY JOBS"); // Gom nhóm log cho gọn
      try {
        setLoading(true);

        // 2. Kiểm tra Token
        const token = localStorage.getItem("authToken");
        console.log(
          "🔑 Kiểm tra Token:",
          token ? "✅ Đã tìm thấy Token" : "❌ KHÔNG CÓ TOKEN (Lỗi 1)"
        );

        if (!token) {
          throw new Error("Bạn chưa đăng nhập (Không tìm thấy Token).");
        }

        // 3. Bắt đầu Fetch
        console.log("📡 Đang gọi tới:", API_URL);

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("STATUS CODE:", response.status); // 200 là OK, 401 là Lỗi quyền, 500 là lỗi server

        const data = await response.json();
        console.log("📦 Dữ liệu thô từ Server:", data); // Xem cấu trúc data trả về

        if (!response.ok) {
          throw new Error(data.message || `Lỗi API: ${response.status}`);
        }

        // 4. Kiểm tra dữ liệu trước khi set State
        const listJobs = data.jobs || data || []; // Phòng hờ cấu trúc khác nhau
        console.log(`✅ Đã lấy được ${listJobs.length} công việc.`);

        setJobs(listJobs);
      } catch (err) {
        console.error("❌ CÓ LỖI XẢY RA:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log("🏁 Kết thúc quá trình gọi API.");
        console.groupEnd(); // Đóng nhóm log
      }
    };

    fetchMyJobs();
  }, []);

  // 5. Log quá trình lọc (Filter)
  const filteredJobs = jobs.filter((job) => {
    const title = job.title || job.jobTitle || "";
    const company = job.company_name || job.companyName || "";
    const location = job.location || job.city || "";
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(term) ||
      company.toLowerCase().includes(term);
    const matchesLocation = !filterLocation || location === filterLocation;

    return matchesSearch && matchesLocation;
  });

  // Log kết quả lọc (Chỉ log khi user nhập tìm kiếm để đỡ spam)
  if (searchTerm || filterLocation) {
    console.log(
      `🔍 Đang lọc: Tìm "${searchTerm}" tại "${filterLocation}" -> Kết quả: ${filteredJobs.length} bài.`
    );
  }

  const uniqueLocations = [
    ...new Set(
      jobs
        .map((job) => job.location || job.city || "")
        .filter((loc) => loc !== "")
    ),
  ];

  // === PHẦN GIAO DIỆN ===

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center", fontSize: "18px" }}>
        ⏳ <strong>Đang kết nối Server...</strong> <br />
        <small>(Vui lòng mở F12 xem Console nếu đợi quá lâu)</small>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "50px", textAlign: "center", color: "red" }}>
        ❌ <strong>Lỗi tải dữ liệu:</strong> {error} <br />
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: "10px", padding: "5px 10px" }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <section id="jobs" className="job-management-section">
      <div className="container">
        {/* THÊM DÒNG DEBUG TRÊN UI ĐỂ BẠN DỄ THẤY */}
        <div
          style={{
            background: "#f0f0f0",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
            fontSize: "12px",
            border: "1px dashed #999",
          }}
        >
          🐞 <strong>Debug Info:</strong> Tìm thấy {jobs.length} bài từ API.
          Đang hiển thị {filteredJobs.length} bài.
        </div>

        <h2 className="section-title">Quản Lý Tin Tuyển Dụng</h2>

        <div className="management-header card">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-box">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả địa điểm</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="job-stats">
            <div className="stat">
              <span className="stat-label">Tổng tin:</span>
              <span className="stat-value">{jobs.length}</span>
            </div>
          </div>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.job_id || job.id}
                job={job}
                onEdit={onEdit}
                onDelete={(id) => {
                  console.log("🗑️ User yêu cầu xóa Job ID:", id);
                  if (onDelete) onDelete(id);
                  setJobs((prev) =>
                    prev.filter((j) => (j.job_id || j.id) !== id)
                  );
                }}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <h3>Không tìm thấy dữ liệu</h3>
            <p>API trả về mảng rỗng hoặc bộ lọc đã ẩn hết kết quả.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobManagementList;
