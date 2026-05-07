"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../providers';
import { UploadCloud, FileText, ScanLine } from 'lucide-react';
import ProcessingPipeline from '@/components/ProcessingPipeline';

export default function UploadPage() {
  const router = useRouter();
  const { setActiveFile, setPipelineResult } = useAppContext();
  const [file, setLocalFile] = useState<File | null>(null);
  
  const [pipelineStatus, setPipelineStatus] = useState<"idle" | "processing" | "retrying" | "error" | "success">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLocalFile(e.target.files[0]);
      setPipelineStatus("idle");
    }
  };

  const runAnalysis = async (retryCount = 0): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file as File);
      
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.details || "Pipeline processing failed");
      }
      
      return await res.json();
    } catch (err: any) {
      if (retryCount === 0) {
        setPipelineStatus("retrying");
        return runAnalysis(1); // Auto retry once
      }
      throw err;
    }
  };

  const initSystemProcessing = async () => {
    if (!file) return;
    setPipelineStatus("processing");

    try {
      const result = await runAnalysis();
      
      // Save full pipeline payload to global context
      setActiveFile(file);
      setPipelineResult(result);
      
      // Trigger the success signal
      setPipelineStatus("success");
      
    } catch (err: any) {
      console.error(err);
      setPipelineStatus("error");
    }
  };

  const handleVisualPipelineComplete = () => {
    router.push('/review');
  };

  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex px-4 py-16 justify-center items-center flex-1 relative min-h-[calc(100vh-80px)] overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col gap-8 pb-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-indigo-900/20 overflow-hidden relative backdrop-blur-xl z-10 transition-colors">
          
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-500 dark:via-cyan-500 to-transparent opacity-100" />

          <div className="bg-slate-50 dark:bg-slate-950/50 px-8 py-6 border-b border-slate-200 dark:border-white/5 transition-colors">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
              <ScanLine className="text-blue-600 dark:text-cyan-400" />
              Intelligence Ingestion Portal
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">Initialize the multi-agent analysis engine by providing structured or unstructured judicial documentation.</p>
          </div>
          
          <div className="p-10 relative">
            <div 
              onDragOver={(e) => { e.preventDefault(); if (pipelineStatus === "idle") setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { 
                e.preventDefault(); 
                setIsDragging(false); 
                if (pipelineStatus === "idle" || pipelineStatus === "error") {
                  handleFileChange({ target: { files: e.dataTransfer.files } } as any); 
                }
              }}
              className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all duration-300 relative group overflow-hidden ${
                pipelineStatus !== "idle" && pipelineStatus !== "error" ? 'opacity-50 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 pointer-events-none' : 
                isDragging ? 'border-blue-500 dark:border-cyan-400 bg-blue-50 dark:bg-cyan-900/20 cursor-pointer' : 'border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 hover:border-slate-400 dark:hover:border-white/30 hover:bg-slate-100 dark:hover:bg-black/40 cursor-pointer'
              }`}
            >
              {file ? (
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="p-5 bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-cyan-900 dark:to-blue-900 text-blue-600 dark:text-cyan-300 rounded-2xl shadow-sm dark:shadow-lg dark:ring-1 dark:ring-cyan-500/50">
                      <FileText size={56} strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800 dark:text-white tracking-wide text-lg">{file.name}</p>
                      <p className="text-[11px] mt-1.5 font-bold tracking-widest text-slate-500 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB • READY FOR ANALYSIS</p>
                    </div>
                  </div>
              ) : (
                  <>
                    <div className={`p-5 rounded-3xl mb-4 transition-all duration-300 ${isDragging ? 'bg-blue-100/50 dark:bg-cyan-900/50 text-blue-600 dark:text-cyan-400' : 'bg-slate-200 dark:bg-white/5 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-cyan-400 group-hover:bg-blue-100 dark:group-hover:bg-cyan-900/30'}`}>
                      <UploadCloud size={56} strokeWidth={1.5} />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 tracking-wide text-lg">Select or drag PDF</p>
                    <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mt-2">Maximum payload 50MB</p>
                  </>
              )}
              {(pipelineStatus === "idle" || pipelineStatus === "error") && (
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              )}
            </div>

            {pipelineStatus === "idle" && (
              <div className="mt-10 flex justify-end">
                <button
                  disabled={!file}
                  onClick={initSystemProcessing}
                  className={`px-8 py-4 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center gap-3 text-sm tracking-wide ${
                    !file 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-white/5' 
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-blue-600/30 dark:shadow-cyan-600/30 hover:shadow-blue-600/50 dark:hover:shadow-cyan-500/50 hover:-translate-y-1'
                  }`}
                >
                  <span>Initialize AI Engine</span> 
                  <ChevronRightIcon />
                </button>
              </div>
            )}
          </div>
        </div>

        <ProcessingPipeline 
           status={pipelineStatus} 
           onVisualCompletion={handleVisualPipelineComplete} 
        />
      </div>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  );
}
