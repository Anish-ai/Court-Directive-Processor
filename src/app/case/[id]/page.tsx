"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Gavel, FileText, CalendarDays, UserCheck, Users, Clock, Shield, AlertTriangle, ChevronRight } from 'lucide-react';
import ActionCard from '@/components/ActionCard';
import LegalChatbot from '@/components/LegalChatbot';

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"respondent" | "petitioner">("respondent");

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

  const petitionerActions = record.petitioner_actions || [];
  const respondentActions = record.respondent_actions || [];
  // Legacy support
  const legacyActions = record.actions || [];
  const hasSplitActions = petitionerActions.length > 0 || respondentActions.length > 0;

  const petitionerName = typeof record.parties?.petitioner === 'object' ? record.parties?.petitioner?.name : record.parties?.petitioner;
  const respondentName = typeof record.parties?.respondent === 'object' ? record.parties?.respondent?.name : record.parties?.respondent;

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

        {/* Case Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-md dark:shadow-2xl p-8 lg:p-10 mb-10 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-indigo-600 dark:from-cyan-400 dark:to-blue-600" />
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Verified Intelligence Dossier
                </span>
                {record.case_outcome && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {record.case_outcome}
                  </span>
                )}
                {record.overall_confidence != null && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                    record.overall_confidence >= 80 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                    record.overall_confidence >= 50 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                    'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                  }`}>
                    <Shield size={12} /> {record.overall_confidence}% Confidence
                  </span>
                )}
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
                 <p className="text-md font-bold text-slate-800 dark:text-white border-l-2 border-emerald-500 pl-3 transition-colors">{petitionerName || "Unknown"}</p>
               </div>
               <div>
                 <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">Respondent</p>
                 <p className="text-md font-bold text-slate-800 dark:text-white border-l-2 border-rose-500 pl-3 transition-colors">{respondentName || "Unknown"}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Legal Summary */}
        {record.legal_summary && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-md dark:shadow-xl mb-10 transition-colors">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-4">
              <FileText size={14} className="text-indigo-500" /> Legal Summary
            </h2>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{record.legal_summary}</p>
          </div>
        )}

        {/* Appeal Recommendation */}
        {record.appeal_recommendation && (
          <div className={`rounded-3xl p-8 shadow-md mb-10 border transition-colors ${
            record.appeal_recommendation.recommendation === 'appeal_recommended'
              ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'
              : record.appeal_recommendation.recommendation === 'comply_recommended'
              ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Gavel size={18} className="text-indigo-500" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Appeal Recommendation</h2>
              <span className={`ml-auto text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                record.appeal_recommendation.recommendation === 'appeal_recommended' ? 'bg-amber-500 text-white' :
                record.appeal_recommendation.recommendation === 'comply_recommended' ? 'bg-emerald-500 text-white' :
                'bg-blue-500 text-white'
              }`}>{record.appeal_recommendation.recommendation?.replace(/_/g, ' ')}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{record.appeal_recommendation.reasoning}</p>
            <div className="flex gap-6 text-xs text-slate-500 dark:text-slate-400">
              {record.appeal_recommendation.appeal_forum && <span><strong>Forum:</strong> {record.appeal_recommendation.appeal_forum}</span>}
              {record.appeal_recommendation.limitation_period && <span><strong>Limitation:</strong> {record.appeal_recommendation.limitation_period}</span>}
            </div>
          </div>
        )}

        {/* Critical Deadlines */}
        {record.critical_deadlines && record.critical_deadlines.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-md dark:shadow-xl mb-10 transition-colors">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2 mb-6">
              <Clock size={14} className="text-amber-500" /> Critical Deadlines
            </h2>
            <div className="space-y-3">
              {record.critical_deadlines.map((d: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5 transition-colors">
                  <div className="w-14 h-14 flex flex-col items-center justify-center bg-amber-100 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 shrink-0">
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">{d.days_remaining ?? '—'}</span>
                    <span className="text-[8px] font-bold text-amber-500 uppercase">days</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{d.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {d.date || d.deadline_date || 'Date TBD'}
                      {d.applies_to && <span className="ml-2 text-[10px] font-bold uppercase">• {d.applies_to}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions — Party Split */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 transition-colors">
             <FileText className="text-blue-600 dark:text-cyan-500" /> Operating Directives
             <span className="text-[11px] ml-3 bg-blue-100 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30 px-3 py-1.5 rounded-full inline-block uppercase tracking-widest">
               {(petitionerActions.length + respondentActions.length + legacyActions.length)} Registered
             </span>
          </h2>

          {hasSplitActions ? (
            <>
              {/* Tab Switcher */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                <button 
                  onClick={() => setActiveTab("respondent")}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    activeTab === "respondent" 
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-white/10" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Users size={16} /> Respondent ({respondentActions.length})
                </button>
                <button 
                  onClick={() => setActiveTab("petitioner")}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    activeTab === "petitioner" 
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-white/10" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <UserCheck size={16} /> Petitioner ({petitionerActions.length})
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {(activeTab === "respondent" ? respondentActions : petitionerActions).map((action: any, idx: number) => (
                  <ActionCard key={idx} action={action} isEditable={false} />
                ))}
                {(activeTab === "respondent" ? respondentActions : petitionerActions).length === 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center shadow-md dark:shadow-lg transition-colors">
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">No actions for this party.</p>
                  </div>
                )}
              </div>
            </>
          ) : legacyActions.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
               {legacyActions.map((action: any, idx: number) => (
                 <ActionCard key={idx} action={action} isEditable={false} />
               ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center shadow-md dark:shadow-lg transition-colors">
              <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">No systemic compliance tasks were extracted from this module.</p>
            </div>
          )}
        </div>

        {/* Validation Notes */}
        {record.validation_notes && record.validation_notes.length > 0 && (
          <div className="mt-10 p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-3xl">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} /> Cross-Validation Notes
            </h3>
            <ul className="space-y-1.5">
              {record.validation_notes.map((note: string, i: number) => (
                <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <ChevronRight size={12} className="mt-0.5 shrink-0" /> {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* RAG Legal Chatbot */}
      <LegalChatbot extractedData={record} synthesis={record} />
    </div>
  );
}
