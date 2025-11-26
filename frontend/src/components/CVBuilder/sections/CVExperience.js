import React from "react";
import "../styles/CVExperience.scss";

export default function CVExperience({ cvData }) {
  if (cvData.experience.length === 0) return null;

  return (
    <div className="cv-section">
      <h2 style={{ color: cvData.colors.primary }}>KINH NGHIỆM</h2>
      {cvData.experience.map((exp) => (
        <div key={exp.id} className="cv-item">
          <div className="item-header">
            <h3>{exp.company}</h3>
            <span className="item-date">{exp.period}</span>
          </div>
          <p className="item-title">{exp.position}</p>
          {exp.details && <p className="item-detail">{exp.details}</p>}
        </div>
      ))}
    </div>
  );
}
