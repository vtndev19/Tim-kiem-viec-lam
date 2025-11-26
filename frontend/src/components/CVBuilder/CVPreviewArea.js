import React, { forwardRef } from "react";
import CVDocument from "./CVDocument";
import "./styles/CVPreviewArea.scss";

const CVPreviewArea = forwardRef((props, ref) => {
  const { cvData, fontSize } = props;

  return (
    <div className="cv-preview-area">
      <CVDocument ref={ref} cvData={cvData} fontSize={fontSize} />
    </div>
  );
});

CVPreviewArea.displayName = "CVPreviewArea";

export default CVPreviewArea;
