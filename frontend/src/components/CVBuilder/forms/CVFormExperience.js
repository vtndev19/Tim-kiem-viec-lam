import React from "react";

export default function CVFormExperience({
  cvData,
  updateSectionItem,
  addSectionItem,
  removeSectionItem,
}) {
  return (
    <div className="tab-content">
      {cvData.experience.map((exp, idx) => (
        <div key={exp.id} className="section-item">
          <div className="section-header">
            <h4>Kinh nghiệm #{idx + 1}</h4>
            {cvData.experience.length > 1 && (
              <button
                className="btn-remove"
                onClick={() => removeSectionItem("experience", exp.id)}
              >
                ✕
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Công ty</label>
            <input
              value={exp.company}
              onChange={(e) =>
                updateSectionItem(
                  "experience",
                  exp.id,
                  "company",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Chức vị</label>
            <input
              value={exp.position}
              onChange={(e) =>
                updateSectionItem(
                  "experience",
                  exp.id,
                  "position",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Thời gian</label>
            <input
              value={exp.period}
              onChange={(e) =>
                updateSectionItem(
                  "experience",
                  exp.id,
                  "period",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              rows="2"
              value={exp.details}
              onChange={(e) =>
                updateSectionItem(
                  "experience",
                  exp.id,
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
          addSectionItem("experience", {
            company: "",
            position: "",
            period: "",
            details: "",
          })
        }
      >
        + Thêm kinh nghiệm
      </button>
    </div>
  );
}
