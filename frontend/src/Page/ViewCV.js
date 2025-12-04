import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import CVPreviewArea from "../components/CVBuilder/CVPreviewArea.js";
import { denormalizeCVData } from "../utils/cvNormalizer.js";

// --- Import file SCSS ---
import "../styles/page/ViewCV.scss";

// --- HÀM HELPER: Giải mã JWT Token (Thêm mới để sửa lỗi) ---
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const CVView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  // State
  const [cvData, setCvData] = useState(null);
  const [fontSize, setFontSize] = useState(11);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // --- Fetch Data Logic ---
  useEffect(() => {
    const fetchCVDetail = async () => {
      try {
        setLoading(true);
        // Gọi API Public
        const response = await axios.get(
          `http://localhost:8080/api/cv/view/${id}`
        );
        const result = response.data;

        if (result.success) {
          const processedData = denormalizeCVData(result.data);
          setCvData(processedData);

          if (processedData.settings?.fontSize) {
            setFontSize(processedData.settings.fontSize);
          }

          // --- PHẦN SỬA LỖI: Check Owner ---
          const token = localStorage.getItem("authToken");
          if (token) {
            // Dùng hàm parseJwt để đọc thông tin từ token
            const decodedUser = parseJwt(token);

            // Kiểm tra user_id (đảm bảo so sánh chuỗi với chuỗi)
            // Lưu ý: Kiểm tra xem trong Token của bạn field là 'user_id' hay 'id'
            if (
              decodedUser &&
              String(decodedUser.user_id) === String(processedData.user_id)
            ) {
              setIsOwner(true);
            }
          }
          // ---------------------------------
        } else {
          setError(result.message || "Không tìm thấy CV");
        }
      } catch (err) {
        console.error("Lỗi tải CV:", err);
        setError("Lỗi kết nối hoặc CV không tồn tại.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCVDetail();
  }, [id]);

  // --- Handle Print ---
  const handlePrint = () => {
    window.print();
  };

  // --- Render ---
  if (loading)
    return <div className="loading-screen">Đang tải dữ liệu CV...</div>;

  if (error) {
    return (
      <div
        className="error-screen"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        <h3>⚠️ {error}</h3>
        <Link to="/" className="btn btn-back">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="cv-view-page">
      {/* 1. THANH CÔNG CỤ (Toolbar) - Sẽ bị ẩn khi in nhờ CSS */}
      <div className="cv-toolbar">
        <div className="toolbar-left">
          <Link to={isOwner ? "/cv" : "/"} className="btn btn-back">
            &larr; {isOwner ? "Quay lại danh sách" : "Trang chủ"}
          </Link>
          <span style={{ color: "#ccc" }}>|</span>
          <h2>{cvData?.personalInfo?.fullName || "CV Ứng viên"}</h2>
        </div>

        <div className="toolbar-right">
          {isOwner && (
            <button
              onClick={() => navigate("/builder", { state: { cvData } })}
              className="btn btn-edit"
            >
              ✏️ Chỉnh sửa
            </button>
          )}

          <button onClick={handlePrint} className="btn btn-print">
            🖨️ Tải PDF / In
          </button>
        </div>
      </div>

      {/* 2. KHUNG GIẤY CV (Phần duy nhất hiện khi in) */}
      <div className="cv-paper-container" ref={printRef}>
        {/* Component nội dung CV nằm ở đây */}
        <CVPreviewArea cvData={cvData} fontSize={fontSize} />
      </div>
    </div>
  );
};

export default CVView;
