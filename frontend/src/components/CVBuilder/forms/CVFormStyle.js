import React from "react";

export default function CVFormStyle({
  cvData,
  setCvData,
  fontSize,
  setFontSize,
}) {
  const colorPresets = [
    "#0066cc",
    "#dc2626",
    "#16a34a",
    "#7c3aed",
    "#db2777",
    "#ea580c",
    "#0891b2",
    "#1e40af",
  ];

  return (
    <div className="tab-content">
      <div className="form-group">
        <label>Font chữ</label>
        <select
          value={cvData.font}
          onChange={(e) =>
            setCvData((prev) => ({ ...prev, font: e.target.value }))
          }
        >
          <option value="Arial">Arial</option>
          <option value="'Times New Roman'">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="'Courier New'">Courier New</option>
        </select>
      </div>

      <div className="form-group">
        <label>Kích thước font: {fontSize}pt</label>
        <input
          type="range"
          min="8"
          max="14"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Màu chính</label>
        <div className="color-grid">
          {colorPresets.map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color }}
              className={`color-btn ${
                color === cvData.colors.primary ? "active" : ""
              }`}
              onClick={() =>
                setCvData((prev) => ({
                  ...prev,
                  colors: { ...prev.colors, primary: color },
                }))
              }
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}
