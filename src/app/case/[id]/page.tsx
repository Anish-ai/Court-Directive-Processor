"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Gavel, FileText, CalendarDays } from 'lucide-react';
import ActionCard from '@/components/ActionCard';

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('approved_cases');
    if (data && params.id) {
      const records = JSON.parse(data);
      const found = records.find((r: any) => r.id === params.id);
      if (found) {
        setRecord(found);
      } else {
        router.push('/');
      }
    }
  }, [params.id, router]);

  if (!record) return <div className="p-10 flex justify-center text-blue-600 dark:text-cyan-500 font-bold uppercase tracking-widest animate-pulse">Establishing Context Stream...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-transparent relative custom-scrollbar transition-colors">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-blue-100 dark:bg-cyan-600/10 blur-[150px] pointer-events-none rounded-full transition-colors" />

      <div className="max-w-6xl mx-auto p-8 lg:p-12 relative z-10">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2.5 text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 mb-8 uppercase transition-colors"
        >
          <ArrowLeft size={16} /> Return to Registry
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-md dark:shadow-2xl p-8 lg:p-10 mb-10 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-indigo-600 dark:from-cyan-400 dark:to-blue-600" />
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                Verified Intelligence Dossier
              </div>
              <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-wide transition-colors">{record.case_details?.case_number || "Unnamed Case"}</h1>
            </div>
            <div className="text-right">
               <span className="block text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Date of Order</span>
               <span className="flex items-center gap-2 justify-end text-lg font-bold text-slate-800 dark:text-slate-200 transition-colors">
                 <CalendarDays size={18} className="text-blue-600 dark:text-cyan-500" /> {record.date_of_order || "N/A"}
               </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner transition-colors">
                 <Building2 className="text-indigo-500 mt-1" size={24} />
                 <div>
                   <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">Presiding Court</p>
                   <p className="text-[15px] font-medium text-slate-800 dark:text-slate-200 transition-colors">{record.case_details?.court || "Unknown"}</p>
                 </div>
               </div>
               <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner transition-colors">
                 <Gavel className="text-amber-500 mt-1" size={24} />
                 <div>
                   <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">Judge</p>
                   <p className="text-[15px] font-medium text-slate-800 dark:text-slate-200 transition-colors">{record.case_details?.judge || "Unknown"}</p>
                 </div>
               </div>
            </div>

            <div className="bg-slate-50 dark:bg-black/30 p-6 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col justify-center gap-6 shadow-inner transition-colors">
               <div>
                 <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">Petitioner</p>
                 <p className="text-md font-bold text-slate-800 dark:text-white border-l-2 border-emerald-500 pl-3 transition-colors">{record.parties?.petitioner || "Unknown"}</p>
               </div>
               <div>
                 <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">Respondent</p>
                 <p className="text-md font-bold text-slate-800 dark:text-white border-l-2 border-rose-500 pl-3 transition-colors">{record.parties?.respondent || "Unknown"}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 transition-colors">
             <FileText className="text-blue-600 dark:text-cyan-500" /> Operating Directives
             <span className="text-[11px] ml-3 bg-blue-100 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30 px-3 py-1.5 rounded-full inline-block uppercase tracking-widest">
               {record.actions?.length || 0} Registered
             </span>
          </h2>

          {record.actions && record.actions.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
               {record.actions.map((action: any, idx: number) => (
                 <ActionCard key={idx} action={action} isEditable={false} />
               ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center shadow-md dark:shadow-lg transition-colors">
              <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">No systemic compliance tasks were extracted from this module.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
