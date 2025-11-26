import React, { useState } from "react";
import CVList from "../Page/CVList.js";
import CVBuilder from "../Page/CVBuilder.js";
import "../views/App.scss";

export default function CvManager() {
  const [currentPage, setCurrentPage] = useState("list");
  const [editingCV, setEditingCV] = useState(null);
  const [cvList, setCVList] = useState([
    {
      id: 1,
      name: "CV 2025",
      createdAt: "2025-01-01",
      data: {},
    },
  ]);

  const handleNewCV = () => {
    setEditingCV(null);
    setCurrentPage("builder");
  };

  const handleEditCV = (cv) => {
    setEditingCV(cv);
    setCurrentPage("builder");
  };

  const handleSaveCV = (cvData) => {
    if (editingCV) {
      setCVList((prev) =>
        prev.map((cv) =>
          cv.id === editingCV.id ? { ...cv, data: cvData } : cv
        )
      );
    } else {
      const newCV = {
        id: Date.now(),
        name: cvData.personalInfo?.fullName || "CV mới",
        createdAt: new Date().toLocaleDateString("vi-VN"),
        data: cvData,
      };
      setCVList((prev) => [...prev, newCV]);
    }
    setCurrentPage("list");
  };

  const handleDeleteCV = (id) => {
    setCVList((prev) => prev.filter((cv) => cv.id !== id));
  };

  return (
    <div className="cv-manager">
      {currentPage === "list" ? (
        <CVList
          cvList={cvList}
          onNewCV={handleNewCV}
          onEditCV={handleEditCV}
          onDeleteCV={handleDeleteCV}
        />
      ) : (
        <CVBuilder
          initialData={editingCV?.data}
          onSave={handleSaveCV}
          onBack={() => setCurrentPage("list")}
        />
      )}
    </div>
  );
}
