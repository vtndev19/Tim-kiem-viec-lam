import React, { useState, useRef, useEffect } from "react";
// 1. Import các hook cần thiết của React Router
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/page/CVBuilder.scss";
import { generateCVPrintHTML } from "../components/CVPrintTemplate";
import {
  normalizeCVData,
  denormalizeCVData, // Cần hàm này để chuyển data DB -> State
  downloadCVAsJSON,
  validateCVData,
} from "../utils/cvNormalizer";

// Components
import CVTopTabs from "../components/CVBuilder/CVTopTabs";
import CVInputSidebar from "../components/CVBuilder/CVInputSidebar";
import CVPreviewArea from "../components/CVBuilder/CVPreviewArea";

// Forms
import CVFormInfo from "../components/CVBuilder/forms/CVFormInfo";
import CVFormSummary from "../components/CVBuilder/forms/CVFormSummary";
import CVFormEducation from "../components/CVBuilder/forms/CVFormEducation";
import CVFormExperience from "../components/CVBuilder/forms/CVFormExperience";
import CVFormSkills from "../components/CVBuilder/forms/CVFormSkills";
import CVFormStyle from "../components/CVBuilder/forms/CVFormStyle";

// --- DỮ LIỆU MẶC ĐỊNH ---
const DEFAULT_CV_DATA = {
  personalInfo: {
    fullName: "Nguyễn Văn A",
    title: "Fresher Developer",
    email: "email@example.com",
    phone: "0123456789",
    address: "Hà Nội",
    photo: null,
  },
  summary: "",
  education: [],
  experience: [],
  skills: [],
  colors: {
    primary: "#0066cc",
    secondary: "#374151",
    text: "#111827",
    bg: "#ffffff",
    accent: "#e5e7eb",
  },
  font: "Arial",
};

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function CVBuilder() {
  const [activeTab, setActiveTab] = useState("info");
  const printRef = useRef();

  // 2. Khởi tạo các hook Router
  const location = useLocation(); // Để nhận dữ liệu từ trang List
  const navigate = useNavigate(); // Để quay lại trang List

  // --- LOGIC NHẬN DỮ LIỆU ---
  // Lấy dữ liệu thô gửi từ CVList (nếu có)
  const incomingData = location.state?.cvData;

  // --- KHỞI TẠO STATE ---
  const [cvData, setCvData] = useState(() => {
    // Trường hợp 1: Có dữ liệu từ trang List gửi sang (Chế độ Chỉnh sửa)
    if (incomingData) {
      console.log("Dữ liệu nhận được từ List:", incomingData);

      // Chuyển đổi dữ liệu DB -> Dạng State của React
      const processedData = denormalizeCVData(incomingData);

      // Quan trọng: Gắn lại ID để lát nữa biết đường gọi API Update
      if (incomingData.cv_id) {
        processedData.cv_id = incomingData.cv_id;
      }

      // Merge với default để tránh lỗi thiếu trường
      return {
        ...DEFAULT_CV_DATA,
        ...processedData,
        personalInfo: {
          ...DEFAULT_CV_DATA.personalInfo,
          ...processedData.personalInfo,
        },
        colors: { ...DEFAULT_CV_DATA.colors, ...(processedData.colors || {}) },
      };
    }

    // Trường hợp 2: Không có dữ liệu (Chế độ Tạo mới)
    return JSON.parse(JSON.stringify(DEFAULT_CV_DATA));
  });

  // State font size (cũng lấy từ dữ liệu cũ nếu có)
  const [fontSize, setFontSize] = useState(() => {
    if (incomingData && incomingData.meta_data) {
      // Nếu meta_data là string thì parse, nếu là object thì dùng luôn
      const meta =
        typeof incomingData.meta_data === "string"
          ? JSON.parse(incomingData.meta_data)
          : incomingData.meta_data;
      return meta.settings?.fontSize || 11;
    }
    return 11;
  });

  // --- CÁC HÀM XỬ LÝ DỮ LIỆU FORM ---
  const updateField = (section, field, value) => {
    setCvData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const updateSectionItem = (section, id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addSectionItem = (section, defaultObject) => {
    setCvData((prev) => ({
      ...prev,
      [section]: [...prev[section], { id: Date.now(), ...defaultObject }],
    }));
  };

  const removeSectionItem = (section, id) => {
    setCvData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  };

  // --- HÀM LƯU / CẬP NHẬT ---
  const handleSave = async () => {
    // 1. Validate
    const validation = validateCVData(cvData);
    if (!validation.isValid) {
      alert("Lỗi dữ liệu:\n" + validation.errors.join("\n"));
      return;
    }

    // 2. Xác định là Tạo mới hay Cập nhật dựa vào cv_id
    // cv_id đã được gắn vào state lúc khởi tạo nếu là edit
    const isEditing = !!cvData.cv_id;

    // 3. Chọn URL và Method phù hợp
    const url = isEditing
      ? `http://localhost:8080/api/cv/${cvData.cv_id}` // API Update
      : `http://localhost:8080/api/cv`; // API Create

    const method = isEditing ? "PUT" : "POST";

    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      // Chuẩn hóa dữ liệu để gửi đi
      const payload = normalizeCVData(cvData, fontSize);

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          isEditing ? "Đã cập nhật CV thành công!" : "Đã tạo mới CV thành công!"
        );

        // Nếu là tạo mới thành công, chuyển hướng về trang danh sách
        if (!isEditing) {
          navigate("/cv-list"); // Đường dẫn tới trang danh sách của bạn
        }
      } else {
        alert("Lỗi từ server: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối khi lưu CV.");
    }
  };

  // --- CÁC HÀM TIỆN ÍCH KHÁC ---
  const handleDownloadJSON = () => {
    downloadCVAsJSON(cvData, fontSize);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const a4Content = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=900,height=1200");
    const html = generateCVPrintHTML(a4Content, cvData, fontSize);
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleBack = () => {
    // Quay lại trang trước đó (thường là trang List)
    navigate(-1);
  };

  // --- RENDER TAB CONTENT ---
  const tabs = [
    { id: "info", label: "Thông tin", icon: "👤" },
    { id: "summary", label: "Giới thiệu", icon: "📝" },
    { id: "education", label: "Học vấn", icon: "🎓" },
    { id: "experience", label: "Kinh nghiệm", icon: "💼" },
    { id: "skills", label: "Kỹ năng", icon: "⚡" },
    { id: "style", label: "Thiết kế", icon: "🎨" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return <CVFormInfo cvData={cvData} updateField={updateField} />;
      case "summary":
        return <CVFormSummary cvData={cvData} setCvData={setCvData} />;
      case "education":
        return (
          <CVFormEducation
            cvData={cvData}
            updateSectionItem={updateSectionItem}
            addSectionItem={addSectionItem}
            removeSectionItem={removeSectionItem}
          />
        );
      case "experience":
        return (
          <CVFormExperience
            cvData={cvData}
            updateSectionItem={updateSectionItem}
            addSectionItem={addSectionItem}
            removeSectionItem={removeSectionItem}
          />
        );
      case "skills":
        return (
          <CVFormSkills
            cvData={cvData}
            updateSectionItem={updateSectionItem}
            addSectionItem={addSectionItem}
            removeSectionItem={removeSectionItem}
          />
        );
      case "style":
        return (
          <CVFormStyle
            cvData={cvData}
            setCvData={setCvData}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="cv-builder">
      {/* HEADER: Nút quay lại và Tiêu đề */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 20px",
          background: "#fff",
          borderBottom: "1px solid #ddd",
        }}
      >
        <button
          onClick={handleBack}
          style={{
            marginRight: "15px",
            padding: "8px 15px",
            cursor: "pointer",
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        >
          ← Quay lại
        </button>
        <h3 style={{ margin: 0 }}>
          {/* Kiểm tra xem đang ở chế độ nào để hiện tiêu đề phù hợp */}
          {cvData.cv_id
            ? `Chỉnh sửa CV: ${cvData.personalInfo.fullName}`
            : "Tạo CV Mới"}
        </h3>
      </div>

      <CVTopTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
      />

      <div className="cv-main-content">
        <CVInputSidebar
          onPrint={handlePrint}
          onSave={handleSave}
          onDownloadJSON={handleDownloadJSON}
        >
          {renderTabContent()}
        </CVInputSidebar>

        <CVPreviewArea ref={printRef} cvData={cvData} fontSize={fontSize} />
      </div>
    </div>
  );
}
