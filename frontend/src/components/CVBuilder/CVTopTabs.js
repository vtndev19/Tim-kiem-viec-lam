import React from "react";
import "./styles/CVTopTabs.scss";

export default function CVTopTabs({ activeTab, setActiveTab, tabs }) {
  return (
    <div className="cv-top-tabs">
      <div className="tabs-container">
        <h2 className="builder-title">CV Builder</h2>
        <div className="tabs-horizontal">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-horizontal-btn ${
                activeTab === tab.id ? "active" : ""
              }`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
