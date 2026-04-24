"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../providers';
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false, loading: () => <p className="text-blue-600 dark:text-cyan-500 animate-pulse font-bold tracking-widest text-sm uppercase p-8">Initializing Source Context...</p> });
import ExtractionPanel from '@/components/ExtractionPanel';
import ActionCard from '@/components/ActionCard';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle, XCircle, ShieldAlert, FileText, Scale, GitBranch } from 'lucide-react';

export default function ReviewPage() {
  const router = useRouter();
  const { activeFile, extractedData, actionPlan, setExtractedData, setActionPlan } = useAppContext();
  
  const [revealPhase, setRevealPhase] = useState(0);

  useEffect(() => {
    if (!activeFile || !extractedData || !actionPlan) {
      router.replace('/upload');
      return;
    }

    // Staged Reveal Logic
    const t1 = setTimeout(() => setRevealPhase(1), 500);
    const t2 = setTimeout(() => setRevealPhase(2), 1100);
    const t3 = setTimeout(() => setRevealPhase(3), 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeFile, extractedData, actionPlan, router]);

  if (!activeFile || !extractedData || !actionPlan) return null;

  const handleApprove = () => {
    const newRecord = {
      id: uuidv4(),
      case_details: extractedData.case_details,
      parties: extractedData.parties,
      date_of_order: extractedData.date_of_order,
      actions: actionPlan.actions,
      approved_at: new Date().toISOString()
    };

    const existingStr = localStorage.getItem('approved_cases');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    
    existing.push(newRecord);
    localStorage.setItem('approved_cases', JSON.stringify(existing));

    router.push('/');
  };

  const handleReject = () => {
    router.push('/upload');
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-[calc(100vh-80px)] bg-white dark:bg-[#050505] transition-colors">
      
      {/* Verification Header */}
      <div className="bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/10 px-8 py-5 flex justify-between items-center shrink-0 shadow-sm dark:shadow-xl z-20 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 shadow-sm">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">System Verification Hold</h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">Please cross-reference the extracted operational data with the source document before approving into the registry.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
             onClick={handleReject}
             className="px-6 py-2.5 flex items-center gap-2.5 bg-white dark:bg-transparent text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/30 font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shadow-sm text-sm tracking-wide"
          >
            <XCircle size={18} /> Discard
          </button>
          <button 
             onClick={handleApprove}
             className="px-6 py-2.5 flex items-center gap-2.5 bg-blue-600 dark:bg-emerald-600 border border-blue-600 dark:border-emerald-500/50 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-emerald-500 shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all transform hover:-translate-y-0.5 text-sm tracking-wide"
          >
            <CheckCircle size={18} /> Approve Directives
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-1/2 border-r border-slate-200 dark:border-white/5 p-8 bg-slate-50/50 dark:bg-black relative max-h-full transition-colors">
           <PDFViewer file={activeFile} />
        </div>

        <div className="w-1/2 flex-shrink-0 bg-white dark:bg-[#0a0a0a] overflow-y-auto p-10 space-y-8 custom-scrollbar relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-colors">
          
          <div className="space-y-6">
             {/* PHASE 1: Document Extraction */}
             <div className={`transition-all duration-700 ease-out transform ${revealPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
               <div className="mb-4">
                 <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                   <FileText size={14} className="text-blue-500 dark:text-cyan-500" /> Section 1: Document Extraction
                 </h2>
               </div>
               <ExtractionPanel data={extractedData} onChange={setExtractedData} />
             </div>

             {/* PHASE 2: Legal Analysis */}
             <div className={`transition-all duration-700 ease-out transform ${revealPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="mb-4 mt-8">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <Scale size={14} className="text-indigo-500 dark:text-blue-400" /> Section 2: Legal Analysis
                  </h2>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-md dark:shadow-xl relative overflow-hidden backdrop-blur-xl transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 dark:via-blue-500 to-transparent opacity-50" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    The intelligence engine has identified core obligations and timelines embedded within the legal context. These have been transformed into standard operational directives below.
                  </p>
                </div>
             </div>

             {/* PHASE 3: Recommended Actions */}
             <div className={`transition-all duration-700 ease-out transform ${revealPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="mb-4 mt-8">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <GitBranch size={14} className="text-blue-600 dark:text-cyan-400" /> Section 3: Recommended Actions
                  </h2>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-md dark:shadow-xl relative overflow-hidden backdrop-blur-xl transition-colors">
                  
                  <div className="space-y-5 mt-2">
                    {actionPlan?.actions?.map((item: any, idx: number) => (
                      <ActionCard 
                        key={idx} 
                        action={item} 
                        isEditable={true} 
                        onChange={(updated) => {
                          const nextActions = [...actionPlan.actions];
                          nextActions[idx] = updated;
                          setActionPlan({ ...actionPlan, actions: nextActions });
                        }}
                      />
                    ))}
                    {(!actionPlan?.actions || actionPlan.actions.length === 0) && (
                      <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 p-6 rounded-2xl text-center transition-colors">
                        <p className="text-sm font-medium text-slate-500">No actionable compliance directions were identified in this document.</p>
                      </div>
                    )}
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
