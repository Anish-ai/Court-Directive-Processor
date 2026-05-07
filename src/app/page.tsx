"use client";

import { useEffect, useState } from 'react';
import { FolderCheck, AlertTriangle, Trash2, CalendarDays, ExternalLink, Activity, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CaseRecord {
  id: string;
  case_details: any;
  parties: any;
  petitioner_actions: any[];
  respondent_actions: any[];
  critical_deadlines: any[];
  appeal_recommendation: any;
  legal_summary: string;
  overall_confidence: number;
  approved_at: string;
  date_of_order?: string;
  case_outcome?: string;
  // Legacy support
  actions?: any[];
}

export default function Dashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<CaseRecord[]>([]);

  useEffect(() => {
    const load = () => {
      const data = localStorage.getItem('approved_cases');
      if (data) {
        setRecords(JSON.parse(data));
      }
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to completely erase the local registry database?")) {
      localStorage.removeItem('approved_cases');
      setRecords([]);
    }
  };

  const getTotalActions = (rec: CaseRecord) => {
    return (rec.petitioner_actions?.length || 0) + (rec.respondent_actions?.length || 0) + (rec.actions?.length || 0);
  };

  const getAppealBadge = (rec: CaseRecord) => {
    const r = rec.appeal_recommendation?.recommendation;
    if (!r) return null;
    if (r === 'appeal_recommended') return { text: 'Appeal', color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' };
    if (r === 'comply_recommended') return { text: 'Comply', color: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' };
    return { text: 'Review', color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' };
  };

  return (
    <div className="flex-1 p-8 lg:p-12 relative bg-slate-50 dark:bg-transparent transition-colors">
      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200 dark:border-white/10 transition-colors">
          <div className="relative">
            <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-4 transition-colors">
              <div className="p-2.5 bg-blue-100 dark:bg-cyan-500/10 rounded-xl border border-blue-200 dark:border-cyan-500/20 shadow-sm dark:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-colors">
                <FolderCheck className="text-blue-600 dark:text-cyan-400" size={28} />
              </div>
              Verified Case Registry
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium tracking-wide transition-colors">Central database of multi-agent processed and verified legal action plans.</p>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={clearAllData} className="px-5 py-3 text-rose-500 dark:text-rose-400 bg-white hover:bg-rose-50 dark:bg-transparent dark:hover:bg-rose-500/20 rounded-xl transition-colors border border-rose-200 dark:border-rose-500/30 flex items-center gap-2.5 text-sm font-bold tracking-wide shadow-sm dark:shadow-none">
              <Trash2 size={18} /> Format Database
            </button>
            <Link href="/upload" className="px-6 py-3 bg-blue-600 dark:bg-cyan-600 border border-blue-600 dark:border-cyan-500 hover:bg-blue-700 dark:hover:bg-cyan-500 text-white font-bold tracking-wide rounded-xl shadow-md dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition transform hover:-translate-y-0.5">
              + Ingest New Case
            </Link>
          </div>
        </div>

        {records.length === 0 ? (
           <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-white/20 rounded-3xl p-20 flex flex-col items-center justify-center text-slate-500 backdrop-blur-md shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none rounded-full" />
             <div className="p-5 bg-amber-100 dark:bg-amber-500/10 rounded-2xl mb-6 ring-1 ring-amber-200 dark:ring-amber-500/20 shadow-sm dark:shadow-inner transition-colors">
               <AlertTriangle size={48} className="text-amber-500 dark:text-amber-500 drop-shadow-md" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide transition-colors">Registry is Empty</h3>
             <p className="mt-2.5 text-center max-w-sm font-medium tracking-wide leading-relaxed">No verified cases in the repository. Navigate to the ingestion portal to process a court judgment.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             {records.map((rec) => {
               const badge = getAppealBadge(rec);
               return (
                <div 
                  key={rec.id} 
                  onClick={() => router.push(`/case/${rec.id}`)}
                  className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-lg dark:shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden hover:border-blue-300 dark:hover:border-cyan-500/50 dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 cursor-pointer group relative"
                >
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 dark:from-cyan-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   
                   <div className="bg-slate-50 dark:bg-black/30 px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center backdrop-blur-sm transition-colors">
                      <span className="text-[12px] text-blue-600 dark:text-cyan-400 font-black tracking-widest flex items-center gap-2 uppercase">
                         <FolderCheck size={14} /> Intelligence Dossier
                      </span>
                      <ExternalLink size={16} className="text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors" />
                   </div>

                   <div className="p-6 flex-1 flex flex-col gap-4">
                     <div>
                       <h4 className="font-bold text-xl text-slate-800 dark:text-white tracking-wide mb-1 group-hover:text-blue-700 dark:group-hover:text-cyan-300 transition-colors">
                         {rec.case_details?.case_number || "Unnamed Case"}
                       </h4>
                       <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic line-clamp-1 transition-colors">
                         {rec.case_details?.court || "Jurisdiction Unknown"}
                       </p>
                     </div>

                     {/* Badges */}
                     <div className="flex gap-2 flex-wrap">
                       {badge && (
                         <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border ${badge.color}`}>
                           {badge.text}
                         </span>
                       )}
                       {rec.case_outcome && (
                         <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                           {rec.case_outcome}
                         </span>
                       )}
                     </div>

                     <div className="bg-slate-50 dark:bg-black/40 rounded-xl p-4 border border-slate-100 dark:border-white/5 space-y-3 shadow-inner transition-colors">
                        <div className="flex items-center gap-3 text-[13px] font-medium text-slate-600 dark:text-slate-300 transition-colors">
                          <CalendarDays size={16} className="text-blue-500 dark:text-blue-400" />
                          {rec.date_of_order || "Date Unknown"}
                        </div>
                        <div className="flex items-center gap-3 text-[13px] font-medium text-slate-600 dark:text-slate-300 transition-colors">
                          <Activity size={16} className="text-blue-500 dark:text-blue-400" />
                          {getTotalActions(rec)} Actionable Directives
                        </div>
                        {rec.critical_deadlines && rec.critical_deadlines.length > 0 && (
                          <div className="flex items-center gap-3 text-[13px] font-medium text-amber-600 dark:text-amber-400 transition-colors">
                            <Clock size={16} />
                            {rec.critical_deadlines.length} Critical Deadline{rec.critical_deadlines.length > 1 ? 's' : ''}
                          </div>
                        )}
                        {rec.overall_confidence != null && (
                          <div className="flex items-center gap-3 text-[13px] font-medium text-slate-600 dark:text-slate-300 transition-colors">
                            <Shield size={16} className={rec.overall_confidence >= 80 ? 'text-emerald-500' : rec.overall_confidence >= 50 ? 'text-amber-500' : 'text-rose-500'} />
                            Confidence: {rec.overall_confidence}%
                          </div>
                        )}
                     </div>
                   </div>

                   <div className="px-6 py-4 bg-slate-100 dark:bg-slate-950/50 border-t border-slate-200 dark:border-white/5 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors">
                      <span>Processed {new Date(rec.approved_at).toLocaleDateString()}</span>
                   </div>
                </div>
               );
             })}
          </div>
        )}
      </div>
    </div>
  );
}
