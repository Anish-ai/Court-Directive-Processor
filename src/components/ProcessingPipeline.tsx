"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, Circle, AlertCircle } from "lucide-react";

export const PIPELINE_STEPS = [
  "Initializing document analysis...",
  "Extracting case metadata...",
  "Identifying legal directives...",
  "Analyzing obligations and timelines...",
  "Formulating action plan...",
  "Finalizing structured output..."
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

    // Check if we hit the end of the visual pipeline
    if (currentStep >= PIPELINE_STEPS.length) {
      if (status === "success") {
        setProgress(100);
        const t = setTimeout(() => onVisualCompletion(), 600);
        return () => clearTimeout(t);
      }
      setProgress(95); // Hold firmly at 95% until backend completes
      return; 
    }

    // Set progress naturally for active step
    setProgress(Math.floor((currentStep / PIPELINE_STEPS.length) * 95));

    // Advance the visual step dynamically
    const delay = Math.floor(Math.random() * (1400 - 600 + 1)) + 600;
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
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Processing Failed</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm">
              The system encountered a fatal exception during document analysis. Please ensure the file is valid and try again.
            </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2 animate-pulse">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {status === "retrying" ? "Processing interrupted. Retrying analysis..." : "System Processing Pipeline"}
              </span>
              <span className="text-[11px] font-black uppercase text-blue-600 dark:text-cyan-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner">
              <div 
                className={`h-2 rounded-full transition-all duration-[800ms] ease-out ${status === "retrying" ? "bg-amber-500" : "bg-blue-600 dark:bg-cyan-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {PIPELINE_STEPS.map((stepText, idx) => {
              // Strictly tie visual completion to the pipeline step
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              const isPending = idx > currentStep;

              return (
                <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="w-6 h-6 flex justify-center items-center shrink-0">
                    {isCompleted ? (
                       <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400" />
                    ) : isActive ? (
                       <Loader2 size={18} className={`${status === "retrying" ? "text-amber-500" : "text-blue-600 dark:text-cyan-400"} animate-spin`} />
                    ) : (
                       <Circle size={14} className="text-slate-300 dark:text-slate-700" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isCompleted ? 'text-slate-500 dark:text-slate-400' : isActive ? 'text-blue-700 dark:text-cyan-300 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
                    {stepText}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
