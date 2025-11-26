import React, { useState, useRef } from "react";
import "../styles/page/CVBuilder.scss";
import { generateCVPrintHTML } from "../components/CVPrintTemplate";
import {
  normalizeCVData,
  submitCVToBackend,
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

export default function CVBuilder() {
  const [activeTab, setActiveTab] = useState("info");
  const printRef = useRef();

  // ==========================
  // MAIN STATE
  // ==========================
  const [cvData, setCvData] = useState({
    personalInfo: {
      fullName: "Nguyễn Trọng Việt",
      title: "Frontend Developer",
      email: "viet@example.com",
      phone: "0123456789",
      address: "Hà Nội, Việt Nam",
      photo: null,
    },
    summary:
      "Lập trình viên Frontend có 3 năm kinh nghiệm xây dựng các ứng dụng web hiện đại với React, Vue.js...",
    education: [
      {
        id: 1,
        school: "Đại học Bách Khoa Hà Nội",
        degree: "Cử nhân Công nghệ Thông tin",
        year: "2018 - 2022",
        details: "GPA: 3.5/4.0",
      },
    ],
    experience: [
      {
        id: 1,
        company: "Tech Company",
        position: "Frontend Developer",
        period: "2022 - Hiện tại",
        details:
          "Phát triển các tính năng frontend cho ứng dụng web. Làm việc với React, Redux, Tailwind CSS.",
      },
    ],
    skills: [
      {
        id: 1,
        category: "Frontend",
        items: "React, Vue.js, TypeScript, Tailwind CSS",
      },
      { id: 2, category: "Tools", items: "Git, VS Code, Figma, Docker" },
    ],
    colors: {
      primary: "#0066cc",
      secondary: "#374151",
      text: "#111827",
      bg: "#ffffff",
      accent: "#e5e7eb",
    },
    font: "Arial",
  });

  const [fontSize, setFontSize] = useState(11);

  // ==========================
  // UNIVERSAL HANDLERS
  // ==========================

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

  // ==========================
  // PAYLOAD & SAVE
  // ==========================
  const handleSave = async () => {
    // Validate dữ liệu
    const validation = validateCVData(cvData);
    if (!validation.isValid) {
      alert("Lỗi validation:\n" + validation.errors.join("\n"));
      return;
    }

    // Gửi lên backend (submitCVToBackend sẽ normalize dữ liệu)
    const result = await submitCVToBackend(cvData, fontSize);

    if (result.success) {
      alert(result.message);
      // Có thể redirect hoặc update UI ở đây
    } else {
      alert(result.message + "\n" + result.error);
    }
  };

  const handleDownloadJSON = () => {
    downloadCVAsJSON(cvData, fontSize);
  };

  // ==========================
  // PRINT
  // ==========================
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

  // ==========================
  // DOWNLOAD PDF
  // ==========================
  const handleDownload = () => {
    const element = printRef.current;
    const html2pdf = window.html2pdf;

    if (html2pdf) {
      html2pdf()
        .set({
          margin: 0,
          filename: "CV.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
    }
  };

  // ==========================
  // RENDER TABS
  // ==========================
  const tabs = [
    { id: "info", label: "Thông tin cá nhân", icon: "👤" },
    { id: "summary", label: "Giới thiệu", icon: "📝" },
    { id: "education", label: "Học vấn", icon: "🎓" },
    { id: "experience", label: "Kinh nghiệm", icon: "💼" },
    { id: "skills", label: "Kỹ năng", icon: "⚡" },
    { id: "style", label: "Thiết kế", icon: "🎨" },
  ];

  // ---------------------------
  // TAB CONTENTS
  // ---------------------------
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

  // ================================================================
  // RETURN UI
  // ================================================================
  return (
    <div className="cv-builder">
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
