// Template HTML cho in CV
export const generateCVPrintHTML = (a4Content, cvData, fontSize) => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>In CV</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          width: 100%;
          height: 100%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: ${cvData.font};
        }
        
        body {
          padding: 1rem;
        }
        
        .cv-a4 {
          width: 210mm;
          height: 297mm;
          background: white;
          padding: 16mm 10mm 16mm 10mm;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          font-size: ${fontSize}pt;
          color: ${cvData.colors.text};
          line-height: 1.45;
          font-family: ${cvData.font};
          position: relative;
          overflow: visible;
          display: flex;
          flex-direction: column;
        }
        
        .cv-header {
          display: flex;
          gap: 0.9rem;
          margin-bottom: 1rem;
          padding-bottom: 0.9rem;
          border-bottom: 2px solid #d1d5db;
          width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .cv-photo {
          flex-shrink: 0;
          width: 75px;
          height: 95px;
          overflow: hidden;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
        }
        
        .cv-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        
        .photo-placeholder {
          color: #9ca3af;
          font-size: 0.75rem;
          text-align: center;
        }
        
        .cv-info {
          flex: 1;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .cv-name {
          font-size: 1.7em;
          font-weight: 700;
          margin: 0 0 0.1rem 0;
          color: ${cvData.colors.primary};
          word-wrap: break-word;
        }
        
        .cv-title {
          font-size: 1em;
          font-weight: 600;
          color: #374151;
          margin: 0 0 0.4rem 0;
          word-wrap: break-word;
        }
        
        .cv-meta {
          font-size: 0.8em;
          color: #6b7280;
          line-height: 1.3;
          word-wrap: break-word;
        }
        
        .cv-meta p {
          margin: 0;
          word-wrap: break-word;
        }
        
        .cv-section {
          margin-top: 0.8rem;
          width: 100%;
          word-wrap: break-word;
        }
        
        .cv-section h2 {
          font-size: 1em;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          padding-bottom: 0.25rem;
          border-bottom: 1px solid #d1d5db;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${cvData.colors.primary};
          word-wrap: break-word;
        }
        
        .cv-section p {
          margin: 0;
          font-size: 0.85em;
          color: #374151;
          line-height: 1.4;
          word-wrap: break-word;
        }
        
        .cv-item {
          margin-bottom: 0.6rem;
          width: 100%;
          word-wrap: break-word;
        }
        
        .cv-item:last-child {
          margin-bottom: 0;
        }
        
        .cv-item h3 {
          font-size: 0.9em;
          font-weight: 700;
          margin: 0;
          color: #111827;
          word-wrap: break-word;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 0.8rem;
          margin-bottom: 0.15rem;
          word-wrap: break-word;
        }
        
        .item-header h3 {
          flex: 1;
          word-wrap: break-word;
        }
        
        .item-date {
          font-size: 0.8em;
          color: #6b7280;
          white-space: nowrap;
          font-weight: normal;
          flex-shrink: 0;
        }
        
        .item-title {
          font-size: 0.85em;
          font-weight: 600;
          color: #6b7280;
          margin: 0.15rem 0 0.2rem 0;
          word-wrap: break-word;
        }
        
        .item-detail {
          font-size: 0.8em;
          color: #4b5563;
          margin: 0.1rem 0 0;
          line-height: 1.35;
          word-wrap: break-word;
        }
        
        @media print {
          html, body {
            background: white;
            padding: 0;
            margin: 0;
          }
          
          .cv-a4 {
            box-shadow: none;
            margin: 0;
            padding: 10mm 10mm 10mm 10mm;
            width: 210mm;
            height: 297mm;
            overflow: visible;
          }
        }
      </style>
    </head>
    <body>
      <div class="cv-a4">
        ${a4Content}
      </div>
    </body>
    </html>
  `;
};
