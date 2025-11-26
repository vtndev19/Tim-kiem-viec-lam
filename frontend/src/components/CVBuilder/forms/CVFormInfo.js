import React from "react";

export default function CVFormInfo({ cvData, updateField }) {
  return (
    <div className="tab-content">
      <div className="form-group">
        <label>Họ và tên</label>
        <input
          value={cvData.personalInfo.fullName}
          onChange={(e) =>
            updateField("personalInfo", "fullName", e.target.value)
          }
        />
      </div>

      <div className="form-group">
        <label>Chức danh</label>
        <input
          value={cvData.personalInfo.title}
          onChange={(e) => updateField("personalInfo", "title", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          value={cvData.personalInfo.email}
          onChange={(e) => updateField("personalInfo", "email", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Điện thoại</label>
        <input
          value={cvData.personalInfo.phone}
          onChange={(e) => updateField("personalInfo", "phone", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Địa chỉ</label>
        <input
          value={cvData.personalInfo.address}
          onChange={(e) =>
            updateField("personalInfo", "address", e.target.value)
          }
        />
      </div>

      <div className="form-group">
        <label>Ảnh đại diện</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onloadend = () =>
              updateField("personalInfo", "photo", reader.result);
            reader.readAsDataURL(file);
          }}
        />
      </div>
    </div>
  );
}
