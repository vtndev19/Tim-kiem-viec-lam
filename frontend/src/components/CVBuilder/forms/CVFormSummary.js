import React from "react";

export default function CVFormSummary({ cvData, setCvData }) {
  return (
    <div className="tab-content">
      <div className="form-group">
        <label>Giới thiệu bản thân</label>
        <textarea
          rows="5"
          value={cvData.summary}
          onChange={(e) =>
            setCvData((prev) => ({ ...prev, summary: e.target.value }))
          }
        ></textarea>
      </div>
    </div>
  );
}
