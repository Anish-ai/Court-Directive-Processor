"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type AppContextType = {
  activeFile: File | null;
  setActiveFile: (f: File | null) => void;

  // Full pipeline result from /api/process
  pipelineResult: any;
  setPipelineResult: (d: any) => void;

  // Convenience getters for individual pieces
  extractedData: any;
  legalAnalysis: any;
  timeline: any;
  petitionerActions: any;
  respondentActions: any;
  synthesis: any;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [pipelineResult, setPipelineResult] = useState<any>(null);

  return (
    <AppContext.Provider value={{
      activeFile, setActiveFile,
      pipelineResult, setPipelineResult,
      extractedData: pipelineResult?.extraction ?? null,
      legalAnalysis: pipelineResult?.legalAnalysis ?? null,
      timeline: pipelineResult?.timeline ?? null,
      petitionerActions: pipelineResult?.petitionerActions ?? null,
      respondentActions: pipelineResult?.respondentActions ?? null,
      synthesis: pipelineResult?.synthesis ?? null,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
