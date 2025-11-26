import React, { useState, useEffect } from "react";
import HiringHeader from "../components/hiring/HiringHeader";
import HiringHero from "../components/hiring/HiringHero";
import JobPostingForm from "../components/hiring/JobPostingForm";
import JobManagementList from "../components/hiring/JobManagementList";
import JobEditModal from "../components/hiring/JobEditModal";
import JobDetailModal from "../components/hiring/JobDetailModal";
import "../styles/hiring/main.scss";
import "./HiringDashboard.scss";

const HiringDashboard = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      jobTitle: "Senior React Developer",
      companyName: "Tech Corp Vietnam",
      salary: "15 - 25 triệu VND",
      location: "Hồ Chí Minh",
      description:
        "Chúng tôi đang tìm kiếm một Senior React Developer giàu kinh nghiệm với 5+ năm làm việc trong các dự án web hiện đại. Ứng viên cần có kỹ năng mạnh về ReactJS, JavaScript ES6+, và các công cụ liên quan. Bạn sẽ làm việc trong một môi trường startup năng động, cơ hội học hỏi và phát triển kỹ năng là rất lớn.",
      requirements:
        "• 5+ năm kinh nghiệm với ReactJS\n• Thành thạo JavaScript ES6+ và TypeScript\n• Có kinh nghiệm với Redux, Context API\n• Hiểu biết về SEO, Performance Optimization\n• Kỹ năng giao tiếp và teamwork tốt\n• Bằng cấp IT hoặc tương đương",
      benefits:
        "• Mức lương cạnh tranh từ 15-25 triệu/tháng\n• Lương thăng hạng, thưởng hiệu suất\n• Bảo hiểm sức khỏe, xã hội toàn bộ\n• Làm việc 5 ngày/tuần\n• Được hỗ trợ đào tạo chuyên môn\n• Môi trường làm việc thân thiện",
      deadline: "2025-12-31",
      createdAt: "2025-11-10",
      applicants: 12,
    },
    {
      id: 2,
      jobTitle: "Full Stack Developer",
      companyName: "Digital Solutions Ltd",
      salary: "12 - 20 triệu VND",
      location: "Hà Nội",
      description:
        "Tìm kiếm Full Stack Developer để tham gia vào các dự án web và mobile app. Ứng viên cần có kinh nghiệm làm việc với cả frontend và backend, có khả năng xây dựng giải pháp hoàn chỉnh từ thiết kế đến triển khai.",
      requirements:
        "• 3+ năm kinh nghiệm Full Stack\n• Thành thạo ReactJS/Vue hoặc Angular\n• Hiểu biết NodeJS, Python hoặc Java\n• Có kinh nghiệm với database (SQL, NoSQL)\n• Kỹ năng Git, API REST\n• Có portfolio hoặc GitHub",
      benefits:
        "• Lương: 12-20 triệu/tháng\n• Thưởng tháng 13, thưởng hiệu suất\n• Bảo hiểm đầy đủ\n• Phép năm, phép đặc biệt\n• Cơ hội thăng chức nhanh\n• Đào tạo liên tục",
      deadline: "2025-12-15",
      createdAt: "2025-11-08",
      applicants: 8,
    },
  ]);

  const [editingJob, setEditingJob] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [detailingJob, setDetailingJob] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handlePostJob = (newJob) => {
    setJobs([newJob, ...jobs]);
    setSuccessMessage("✓ Tin tuyển dụng đã được đăng thành công!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleSaveJob = (updatedJob) => {
    setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
    setIsEditModalOpen(false);
    setEditingJob(null);
    setSuccessMessage("✓ Tin tuyển dụng đã được cập nhật!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteJob = (jobId) => {
    setDeleteConfirm(jobId);
  };

  const confirmDelete = (jobId) => {
    setJobs(jobs.filter((job) => job.id !== jobId));
    setDeleteConfirm(null);
    setSuccessMessage("✓ Tin tuyển dụng đã bị xóa!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleViewDetail = (job) => {
    setDetailingJob(job);
    setIsDetailModalOpen(true);
  };

  const handleNavigate = (section) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePostJobClick = () => {
    handleNavigate("form");
  };

  const handleManageJobsClick = () => {
    handleNavigate("jobs");
  };

  return (
    <div className="hiring-dashboard">
      {successMessage && <div className="success-toast">{successMessage}</div>}

      {deleteConfirm && (
        <div
          className="delete-confirm-overlay"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="delete-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Xác nhận xóa tin tuyển dụng?</h3>
            <p>
              Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa không?
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="button button-secondary"
              >
                Hủy
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                className="button button-danger"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <HiringHero
        onPostJobClick={handlePostJobClick}
        onManageJobsClick={handleManageJobsClick}
      />

      <JobPostingForm onJobPost={handlePostJob} />

      <JobManagementList
        jobs={jobs}
        onEdit={handleEditJob}
        onDelete={handleDeleteJob}
        onViewDetail={handleViewDetail}
      />

      <JobEditModal
        job={editingJob}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
      />

      <JobDetailModal
        job={detailingJob}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailingJob(null);
        }}
      />
    </div>
  );
};

export default HiringDashboard;
