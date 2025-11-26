import React from "react";
import "../styles/CVSkills.scss";

export default function CVSkills({ cvData }) {
  if (cvData.skills.length === 0) return null;

  return (
    <div className="cv-section">
      <h2 style={{ color: cvData.colors.primary }}>KỸ NĂNG</h2>
      {cvData.skills.map((skill) => (
        <div key={skill.id} className="cv-item">
          <h3>{skill.category}</h3>
          <p className="item-detail">{skill.items}</p>
        </div>
      ))}
    </div>
  );
}
