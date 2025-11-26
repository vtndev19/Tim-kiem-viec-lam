import React, { useRef } from "react";
import "../styles/components/CVPreview.scss";

function CVPreview({ formData }) {
  const previewRef = useRef();

  const handleDownloadPDF = () => {
    // Sử dụng html2pdf library
    const element = previewRef.current;
    const opt = {
      margin: 10,
      filename: `CV_${formData.personalInfo.fullName || "CV"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Nếu chưa cài html2pdf, bạn cần thêm:
    // npm install html2pdf.js
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      alert("Vui lòng cài đặt html2pdf library");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(previewRef.current.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="cv-preview">
      <div className="preview-toolbar">
        <h3>Xem trước CV</h3>
        <div className="toolbar-actions">
          <button className="btn-action" onClick={handlePrint} title="In CV">
            🖨️ In
          </button>
          <button
            className="btn-action"
            onClick={handleDownloadPDF}
            title="Tải PDF"
          >
            📥 Tải PDF
          </button>
        </div>
      </div>

      <div className="preview-content" ref={previewRef}>
        <div className="cv-document">
          {/* HEADER */}
          <div className="cv-header">
            <div className="header-top">
              {formData.personalInfo.photo && (
                <div className="photo-section">
                  <img
                    src={formData.personalInfo.photo || "/placeholder.svg"}
                    alt="CV Photo"
                  />
                </div>
              )}
              <div className="personal-details">
                <h1>{formData.personalInfo.fullName || "Họ và tên"}</h1>
                <div className="contact-brief">
                  {formData.personalInfo.email && (
                    <span>📧 {formData.personalInfo.email}</span>
                  )}
                  {formData.personalInfo.phone && (
                    <span>📱 {formData.personalInfo.phone}</span>
                  )}
                  {formData.personalInfo.address && (
                    <span>📍 {formData.personalInfo.address}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS */}
          {(formData.contactInfo.website ||
            formData.contactInfo.linkedin ||
            formData.contactInfo.github ||
            formData.contactInfo.facebook) && (
            <div className="social-links">
              {formData.contactInfo.website && (
                <a
                  href={formData.contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🌐 {formData.contactInfo.website}
                </a>
              )}
              {formData.contactInfo.linkedin && (
                <a
                  href={`https://${formData.contactInfo.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💼 LinkedIn
                </a>
              )}
              {formData.contactInfo.github && (
                <a
                  href={`https://${formData.contactInfo.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🐙 GitHub
                </a>
              )}
              {formData.contactInfo.facebook && (
                <a
                  href={`https://${formData.contactInfo.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  f Facebook
                </a>
              )}
            </div>
          )}

          {/* SUMMARY */}
          {formData.summary && (
            <section className="cv-section">
              <h2 className="section-title">Mục tiêu nghề nghiệp</h2>
              <p className="summary-text">{formData.summary}</p>
            </section>
          )}

          {/* EXPERIENCE */}
          {formData.experience.some((exp) => exp.position || exp.company) && (
            <section className="cv-section">
              <h2 className="section-title">Kinh nghiệm làm việc</h2>
              {formData.experience.map(
                (exp, index) =>
                  (exp.position || exp.company) && (
                    <div key={exp.id} className="cv-entry">
                      <div className="entry-header">
                        <div>
                          <h3>{exp.position || "Vị trí"}</h3>
                          <p className="company">{exp.company || "Công ty"}</p>
                        </div>
                        <div className="date-range">
                          {exp.startDate && (
                            <span>
                              {new Date(exp.startDate).toLocaleDateString(
                                "vi-VN",
                                { month: "short", year: "numeric" }
                              )}
                            </span>
                          )}
                          {exp.endDate && (
                            <span>
                              {" "}
                              -{" "}
                              {new Date(exp.endDate).toLocaleDateString(
                                "vi-VN",
                                { month: "short", year: "numeric" }
                              )}
                            </span>
                          )}
                          {!exp.endDate && exp.startDate && (
                            <span> - Hiện tại</span>
                          )}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="description">{exp.description}</p>
                      )}
                    </div>
                  )
              )}
            </section>
          )}

          {/* EDUCATION */}
          {formData.education.some((edu) => edu.school || edu.degree) && (
            <section className="cv-section">
              <h2 className="section-title">Học vấn</h2>
              {formData.education.map(
                (edu, index) =>
                  (edu.school || edu.degree) && (
                    <div key={edu.id} className="cv-entry">
                      <div className="entry-header">
                        <div>
                          <h3>{edu.degree || "Bằng cấp"}</h3>
                          <p className="company">{edu.school || "Trường"}</p>
                          {edu.field && (
                            <p className="field">Chuyên ngành: {edu.field}</p>
                          )}
                        </div>
                        {edu.graduationYear && (
                          <div className="date-range">{edu.graduationYear}</div>
                        )}
                      </div>
                      {edu.description && (
                        <p className="description">{edu.description}</p>
                      )}
                    </div>
                  )
              )}
            </section>
          )}

          {/* SKILLS */}
          {formData.skills.some((skill) => skill.skill) && (
            <section className="cv-section">
              <h2 className="section-title">Kỹ năng</h2>
              <div className="skills">
                {formData.skills.map(
                  (skill) =>
                    skill.skill && (
                      <span key={skill.id} className="skill-badge">
                        {skill.skill}
                      </span>
                    )
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default CVPreview;
