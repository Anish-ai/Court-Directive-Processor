"use client";

import { AlertCircle, CalendarClock, Briefcase, ChevronRight, ShieldAlert, Link2 } from "lucide-react";

export interface ActionPlanItem {
  action_id?: string;
  type: string;
  description: string;
  deadline: string;
  responsible_department: string;
  priority: "critical" | "high" | "medium" | "low" | string;
  confidence: number;
  justification: string;
  estimated_effort?: string;
  compliance_risk_if_missed?: string;
  linked_obligation_id?: string;
  linked_timeline_id?: string;
}

export default function ActionCard({ action, isEditable = false, onChange }: { action: ActionPlanItem, isEditable?: boolean, onChange?: (updated: ActionPlanItem) => void }) {
  
  const getConfidenceLevel = (score: number) => {
    if (score >= 80) return "high";
    if (score >= 50) return "medium";
    return "low";
  };

  const confidence = getConfidenceLevel(action.confidence || 0);

  const confidenceStyles = {
    high: "border-emerald-300 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.05)]",
    medium: "border-amber-300 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-500/10 shadow-sm dark:shadow-[0_0_15px_rgba(245,158,11,0.05)]",
    low: "border-rose-300 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-500/10 shadow-sm dark:shadow-[0_0_15px_rgba(244,63,94,0.05)]"
  };

  const confidenceIconColors = {
    high: "text-emerald-600 dark:text-emerald-400",
    medium: "text-amber-600 dark:text-amber-400",
    low: "text-rose-600 dark:text-rose-400"
  };
  
  const getPriorityColor = (priority: string) => {
    const p = priority?.toLowerCase() || '';
    if (p === 'critical') return "bg-rose-600 text-white shadow-rose-600/40 ring-1 ring-rose-400";
    if (p === 'high') return "bg-rose-500 text-white shadow-rose-500/40";
    if (p === 'medium') return "bg-amber-500 text-white shadow-amber-500/40";
    if (p === 'low') return "bg-blue-500 text-white shadow-blue-500/40";
    return "bg-slate-600 text-white shadow-slate-600/40";
  };

  const wrapOnChange = (field: keyof ActionPlanItem, value: any) => {
    if (onChange) {
      onChange({ ...action, [field]: value });
    }
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-md ${confidenceStyles[confidence]} hover:shadow-md dark:hover:shadow-xl`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full ${confidence === 'high' ? 'bg-emerald-500' : confidence === 'medium' ? 'bg-amber-500' : 'bg-rose-500'}`} />
      
      <div className="flex justify-between items-start mb-4 ml-3">
        <div className="flex gap-2 items-center flex-wrap">
           {action.action_id && (
             <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 dark:bg-slate-700 text-white font-mono tracking-wider shadow-sm">
               {action.action_id}
             </span>
           )}
           <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-[0.15em] shadow-md ${getPriorityColor(action.priority)}`}>
              {action.priority} priority
           </span>
           <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 font-bold uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 transition-colors">
              {action.type}
           </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-full shadow-sm dark:shadow-inner transition-colors" title="System Confidence Check">
          <AlertCircle size={14} className={confidenceIconColors[confidence]} />
          <span className="text-[11px] font-black tracking-wide text-slate-700 dark:text-slate-200">{action.confidence || 0}%</span>
        </div>
      </div>

      <div className="ml-3 space-y-4">
        {isEditable ? (
          <textarea
            title="Description"
            rows={3}
            className="w-full text-sm font-medium bg-white/60 dark:bg-black/40 text-slate-800 dark:text-white border border-slate-300 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-500 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
            value={action.description || ""}
            onChange={(e) => wrapOnChange("description", e.target.value)}
          />
        ) : (
          <p className="text-[15px] font-medium text-slate-800 dark:text-slate-100 leading-relaxed drop-shadow-sm transition-colors">{action.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-slate-300 dark:border-white/10 transition-colors">
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest transition-colors">
               <CalendarClock size={14} className="text-blue-600 dark:text-cyan-400" /> Deadline
             </div>
             {isEditable ? (
                <input 
                  title="Deadline"
                  type="text" 
                  value={action.deadline || ""} 
                  onChange={(e) => wrapOnChange("deadline", e.target.value)}
                  className="bg-white/60 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm font-medium w-full focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
                />
             ) : (
                <span className="font-semibold bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg inline-block w-fit transition-colors">{action.deadline || "N/A"}</span>
             )}
          </div>
          
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest transition-colors">
               <Briefcase size={14} className="text-blue-600 dark:text-cyan-400" /> Department
             </div>
             {isEditable ? (
                <input 
                  title="Department"
                  type="text" 
                  value={action.responsible_department || ""} 
                  onChange={(e) => wrapOnChange("responsible_department", e.target.value)}
                  className="bg-white/60 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm font-medium w-full focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
                />
             ) : (
                <span className="font-semibold bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg inline-block w-fit transition-colors">{action.responsible_department || "Undecided"}</span>
             )}
          </div>
        </div>

        {/* Estimated Effort */}
        {action.estimated_effort && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span className="font-bold uppercase tracking-widest text-[10px]">Effort:</span>
            <span className="font-medium">{action.estimated_effort}</span>
          </div>
        )}

        {/* Linked References */}
        {(action.linked_obligation_id || action.linked_timeline_id) && (
          <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <Link2 size={12} />
            {action.linked_obligation_id && <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{action.linked_obligation_id}</span>}
            {action.linked_timeline_id && <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{action.linked_timeline_id}</span>}
          </div>
        )}

        {/* Justification */}
        {action.justification && (
          <div className="mt-4 bg-white/50 dark:bg-black/30 p-3 rounded-xl border border-slate-300 dark:border-white/5 flex items-start gap-3 backdrop-blur-sm transition-colors">
            <ChevronRight size={16} className="mt-0.5 text-blue-600 dark:text-cyan-500 shrink-0" />
            <span className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium transition-colors">{action.justification}</span>
          </div>
        )}

        {/* Compliance Risk */}
        {action.compliance_risk_if_missed && (
          <div className="mt-2 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-200 dark:border-rose-500/20 flex items-start gap-3 transition-colors">
            <ShieldAlert size={16} className="mt-0.5 text-rose-500 shrink-0" />
            <span className="text-[13px] text-rose-700 dark:text-rose-300 leading-relaxed font-medium">{action.compliance_risk_if_missed}</span>
          </div>
        )}
      </div>
    </div>
  );
}
