import React, { useState, useEffect } from "react";
import JobCard from "./JobCard"; // Giả sử JobCard nằm cùng thư mục hiring
import JobDetailModal from "./JobDetailModal"; // Giả sử JobDetailModal nằm cùng thư mục hiring
// ✅ FIX 1: Sửa đường dẫn import (Lùi 1 cấp là ra src/components, sau đó vào Employer)
import ApplicantsList from "./ApplicantsList.js";
import "./JobManagementList.scss";

// URL lấy danh sách job của người dùng hiện tại
const LIST_JOBS_API = "http://localhost:8080/api/jobs/list-jobs";
// URL lấy chi tiết job (để xem số lượng hồ sơ)
const JOB_DETAIL_API = "http://localhost:8080/api/jobs";

const JobManagementList = ({ onEdit, onDelete }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterLocation, setFilterLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State cho Modal
  const [selectedJobForDetail, setSelectedJobForDetail] = useState(null);
  const [selectedJobIdForApplicants, setSelectedJobIdForApplicants] =
    useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  console.log("Render: JobManagementList đang hiển thị...");

  // 1. Fetch Danh sách Job
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("Bạn chưa đăng nhập (Không tìm thấy Token).");
        }

        const response = await fetch(LIST_JOBS_API, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `Lỗi API: ${response.status}`);
        }

        // Lấy mảng jobs từ response
        const listJobs =
          data.data || data.jobs || (Array.isArray(data) ? data : []) || [];
        setJobs(listJobs);
      } catch (err) {
        console.error("LỖI:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []);

  // ✅ FIX 2: Khai báo filteredJobs trước khi dùng trong return
  const filteredJobs = jobs.filter((job) => {
    const title = (job.title || job.jobTitle || "").toLowerCase();
    const company = (job.company_name || job.companyName || "").toLowerCase();
    const location = (job.location || job.city || "").toLowerCase();

    const term = searchTerm.toLowerCase();
    const matchesSearch = title.includes(term) || company.includes(term);
    const matchesLocation =
      !filterLocation || location === filterLocation.toLowerCase();

    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = [
    ...new Set(
      jobs
        .map((job) => job.location || job.city || "")
        .filter((loc) => loc !== "")
    ),
  ];

  // Hàm gọi API lấy chi tiết (Khi bấm xem chi tiết)
  const handleViewDetail = async (jobId) => {
    try {
      setDetailLoading(true);
      console.log(`Đang tải chi tiết cho Job ID: ${jobId}`);

      const response = await fetch(`${JOB_DETAIL_API}/${jobId}`);
      const data = await response.json();

      if (response.ok) {
        const jobData = data.data || data;
        setSelectedJobForDetail(jobData);
      } else {
        alert("Không thể tải chi tiết công việc");
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Hàm chuyển từ Modal chi tiết sang Modal danh sách
  const handleOpenApplicants = (jobId) => {
    setSelectedJobForDetail(null); // Đóng chi tiết
    setSelectedJobIdForApplicants(jobId); // Mở danh sách
  };

  // --- GIAO DIỆN ---
  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <strong>Đang tải danh sách công việc...</strong>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "50px", textAlign: "center", color: "red" }}>
        <strong>Lỗi:</strong> {error} <br />
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: 10 }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <section id="jobs" className="job-management-section">
      <div className="container">
        <h2 className="section-title">Quản Lý Tin Tuyển Dụng</h2>

        <div className="management-header card">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm theo tên bài đăng..."
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
            <span className="stat-label">Tổng tin: {jobs.length}</span>
          </div>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="jobs-grid">
            {detailLoading && (
              <div className="loading-overlay">Đang tải...</div>
            )}

            {filteredJobs.map((job) => (
              <JobCard
                key={job.job_id || job.id}
                job={job}
                onEdit={onEdit}
                onDelete={(id) => {
                  if (onDelete) onDelete(id);
                  setJobs((prev) =>
                    prev.filter((j) => (j.job_id || j.id) !== id)
                  );
                }}
                // Bấm vào card -> Gọi API chi tiết rồi mở Modal Detail
                onViewDetail={() => handleViewDetail(job.job_id || job.id)}
                // Bấm nút xem ứng viên -> Mở Modal Applicants
                onViewApplicants={() =>
                  handleOpenApplicants(job.job_id || job.id)
                }
              />
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <h3>Không tìm thấy dữ liệu</h3>
          </div>
        )}

        {/* --- 1. MODAL CHI TIẾT --- */}
        <JobDetailModal
          job={selectedJobForDetail}
          isOpen={!!selectedJobForDetail}
          onClose={() => setSelectedJobForDetail(null)}
          onViewApplicants={handleOpenApplicants}
        />

        {/* --- 2. MODAL DANH SÁCH ỨNG VIÊN --- */}
        {selectedJobIdForApplicants && (
          <ApplicantsList
            jobId={selectedJobIdForApplicants}
            onClose={() => setSelectedJobIdForApplicants(null)}
          />
        )}
      </div>
    </section>
  );
};

export default JobManagementList;
