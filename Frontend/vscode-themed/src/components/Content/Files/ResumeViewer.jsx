import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "./ResumeViewer.css";
import resumePDF from '../../../assets/Naisarg_resume.pdf';


// Set workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


function ResumeViewer({ onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div className="resume-viewer-modal">
      <div className="resume-viewer-header">
        <span>Resume Preview</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a
            href={resumePDF}
            download="Naisarg_resume.pdf"
            className="download-btn"
            title="Download Resume"
          >
            Download
          </a>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
      </div>
      <div className="resume-viewer-content">
        <Document
          file={resumePDF}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="pdf-loading">Loading PDF...</div>}
          error={<div className="pdf-error">Failed to load PDF.</div>}
        >
          <Page pageNumber={1} width={Math.min(600, window.innerWidth * 0.9)} />
        </Document>
        <div className="pdf-controls">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages || "?"}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeViewer; 