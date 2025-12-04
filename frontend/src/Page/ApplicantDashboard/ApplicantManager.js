import React, { useEffect, useState } from "react";
import axios from "axios";
import ApplicantTable from "./ApplicantTable";
import ApplicantDetailModal from "./ApplicantDetailModal";
import "./styles/ApplicantManager.scss";

const API_BASE = "http://localhost:8080/api";

const ApplicantManager = ({ selectedJob }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho Modal chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);

  // Mỗi khi selectedJob thay đổi, load lại danh sách ứng viên
  useEffect(() => {
    if (!selectedJob) return;

    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          `${API_BASE}/applications/job/${selectedJob.job_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setApplicants(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi tải ứng viên:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [selectedJob]);

  // --- HÀM XỬ LÝ DUYỆT ĐƠN (Đã bổ sung logic) ---
  const handleApprove = async (appId) => {
    try {
      const token = localStorage.getItem("authToken");
      // Gọi API cập nhật trạng thái 'accepted'
      await axios.put(
        `${API_BASE}/applications/status/${appId}`,
        { status: "accepted" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Cập nhật giao diện ngay lập tức (không cần load lại trang)
      setApplicants((prev) =>
        prev.map((app) =>
          app.application_id === appId ? { ...app, status: "accepted" } : app
        )
      );
      alert("Đã chấp nhận hồ sơ! ✅");
    } catch (error) {
      console.error("Lỗi duyệt đơn:", error);
      alert("Có lỗi xảy ra khi duyệt đơn.");
    }
  };

  // --- HÀM XỬ LÝ TỪ CHỐI ĐƠN (Đã bổ sung logic) ---
  const handleReject = async (appId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối ứng viên này?")) return;

    try {
      const token = localStorage.getItem("authToken");
      // Gọi API cập nhật trạng thái 'rejected'
      await axios.put(
        `${API_BASE}/applications/status/${appId}`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Cập nhật giao diện ngay lập tức
      setApplicants((prev) =>
        prev.map((app) =>
          app.application_id === appId ? { ...app, status: "rejected" } : app
        )
      );
    } catch (error) {
      console.error("Lỗi từ chối đơn:", error);
      alert("Có lỗi xảy ra khi từ chối đơn.");
    }
  };

  const handleViewDetail = (applicant) => {
    setSelectedApplicantId(applicant.application_id);
    setIsModalOpen(true);
  };

  if (!selectedJob) {
    return (
      <div className="empty-state">
        👈 Vui lòng chọn một công việc bên trái để xem ứng viên
      </div>
    );
  }

  return (
    <div className="applicant-manager">
      <header className="manager-header">
        <div>
          <h2>{selectedJob.title}</h2>
          <p className="sub-text">
            📍 {selectedJob.location} | 💰 {selectedJob.salary_range}
          </p>
        </div>
        <div className="stats-quick">
          Tổng hồ sơ: <strong>{applicants.length}</strong>
        </div>
      </header>

      <div className="manager-content">
        {loading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : (
          <ApplicantTable
            applicants={applicants}
            // 👇 ĐÃ SỬA: Đổi tên prop từ onViewCoverLetter thành onViewDetail
            onViewDetail={handleViewDetail}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>

      {/* Modal Chi tiết hiển thị đè lên Dashboard */}
      {isModalOpen && (
        <ApplicantDetailModal
          applicationId={selectedApplicantId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ApplicantManager;
