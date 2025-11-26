import React from "react";

export default function CVFormEducation({
  cvData,
  updateSectionItem,
  addSectionItem,
  removeSectionItem,
}) {
  return (
    <div className="tab-content">
      {cvData.education.map((edu, idx) => (
        <div key={edu.id} className="section-item">
          <div className="section-header">
            <h4>Học vấn #{idx + 1}</h4>
            {cvData.education.length > 1 && (
              <button
                className="btn-remove"
                onClick={() => removeSectionItem("education", edu.id)}
              >
                ✕
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Trường học</label>
            <input
              value={edu.school}
              onChange={(e) =>
                updateSectionItem("education", edu.id, "school", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Bằng cấp</label>
            <input
              value={edu.degree}
              onChange={(e) =>
                updateSectionItem("education", edu.id, "degree", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Năm</label>
            <input
              value={edu.year}
              onChange={(e) =>
                updateSectionItem("education", edu.id, "year", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Chi tiết</label>
            <textarea
              rows="2"
              value={edu.details}
              onChange={(e) =>
                updateSectionItem(
                  "education",
                  edu.id,
                  "details",
                  e.target.value
                )
              }
            ></textarea>
          </div>
        </div>
      ))}

      <button
        className="btn-add"
        onClick={() =>
          addSectionItem("education", {
            school: "",
            degree: "",
            year: "",
            details: "",
          })
        }
      >
        + Thêm học vấn
      </button>
    </div>
  );
}
