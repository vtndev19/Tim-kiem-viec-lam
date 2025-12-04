import React from "react";
import "./styles/ApplicantTable.scss"; // File CSS ở bước 3

const ApplicantTable = ({ applicants, onViewDetail, onApprove, onReject }) => {
  // Helper: Chọn màu cho trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge pending">Chờ duyệt</span>;
      case "reviewed":
        return <span className="badge reviewed">Đã xem</span>;
      case "accepted":
        return <span className="badge accepted">Đã nhận</span>;
      case "rejected":
        return <span className="badge rejected">Đã loại</span>;
      default:
        return <span className="badge">Mới</span>;
    }
  };

  if (!applicants || applicants.length === 0) {
    return (
      <div className="table-empty">
        <p>Chưa có hồ sơ nào ứng tuyển cho công việc này.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Ứng viên</th>
            <th>Ngày nộp</th>
            <th>Vị trí CV</th>
            <th>Trạng thái</th>
            <th className="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((app) => (
            <tr key={app.application_id}>
              {/* Cột 1: Thông tin ứng viên + Avatar */}
              <td>
                <div className="candidate-cell">
                  <img
                    src={
                      app.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        app.candidate_name
                      )}&background=random`
                    }
                    alt="avatar"
                    className="avatar"
                  />
                  <div>
                    <div className="name">{app.candidate_name}</div>
                    <div className="email">{app.contact_email}</div>
                  </div>
                </div>
              </td>

              {/* Cột 2: Ngày nộp */}
              <td>{new Date(app.applied_at).toLocaleDateString("vi-VN")}</td>

              {/* Cột 3: Tên CV */}
              <td title={app.summary} className="cv-title">
                {app.cv_title || "CV cơ bản"}
              </td>

              {/* Cột 4: Trạng thái */}
              <td>{getStatusBadge(app.status)}</td>

              {/* Cột 5: Nút bấm */}
              <td className="text-right">
                <button
                  className="btn-icon view"
                  onClick={() => onViewDetail(app)}
                  title="Xem chi tiết"
                >
                  👁️
                </button>

                {app.status === "pending" || app.status === "reviewed" ? (
                  <>
                    <button
                      className="btn-icon approve"
                      onClick={() => onApprove(app.application_id)}
                      title="Chấp nhận"
                    >
                      ✅
                    </button>
                    <button
                      className="btn-icon reject"
                      onClick={() => onReject(app.application_id)}
                      title="Từ chối"
                    >
                      ❌
                    </button>
                  </>
                ) : (
                  <span className="action-done">Đã xử lý</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicantTable;
