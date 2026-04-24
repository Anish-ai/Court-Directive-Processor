"use client";

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, FileSearch } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ file }: { file: File }) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div className="flex flex-col items-center bg-[#0a0a0a] rounded-3xl overflow-hidden w-full h-full max-h-[85vh] border border-white/10 shadow-2xl relative backdrop-blur-xl">
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-cyan-600/20 blur-[80px] pointer-events-none rounded-full" />
      
      <div className="w-full px-5 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 z-10 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <FileSearch size={18} className="text-cyan-400" />
          <p className="text-sm font-bold tracking-wide text-white">Source PDF</p>
        </div>
        
        <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/5">
          <button 
            disabled={pageNumber <= 1} 
            onClick={() => setPageNumber(p => p - 1)}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[11px] font-bold tracking-widest text-slate-400 px-3 uppercase">
            {pageNumber} / {numPages || '-'}
          </span>
          <button 
            disabled={pageNumber >= (numPages || 1)} 
            onClick={() => setPageNumber(p => p + 1)}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full overflow-y-auto px-4 py-8 bg-zinc-950/50 flex justify-center custom-scrollbar">
        <Document 
          file={file} 
          onLoadSuccess={onDocumentLoadSuccess} 
          className="shadow-2xl ring-1 ring-white/10 rounded-sm overflow-hidden"
          loading={<div className="p-8 text-cyan-500 animate-pulse font-bold tracking-widest text-sm uppercase">Loading Document...</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            width={650} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="bg-white" 
          />
        </Document>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2); 
        }
      `}</style>
    </div>
  );
}
