import React from "react";
import "../styles/CVHeader.scss";

export default function CVHeader({ cvData }) {
  return (
    <div className="cv-header">
      <div className="cv-photo">
        {cvData.personalInfo.photo ? (
          <img src={cvData.personalInfo.photo} alt="avatar" />
        ) : (
          <div className="photo-placeholder">Ảnh</div>
        )}
      </div>

      <div className="cv-info">
        <h1 className="cv-name" style={{ color: cvData.colors.primary }}>
          {cvData.personalInfo.fullName}
        </h1>
        <p className="cv-title">{cvData.personalInfo.title}</p>
        <div className="cv-meta">
          <p>📧 {cvData.personalInfo.email}</p>
          <p>📱 {cvData.personalInfo.phone}</p>
          <p>📍 {cvData.personalInfo.address}</p>
        </div>
      </div>
    </div>
  );
}
