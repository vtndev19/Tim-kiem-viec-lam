import React from "react";

export default function CVFormSkills({
  cvData,
  updateSectionItem,
  addSectionItem,
  removeSectionItem,
}) {
  return (
    <div className="tab-content">
      {cvData.skills.map((skill, idx) => (
        <div key={skill.id} className="section-item">
          <div className="section-header">
            <h4>Kỹ năng #{idx + 1}</h4>
            {cvData.skills.length > 1 && (
              <button
                className="btn-remove"
                onClick={() => removeSectionItem("skills", skill.id)}
              >
                ✕
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Lĩnh vực</label>
            <input
              value={skill.category}
              onChange={(e) =>
                updateSectionItem(
                  "skills",
                  skill.id,
                  "category",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Kỹ năng</label>
            <textarea
              rows="2"
              value={skill.items}
              onChange={(e) =>
                updateSectionItem("skills", skill.id, "items", e.target.value)
              }
            ></textarea>
          </div>
        </div>
      ))}
      <button
        className="btn-add"
        onClick={() =>
          addSectionItem("skills", {
            category: "",
            items: "",
          })
        }
      >
        + Thêm kỹ năng
      </button>
    </div>
  );
}
