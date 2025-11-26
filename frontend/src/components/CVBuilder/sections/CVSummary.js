import React from "react";
import "../styles/CVSummary.scss";

export default function CVSummary({ cvData }) {
  if (!cvData.summary) return null;

  return (
    <div className="cv-section">
      <h2 style={{ color: cvData.colors.primary }}>GIỚI THIỆU</h2>
      <p>{cvData.summary}</p>
    </div>
  );
}
