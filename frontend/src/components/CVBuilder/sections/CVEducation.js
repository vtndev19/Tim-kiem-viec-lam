import React from "react";
import "../styles/CVEducation.scss";

export default function CVEducation({ cvData }) {
  if (cvData.education.length === 0) return null;

  return (
    <div className="cv-section">
      <h2 style={{ color: cvData.colors.primary }}>HỌC VẤN</h2>
      {cvData.education.map((edu) => (
        <div key={edu.id} className="cv-item">
          <div className="item-header">
            <h3>{edu.school}</h3>
            <span className="item-date">{edu.year}</span>
          </div>
          <p className="item-title">{edu.degree}</p>
          {edu.details && <p className="item-detail">{edu.details}</p>}
        </div>
      ))}
    </div>
  );
}
