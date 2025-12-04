import React, { useEffect, useState } from "react";

// URL API Backend (Đảm bảo đúng port của bạn)
const API_BASE = "http://localhost:8080/api/applications";

const ApplicantsList = ({ jobId, onClose }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ 1. GỌI API LẤY DANH SÁCH ỨNG VIÊN
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        console.log(`[ApplicantsList] Đang tải hồ sơ cho Job ID: ${jobId}`);

        // Route này khớp với Controller: getJobApplicants
        const response = await fetch(`${API_BASE}/job/${jobId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải danh sách ứng viên");
        }

        // Kiểm tra xem data trả về có đúng cấu trúc mảng không
        // Controller trả về: { success: true, data: [...] }
        setApplicants(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Lỗi:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchApplicants();
    }
  }, [jobId]);

  // ✅ 2. XỬ LÝ DUYỆT / TỪ CHỐI
  const handleUpdateStatus = async (appId, newStatus) => {
    const confirmMsg =
      newStatus === "accepted"
        ? "Bạn muốn DUYỆT ứng viên này? (Email thông báo sẽ được gửi)"
        : "Bạn muốn TỪ CHỐI ứng viên này?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem("authToken");
      // Route này khớp với Controller: updateApplicationStatus
      const response = await fetch(`${API_BASE}/${appId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const resData = await response.json();

      if (response.ok) {
        alert(
          `Cập nhật thành công: ${
            newStatus === "accepted" ? "Đã duyệt" : "Đã từ chối"
          }`
        );
        // Cập nhật lại giao diện local (không cần gọi lại API)
        setApplicants((prev) =>
          prev.map((app) =>
            app.application_id === appId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        alert(resData.message || "Lỗi cập nhật");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  // Helper: Format ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper: Hiển thị trạng thái tiếng Việt
  const renderStatus = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge badge-pending">Chờ duyệt</span>;
      case "accepted":
        return <span className="badge badge-accepted">Đã tuyển</span>;
      case "rejected":
        return <span className="badge badge-rejected">Từ chối</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="applicants-overlay" onClick={onClose}>
      <div className="applicants-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Danh sách hồ sơ ứng tuyển</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="error-state">Lỗi: {error}</div>
          ) : applicants.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có ứng viên nào nộp hồ sơ cho công việc này.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="applicants-table">
                <thead>
                  <tr>
                    <th>Ứng viên</th>
                    <th>Liên hệ</th>
                    <th>CV</th>
                    <th>Lời nhắn (Cover Letter)</th>
                    <th>Ngày nộp</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((app) => (
                    <tr key={app.application_id}>
                      <td>
                        <strong>{app.candidate_name}</strong>
                      </td>
                      <td>
                        <div className="contact-info">
                          <span>📧 {app.contact_email}</span>
                          <span>📞 {app.contact_phone}</span>
                        </div>
                      </td>
                      <td>
                        {app.cv_link ? (
                          <a
                            href={app.cv_link}
                            target="_blank"
                            rel="noreferrer"
                            className="cv-link"
                          >
                            📄 {app.cv_title || "Xem CV"}
                          </a>
                        ) : (
                          <span className="no-cv">Không có CV</span>
                        )}
                      </td>
                      <td>
                        <div className="cover-letter" title={app.cover_letter}>
                          {app.cover_letter || "---"}
                        </div>
                      </td>
                      <td>{formatDate(app.applied_at)}</td>
                      <td>{renderStatus(app.status)}</td>
                      <td>
                        {app.status === "pending" && (
                          <div className="action-buttons">
                            <button
                              className="btn-approve"
                              onClick={() =>
                                handleUpdateStatus(
                                  app.application_id,
                                  "accepted"
                                )
                              }
                              title="Duyệt hồ sơ"
                            >
                              ✓
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() =>
                                handleUpdateStatus(
                                  app.application_id,
                                  "rejected"
                                )
                              }
                              title="Từ chối hồ sơ"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantsList;
