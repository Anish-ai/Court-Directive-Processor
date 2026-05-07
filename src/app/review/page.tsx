"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../providers';
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false, loading: () => <p className="text-blue-600 dark:text-cyan-500 animate-pulse font-bold tracking-widest text-sm uppercase p-8">Initializing Source Context...</p> });
import ExtractionPanel from '@/components/ExtractionPanel';
import ActionCard from '@/components/ActionCard';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle, XCircle, ShieldAlert, FileText, Scale, GitBranch, Clock, UserCheck, Users, AlertTriangle, ChevronRight, Gavel } from 'lucide-react';
import LegalChatbot from '@/components/LegalChatbot';

export default function ReviewPage() {
  const router = useRouter();
  const { activeFile, extractedData, legalAnalysis, timeline, synthesis, pipelineResult, setPipelineResult, caseId } = useAppContext();
  
  const [revealPhase, setRevealPhase] = useState(0);
  const [activeTab, setActiveTab] = useState<"petitioner" | "respondent">("respondent");

  useEffect(() => {
    if (!activeFile || !pipelineResult) {
      router.replace('/upload');
      return;
    }

    const t1 = setTimeout(() => setRevealPhase(1), 500);
    const t2 = setTimeout(() => setRevealPhase(2), 1100);
    const t3 = setTimeout(() => setRevealPhase(3), 1700);
    const t4 = setTimeout(() => setRevealPhase(4), 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [activeFile, pipelineResult, router]);

  if (!activeFile || !pipelineResult) return null;

  const synth = synthesis;
  const petitionerActions = synth?.petitioner_actions || pipelineResult?.petitionerActions?.actions || [];
  const respondentActions = synth?.respondent_actions || pipelineResult?.respondentActions?.actions || [];

  const handleApprove = () => {
    const newRecord = {
      id: uuidv4(),
      case_details: extractedData?.case_details,
      parties: synth?.parties || extractedData?.parties,
      date_of_order: extractedData?.date_of_order,
      case_outcome: extractedData?.case_outcome,
      relief_granted: extractedData?.relief_granted,
      petitioner_actions: petitionerActions,
      respondent_actions: respondentActions,
      critical_deadlines: synth?.critical_deadlines || timeline?.critical_deadlines || [],
      appeal_recommendation: synth?.appeal_recommendation || legalAnalysis?.appeal_analysis,
      legal_summary: synth?.case_summary?.legal_summary || legalAnalysis?.legal_summary,
      overall_confidence: synth?.overall_confidence,
      validation_notes: synth?.validation_notes,
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
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">Cross-reference extracted data with source document. Review party-specific actions before approving.</p>
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
               <ExtractionPanel data={extractedData} onChange={(d) => setPipelineResult({ ...pipelineResult, extraction: d })} />
             </div>

             {/* PHASE 2: Legal Analysis + Timeline */}
             <div className={`transition-all duration-700 ease-out transform ${revealPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="mb-4 mt-8">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <Scale size={14} className="text-indigo-500 dark:text-blue-400" /> Section 2: Legal Analysis
                  </h2>
                </div>
                
                {/* Legal Summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-md dark:shadow-xl relative overflow-hidden backdrop-blur-xl transition-colors mb-4">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 dark:via-blue-500 to-transparent opacity-50" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    {legalAnalysis?.legal_summary || "The intelligence engine has identified core obligations and timelines embedded within the legal context."}
                  </p>
                </div>

                {/* Appeal Analysis */}
                {legalAnalysis?.appeal_analysis && (
                  <div className={`p-5 rounded-2xl border mb-4 transition-colors ${
                    legalAnalysis.appeal_analysis.recommendation === 'appeal_recommended' 
                      ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/30'
                      : legalAnalysis.appeal_analysis.recommendation === 'comply_recommended'
                      ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/10'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Gavel size={16} className="text-indigo-500" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Appeal Analysis</span>
                      <span className={`text-[10px] ml-auto px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
                        legalAnalysis.appeal_analysis.recommendation === 'appeal_recommended' 
                          ? 'bg-amber-500 text-white' 
                          : legalAnalysis.appeal_analysis.recommendation === 'comply_recommended'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-500 text-white'
                      }`}>
                        {legalAnalysis.appeal_analysis.recommendation?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{legalAnalysis.appeal_analysis.reasoning}</p>
                    <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                      {legalAnalysis.appeal_analysis.appeal_forum && (
                        <span><strong>Forum:</strong> {legalAnalysis.appeal_analysis.appeal_forum}</span>
                      )}
                      {legalAnalysis.appeal_analysis.limitation_period && (
                        <span><strong>Limitation:</strong> {legalAnalysis.appeal_analysis.limitation_period}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Compliance Risks */}
                {legalAnalysis?.compliance_risks && legalAnalysis.compliance_risks.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {legalAnalysis.compliance_risks.map((risk: any, i: number) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                        risk.severity === 'high' ? 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20' :
                        risk.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20' :
                        'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/10'
                      }`}>
                        <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${risk.severity === 'high' ? 'text-rose-500' : risk.severity === 'medium' ? 'text-amber-500' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{risk.risk}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{risk.consequence}</p>
                        </div>
                        <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ${
                          risk.severity === 'high' ? 'bg-rose-500 text-white' : risk.severity === 'medium' ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white'
                        }`}>{risk.severity}</span>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* PHASE 3: Timeline & Deadlines */}
             <div className={`transition-all duration-700 ease-out transform ${revealPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="mb-4 mt-8">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <Clock size={14} className="text-blue-600 dark:text-cyan-400" /> Section 3: Critical Timelines
                  </h2>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-md dark:shadow-xl relative overflow-hidden backdrop-blur-xl transition-colors">
                  {(synth?.critical_deadlines || timeline?.critical_deadlines || []).length > 0 ? (
                    <div className="space-y-3">
                      {(synth?.critical_deadlines || timeline?.critical_deadlines || []).map((d: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5 transition-colors">
                          <div className="w-12 h-12 flex flex-col items-center justify-center bg-blue-100 dark:bg-cyan-500/10 rounded-xl border border-blue-200 dark:border-cyan-500/20 shrink-0">
                            <span className="text-[10px] font-black text-blue-600 dark:text-cyan-400 uppercase">
                              {d.days_remaining != null ? `${d.days_remaining}d` : '—'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{d.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {d.date || d.deadline_date || 'Date not specified'}
                              {d.applies_to && <span className="ml-2 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">• {d.applies_to}</span>}
                            </p>
                          </div>
                          {d.consequence_of_missing && (
                            <span className="text-[10px] text-rose-500 font-bold max-w-[150px] text-right">{d.consequence_of_missing}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 font-medium">No critical deadlines identified.</p>
                  )}
                </div>
             </div>

             {/* PHASE 4: Party-Specific Actions */}
             <div className={`transition-all duration-700 ease-out transform ${revealPhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="mb-4 mt-8">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <GitBranch size={14} className="text-blue-600 dark:text-cyan-400" /> Section 4: Party Action Plans
                  </h2>
                </div>
                
                {/* Overall Confidence Badge */}
                {synth?.overall_confidence != null && (
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Pipeline Confidence:</span>
                    <span className={`text-[12px] font-black px-3 py-1 rounded-full ${
                      synth.overall_confidence >= 80 ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                      synth.overall_confidence >= 50 ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' :
                      'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                    }`}>{synth.overall_confidence}%</span>
                  </div>
                )}

                {/* Tab Switcher */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-5 border border-slate-200 dark:border-white/10">
                  <button 
                    onClick={() => setActiveTab("respondent")}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                      activeTab === "respondent" 
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-white/10" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <Users size={16} /> Respondent Actions
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{respondentActions.length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("petitioner")}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                      activeTab === "petitioner" 
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-white/10" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <UserCheck size={16} /> Petitioner Actions
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{petitionerActions.length}</span>
                  </button>
                </div>

                {/* Action Cards */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-md dark:shadow-xl relative overflow-hidden backdrop-blur-xl transition-colors">
                  <div className="space-y-5 mt-2">
                    {activeTab === "respondent" ? (
                      respondentActions.length > 0 ? (
                        respondentActions.map((item: any, idx: number) => (
                          <ActionCard 
                            key={idx} 
                            action={item} 
                            isEditable={true} 
                            onChange={(updated) => {
                              const next = [...respondentActions];
                              next[idx] = updated;
                              if (synth) {
                                setPipelineResult({ ...pipelineResult, synthesis: { ...synth, respondent_actions: next } });
                              }
                            }}
                          />
                        ))
                      ) : (
                        <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 p-6 rounded-2xl text-center transition-colors">
                          <p className="text-sm font-medium text-slate-500">No respondent actions identified.</p>
                        </div>
                      )
                    ) : (
                      petitionerActions.length > 0 ? (
                        petitionerActions.map((item: any, idx: number) => (
                          <ActionCard 
                            key={idx} 
                            action={item} 
                            isEditable={true} 
                            onChange={(updated) => {
                              const next = [...petitionerActions];
                              next[idx] = updated;
                              if (synth) {
                                setPipelineResult({ ...pipelineResult, synthesis: { ...synth, petitioner_actions: next } });
                              }
                            }}
                          />
                        ))
                      ) : (
                        <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 p-6 rounded-2xl text-center transition-colors">
                          <p className="text-sm font-medium text-slate-500">No petitioner actions identified.</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Validation Notes */}
                {synth?.validation_notes && synth.validation_notes.length > 0 && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                      <AlertTriangle size={14} /> Cross-Validation Notes
                    </h4>
                    <ul className="space-y-1">
                      {synth.validation_notes.map((note: string, i: number) => (
                        <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                          <ChevronRight size={12} className="mt-0.5 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>

      {/* RAG Legal Chatbot */}
      <LegalChatbot extractedData={extractedData} synthesis={synthesis} caseId={caseId} />
    </div>
  );
}
