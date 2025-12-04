import React, { useState, useEffect } from "react";
import axios from "axios";
import JobListSidebar from "./JobListSidebar";
import ApplicantManager from "./ApplicantManager";
import "./styles/RecruiterDashboard.scss";

const API_BASE = "http://localhost:8080/api";

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null); // Job đang được chọn
  const [loadingJobs, setLoadingJobs] = useState(true);

  // 1. Load danh sách Job ngay khi vào trang
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        // Gọi API lấy list job của user hiện tại
        const res = await axios.get(`${API_BASE}/jobs/list-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setJobs(res.data.jobs);
          // Mặc định chọn job đầu tiên nếu có
          if (res.data.jobs.length > 0) {
            setSelectedJob(res.data.jobs[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi tải danh sách job:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchMyJobs();
  }, []);

  return (
    <div className="recruiter-dashboard">
      {/* KHU VỰC 1: SIDEBAR (Bên trái) */}
      <aside className="recruiter-sidebar">
        <JobListSidebar
          jobs={jobs}
          loading={loadingJobs}
          selectedJobId={selectedJob?.job_id}
          onSelectJob={(job) => setSelectedJob(job)}
        />
      </aside>

      {/* KHU VỰC 2: MAIN CONTENT (Bên phải) */}
      <main className="recruiter-content">
        <ApplicantManager selectedJob={selectedJob} />
      </main>
    </div>
  );
};

export default RecruiterDashboard;
