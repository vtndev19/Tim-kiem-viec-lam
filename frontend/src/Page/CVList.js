import React from "react";
import "../styles/page/CVList.scss";

function CVList({ cvList, onNewCV, onEditCV, onDeleteCV }) {
  return (
    <div className="cv-list-container">
      <div className="cv-list-header">
        <h1>Quản lý CV của tôi</h1>
        <button className="btn-create-cv" onClick={onNewCV}>
          + Tạo CV mới
        </button>
      </div>

      {cvList.length === 0 ? (
        <div className="empty-state">
          <h2>Bạn chưa tạo CV nào</h2>
          <p>Bắt đầu tạo CV đầu tiên của bạn ngay hôm nay</p>
          <button className="btn-create-cv btn-large" onClick={onNewCV}>
            Tạo CV mới
          </button>
        </div>
      ) : (
        <div className="cv-list">
          {cvList.map((cv) => (
            <div key={cv.id} className="cv-card">
              <div className="cv-card-content">
                <h3>{cv.name}</h3>
                <p className="cv-date">Tạo ngày: {cv.createdAt}</p>
              </div>
              <div className="cv-card-actions">
                <button className="btn-edit" onClick={() => onEditCV(cv)}>
                  Chỉnh sửa
                </button>
                <button
                  className="btn-delete"
                  onClick={() => onDeleteCV(cv.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CVList;
