"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, Circle, AlertCircle, Cpu, FileSearch, Scale, Clock, UserCheck, Users, Layers } from "lucide-react";

export const PIPELINE_STEPS = [
  { label: "Ingesting document...", icon: Cpu, agent: "Ingestion Agent" },
  { label: "Extracting case structure...", icon: FileSearch, agent: "Extraction Agent" },
  { label: "Analyzing legal obligations...", icon: Scale, agent: "Legal Analyst Agent" },
  { label: "Mapping timelines & deadlines...", icon: Clock, agent: "Timeline Agent" },
  { label: "Building petitioner action plan...", icon: UserCheck, agent: "Petitioner Agent" },
  { label: "Building respondent action plan...", icon: Users, agent: "Respondent Agent" },
  { label: "Cross-validating & synthesizing...", icon: Layers, agent: "Synthesis Agent" },
];

export default function ProcessingPipeline({
  status,
  onVisualCompletion
}: {
  status: "idle" | "processing" | "retrying" | "error" | "success";
  onVisualCompletion: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "idle" || status === "error") return;

    if (currentStep >= PIPELINE_STEPS.length) {
      if (status === "success") {
        setProgress(100);
        const t = setTimeout(() => onVisualCompletion(), 600);
        return () => clearTimeout(t);
      }
      setProgress(95);
      return; 
    }

    setProgress(Math.floor((currentStep / PIPELINE_STEPS.length) * 95));

    // Dynamic delays — some agents are faster than others visually
    const delays = [800, 1200, 1400, 1000, 1200, 1200, 1000];
    const delay = delays[currentStep] || 1000;
    const stepTimeout = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, delay);

    return () => clearTimeout(stepTimeout);
  }, [currentStep, status, onVisualCompletion]);

  if (status === "idle") return null;

  return (
    <div className="w-full mt-8 bg-white dark:bg-black/20 rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden transition-colors">
      
      {status === "error" ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="text-rose-500 mb-4" size={40} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Pipeline Failed</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm">
              The multi-agent system encountered an exception during document analysis. Please ensure the file is valid and try again.
            </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${status === "retrying" ? "bg-amber-500" : "bg-blue-500 dark:bg-cyan-400"} animate-pulse`} />
                {status === "retrying" ? "Retrying analysis pipeline..." : "Multi-Agent Processing Pipeline"}
              </span>
              <span className="text-[11px] font-black uppercase text-blue-600 dark:text-cyan-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner">
              <div 
                className={`h-2.5 rounded-full transition-all duration-[800ms] ease-out ${status === "retrying" ? "bg-amber-500" : "bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-cyan-500 dark:to-blue-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              const isPending = idx > currentStep;
              const IconComponent = step.icon;

              return (
                <div key={idx} className={`flex items-center gap-4 p-2.5 rounded-xl transition-all duration-500 ${
                  isActive ? 'bg-blue-50 dark:bg-cyan-500/5 border border-blue-200 dark:border-cyan-500/20' : 
                  isCompleted ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border border-transparent' :
                  'border border-transparent'
                } ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="w-7 h-7 flex justify-center items-center shrink-0">
                    {isCompleted ? (
                       <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400" />
                    ) : isActive ? (
                       <Loader2 size={18} className={`${status === "retrying" ? "text-amber-500" : "text-blue-600 dark:text-cyan-400"} animate-spin`} />
                    ) : (
                       <Circle size={14} className="text-slate-300 dark:text-slate-700" />
                    )}
                  </div>
                  <IconComponent size={16} className={`shrink-0 ${isCompleted ? 'text-emerald-500 dark:text-emerald-400' : isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-600'}`} />
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${isCompleted ? 'text-slate-500 dark:text-slate-400' : isActive ? 'text-blue-700 dark:text-cyan-300 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
                      {step.label}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-emerald-500/70' : isActive ? 'text-blue-500/70 dark:text-cyan-500/70' : 'text-slate-300 dark:text-slate-700'}`}>
                      {step.agent}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
