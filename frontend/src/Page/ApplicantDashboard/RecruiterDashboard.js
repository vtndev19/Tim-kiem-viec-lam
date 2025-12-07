import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
// 1. Import các hooks cần thiết của Router
import { useParams, useNavigate } from "react-router-dom";
import JobListSidebar from "./JobListSidebar";
import ApplicantManager from "./ApplicantManager";
import "./styles/RecruiterDashboard.scss";

const API_BASE = "http://localhost:8080/api";

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // 2. Lấy jobId từ URL và hàm điều hướng
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Load danh sách Job (Logic cũ giữ nguyên)
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${API_BASE}/jobs/list-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setJobs(res.data.jobs);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách job:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchMyJobs();
  }, []);

  // 3. Logic tự động chọn Job:
  // Nếu vào trang dashboard mà chưa có ID trên URL -> Tự chuyển hướng sang job đầu tiên
  useEffect(() => {
    if (!loadingJobs && jobs.length > 0 && !jobId) {
      navigate(`/recruiter-dashboard/${jobs[0].job_id}`, { replace: true });
    }
  }, [jobs, loadingJobs, jobId, navigate]);

  // 4. Tìm ra Job đang được chọn dựa trên URL (Logic quan trọng nhất)
  // useMemo giúp tính toán lại mỗi khi danh sách jobs hoặc URL thay đổi
  const activeJob = useMemo(() => {
    if (!jobs || jobs.length === 0) return null;

    // Nếu URL có ID, tìm job khớp ID đó
    if (jobId) {
      // Chuyển về String để so sánh an toàn
      const foundJob = jobs.find((j) => String(j.job_id) === String(jobId));
      return foundJob || jobs[0]; // Nếu id trên url ko tồn tại thì fallback về job đầu
    }

    // Mặc định trả về job đầu tiên
    return jobs[0];
  }, [jobs, jobId]);

  // 5. Hàm xử lý khi click vào sidebar -> Đổi URL thay vì set State
  const handleSelectJob = (job) => {
    navigate(`/recruiter-dashboard/${job.job_id}`);
  };

  return (
    <div className="recruiter-dashboard">
      {/* KHU VỰC 1: SIDEBAR */}
      <aside className="recruiter-sidebar">
        <JobListSidebar
          jobs={jobs}
          loading={loadingJobs}
          // Truyền ID lấy từ URL vào để highlight menu
          selectedJobId={activeJob?.job_id}
          // Khi click thì gọi hàm đổi URL
          onSelectJob={handleSelectJob}
        />
      </aside>

      {/* KHU VỰC 2: MAIN CONTENT */}
      <main className="recruiter-content">
        {/* Truyền job đã tìm thấy xuống component con */}
        {/* ApplicantManager sẽ tự watch prop này để gọi API lấy thống kê */}
        <ApplicantManager selectedJob={activeJob} />
      </main>
    </div>
  );
};

export default RecruiterDashboard;
