import React from "react";
import "./styles/CVInputSidebar.scss";

export default function CVInputSidebar({
  children,
  onPrint,
  onSave,
  onDownloadJSON,
}) {
  return (
    <div className="cv-input-sidebar">
      <div className="tabs-content">{children}</div>

      <div className="sidebar-actions">
        <button className="btn btn-print" onClick={onPrint}>
          🖨 In CV
        </button>
        <button className="btn btn-save" onClick={onSave}>
          💾 Lưu
        </button>
        {onDownloadJSON && (
          <button className="btn btn-download" onClick={onDownloadJSON}>
            📥 Tải JSON
          </button>
        )}
      </div>
    </div>
  );
}
