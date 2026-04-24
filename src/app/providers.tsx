"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type AppContextType = {
  activeFile: File | null;
  setActiveFile: (f: File | null) => void;
  extractedData: any;
  setExtractedData: (d: any) => void;
  actionPlan: any;
  setActionPlan: (a: any) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [actionPlan, setActionPlan] = useState<any>(null);

  return (
    <AppContext.Provider value={{ activeFile, setActiveFile, extractedData, setExtractedData, actionPlan, setActionPlan }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
