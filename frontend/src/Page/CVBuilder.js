import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Styles & Utils
import "../styles/page/CVBuilder.scss";
import { generateCVPrintHTML } from "../components/CVPrintTemplate";
import {
  normalizeCVData,
  denormalizeCVData,
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

// --- CONSTANTS ---
const API_BASE = "http://localhost:8080/api/cv";

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

const TAB_CONFIG = [
  { id: "info", label: "Thông tin", icon: "👤" },
  { id: "summary", label: "Giới thiệu", icon: "📝" },
  { id: "education", label: "Học vấn", icon: "🎓" },
  { id: "experience", label: "Kinh nghiệm", icon: "💼" },
  { id: "skills", label: "Kỹ năng", icon: "⚡" },
  { id: "style", label: "Thiết kế", icon: "🎨" },
];

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function CVBuilder() {
  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("info");

  // Custom Toast State
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const toastTimeoutRef = useRef(null);

  // Data State
  const incomingData = location.state?.cvData;
  const [cvData, setCvData] = useState(() => {
    if (incomingData) {
      const processedData = denormalizeCVData(incomingData);
      return {
        ...DEFAULT_CV_DATA,
        ...processedData,
        cv_id: incomingData.cv_id || processedData.cv_id,
        personalInfo: {
          ...DEFAULT_CV_DATA.personalInfo,
          ...processedData.personalInfo,
        },
        colors: { ...DEFAULT_CV_DATA.colors, ...(processedData.colors || {}) },
      };
    }
    return JSON.parse(JSON.stringify(DEFAULT_CV_DATA));
  });

  const [fontSize, setFontSize] = useState(() => {
    if (incomingData?.meta_data) {
      const meta =
        typeof incomingData.meta_data === "string"
          ? JSON.parse(incomingData.meta_data)
          : incomingData.meta_data;
      return meta.settings?.fontSize || 11;
    }
    return 11;
  });

  // --- HELPER: CUSTOM TOAST ---
  const showToast = (message, type = "success") => {
    // Clear timeout cũ nếu user spam click
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    setToast({ show: true, message, type });

    // Tự động tắt sau 3 giây
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- FORM HANDLERS ---
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

  // --- ACTIONS ---
  const handleSave = async () => {
    // 1. Validate
    const validation = validateCVData(cvData);
    if (!validation.isValid) {
      showToast(`Thiếu thông tin: ${validation.errors[0]}`, "error");
      return;
    }

    const isEditing = !!cvData.cv_id;
    const url = isEditing ? `${API_BASE}/${cvData.cv_id}` : API_BASE;
    const method = isEditing ? "PUT" : "POST";

    try {
      showToast("Đang lưu hồ sơ...", "info"); // Show loading toast
      const token = localStorage.getItem("authToken");
      const payload = normalizeCVData(cvData, fontSize);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          isEditing ? "Cập nhật thành công!" : "Tạo mới thành công!",
          "success"
        );
        setTimeout(() => navigate("/cv"), 1500);
        if (!isEditing) {
          setTimeout(() => navigate("/cv"), 1500);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || "Lỗi kết nối server", "error");
    }
  };

  const handleDownloadJSON = () => {
    try {
      downloadCVAsJSON(cvData, fontSize);
      showToast("Đang tải xuống dữ liệu...", "success");
    } catch (e) {
      showToast("Lỗi khi tải file", "error");
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    showToast("Đang mở cửa sổ in...", "info");

    const a4Content = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=900,height=1200");

    if (printWindow) {
      const html = generateCVPrintHTML(a4Content, cvData, fontSize);
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      showToast("Vui lòng cho phép popup để in", "error");
    }
  };

  // --- RENDER CONTENT ---
  const renderTabContent = () => {
    const commonProps = {
      cvData,
      setCvData,
      updateField,
      updateSectionItem,
      addSectionItem,
      removeSectionItem,
      fontSize,
      setFontSize,
    };

    switch (activeTab) {
      case "info":
        return <CVFormInfo {...commonProps} />;
      case "summary":
        return <CVFormSummary {...commonProps} />;
      case "education":
        return <CVFormEducation {...commonProps} />;
      case "experience":
        return <CVFormExperience {...commonProps} />;
      case "skills":
        return <CVFormSkills {...commonProps} />;
      case "style":
        return <CVFormStyle {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="cv-builder">
      {/* 2. TABS */}
      <CVTopTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={TAB_CONFIG}
      />

      {/* 3. MAIN WORKSPACE */}
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

      {/* 4. CUSTOM TOAST COMPONENT (HTML Thuần) */}
      {toast.show && (
        <div className={`cv-toast cv-toast--${toast.type}`}>
          <div className="cv-toast__icon">
            {toast.type === "success" && "✅"}
            {toast.type === "error" && "⚠️"}
            {toast.type === "info" && "ℹ️"}
          </div>
          <div className="cv-toast__message">{toast.message}</div>
        </div>
      )}
    </div>
  );
}
