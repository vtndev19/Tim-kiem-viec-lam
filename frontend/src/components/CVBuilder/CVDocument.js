import React, { forwardRef } from "react";
import CVHeader from "./sections/CVHeader";
import CVSummary from "./sections/CVSummary";
import CVEducation from "./sections/CVEducation";
import CVExperience from "./sections/CVExperience";
import CVSkills from "./sections/CVSkills";
import "./styles/CVDocument.scss";

const CVDocument = forwardRef(({ cvData, fontSize }, ref) => {
  return (
    <div
      className="cv-document"
      ref={ref}
      style={{
        fontFamily: cvData.font,
        fontSize: `${fontSize}pt`,
        color: cvData.colors.text,
      }}
    >
      <div className="cv-a4">
        <CVHeader cvData={cvData} />
        <CVSummary cvData={cvData} />
        <CVEducation cvData={cvData} />
        <CVExperience cvData={cvData} />
        <CVSkills cvData={cvData} />
      </div>
    </div>
  );
});

CVDocument.displayName = "CVDocument";

export default CVDocument;
