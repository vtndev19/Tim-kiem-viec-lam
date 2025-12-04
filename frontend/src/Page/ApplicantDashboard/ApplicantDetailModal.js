import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // ✅ Import Link để chuyển trang
import "./styles/ApplicantDetailModal.scss";

const API_BASE = "http://localhost:8080/api";

const ApplicantDetailModal = ({ applicationId, isOpen, onClose }) => {
  const [appContext, setAppContext] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          `${API_BASE}/applications/detail/${applicationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          // Chỉ cần lấy context, cv_id đã nằm trong object này rồi
          setAppContext(res.data.data.application_context);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Cleanup state khi đóng modal
    return () => setAppContext(null);
  }, [isOpen, applicationId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {loading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="split-layout">
            {/* === CỘT TRÁI: THÔNG TIN ỨNG TUYỂN === */}
            {appContext && (
              <aside className="app-sidebar">
                <div className="candidate-header">
                  <img
                    src={
                      appContext.candidate.avatar ||
                      `https://ui-avatars.com/api/?name=${appContext.candidate.name}`
                    }
                    alt="avt"
                    className="avatar-lg"
                  />
                  <h3>{appContext.candidate.name}</h3>
                  <span className="job-applied">
                    Ứng tuyển: {appContext.job_title}
                  </span>
                </div>

                <div className="info-block">
                  <label>Liên hệ</label>
                  <p>📧 {appContext.candidate.email}</p>
                  <p>📞 {appContext.candidate.phone}</p>
                </div>

                <div className="info-block">
                  <label>Ngày nộp hồ sơ</label>
                  <p>
                    📅{" "}
                    {new Date(appContext.applied_at).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>

                {appContext.cover_letter && (
                  <div className="info-block cover-letter">
                    <label>Thư giới thiệu</label>
                    <div className="letter-content">
                      "{appContext.cover_letter}"
                    </div>
                  </div>
                )}
              </aside>
            )}

            {/* === CỘT PHẢI: THẺ HÀNH ĐỘNG (ACTION CARD) === */}
            <main className="cv-action-wrapper">
              <div className="action-card">
                <div className="icon-doc">📄</div>
                <h3>Hồ Sơ Năng Lực (CV)</h3>
                <p>
                  Xem chi tiết kỹ năng, kinh nghiệm, học vấn và dự án của ứng
                  viên này trong giao diện đầy đủ.
                </p>

                {/* Nút bấm chuyển sang tab mới */}
                {appContext?.cv_id ? (
                  <Link
                    to={`/view-cv/${appContext.cv_id}`}
                    target="_blank"
                    className="btn-view-full"
                  >
                    Xem CV Chi Tiết ↗
                  </Link>
                ) : (
                  <p className="error-text">Không tìm thấy ID CV</p>
                )}

                {/* Link tải PDF dự phòng (nếu có file upload gốc) */}
                {appContext?.pdf_url && (
                  <a
                    href={appContext.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="link-download"
                  >
                    Hoặc tải xuống PDF gốc
                  </a>
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantDetailModal;
