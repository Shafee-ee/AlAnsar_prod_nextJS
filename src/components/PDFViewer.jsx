"use client";

import { useEffect, useState } from "react";

export default function PDFViewer({ pdfUrl }) {
  const [Document, setDocument] = useState(null);
  const [Page, setPage] = useState(null);
  const [pdfjs, setPdfjs] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const preventCopy = (e) => {
    e.preventDefault();
  };

  const preventContextMenu = (e) => {
    e.preventDefault();
  };

  const preventSelection = (e) => {
    e.preventDefault();
  };

  const preventKeyboardCopy = (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      ["c", "x", "a"].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    async function loadPdf() {
      const pdf = await import("react-pdf");

      pdf.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      setDocument(() => pdf.Document);
      setPage(() => pdf.Page);
      setPdfjs(pdf.pdfjs);
    }

    loadPdf();
  }, []);

  if (!Document || !Page || !pdfjs) {
    return <div>Loading PDF...</div>;
  }

  return (
    <div
      onCopy={preventCopy}
      onCut={preventCopy}
      onContextMenu={preventContextMenu}
      onSelectStart={preventSelection}
      onKeyDown={preventKeyboardCopy}
      className="select-none"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
      }}
    >
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from({ length: numPages || 0 }, (_, index) => (
          <Page
            key={index}
            pageNumber={index + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="pdf-page"
          />
        ))}
      </Document>
    </div>
  );
}
