"use client";

import { FileText, Users, BookOpen, Award } from 'lucide-react';

export default function ExtractionPanel({ data, onChange }: { data: any, onChange: (d: any) => void }) {
  if (!data) return null;

  const handleChange = (section: string, field: string, value: string) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    });
  };

  const InputField = ({ label, section, field, value }: any) => (
    <div className="flex flex-col gap-1.5 mb-2">
      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => handleChange(section, field, e.target.value)}
        className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
      />
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl p-6 space-y-8 relative overflow-hidden backdrop-blur-xl transition-colors">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none transition-colors" />

      {/* Case Details */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6 transition-colors">
          <FileText size={20} className="text-blue-600 dark:text-cyan-400" /> Case Parameters
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <InputField label="Case Number" section="case_details" field="case_number" value={data.case_details?.case_number} />
          <InputField label="Case Type" section="case_details" field="case_type" value={data.case_details?.case_type} />
          <InputField label="Court" section="case_details" field="court" value={data.case_details?.court} />
          <InputField label="Bench" section="case_details" field="bench" value={data.case_details?.bench} />
          <InputField label="Judge" section="case_details" field="judge" value={data.case_details?.judge} />
          <InputField label="Filed Under" section="case_details" field="filed_under" value={data.case_details?.filed_under} />
          <div className="flex flex-col gap-1.5 mb-2 col-span-2 sm:col-span-1">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 transition-colors">Date of Order</label>
            <input
              type="text"
              value={data.date_of_order || ""}
              onChange={(e) => onChange({ ...data, date_of_order: e.target.value })}
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-all shadow-inner relative"
            />
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="pt-2 border-t border-slate-200 dark:border-white/10 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6 mt-4 transition-colors">
          <Users size={20} className="text-indigo-600 dark:text-blue-400" /> Identity Matrix
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <InputField label="Petitioner" section="parties" field="petitioner" value={
            typeof data.parties?.petitioner === 'object' ? data.parties?.petitioner?.name : data.parties?.petitioner
          } />
          <InputField label="Petitioner Type" section="parties" field="petitioner_type" value={
            typeof data.parties?.petitioner === 'object' ? data.parties?.petitioner?.type : null
          } />
          <InputField label="Respondent" section="parties" field="respondent" value={
            typeof data.parties?.respondent === 'object' ? data.parties?.respondent?.name : data.parties?.respondent
          } />
          <InputField label="Respondent Type" section="parties" field="respondent_type" value={
            typeof data.parties?.respondent === 'object' ? data.parties?.respondent?.type : null
          } />
        </div>
      </div>

      {/* Case Outcome & Relief */}
      <div className="pt-2 border-t border-slate-200 dark:border-white/10 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6 mt-4 transition-colors">
          <Award size={20} className="text-emerald-600 dark:text-emerald-400" /> Outcome
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Case Outcome</label>
            <input
              type="text"
              value={data.case_outcome || ""}
              onChange={(e) => onChange({ ...data, case_outcome: e.target.value })}
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-all shadow-inner"
            />
          </div>
          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Relief Granted</label>
            <input
              type="text"
              value={data.relief_granted || ""}
              onChange={(e) => onChange({ ...data, relief_granted: e.target.value })}
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Cited Statutes */}
      {data.cited_statutes && data.cited_statutes.length > 0 && (
        <div className="pt-2 border-t border-slate-200 dark:border-white/10 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4 mt-4 transition-colors">
            <BookOpen size={20} className="text-amber-600 dark:text-amber-400" /> Cited Statutes
          </h3>
          <div className="space-y-2">
            {data.cited_statutes.map((s: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5 transition-colors">
                <span className="text-[10px] font-black tracking-widest text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-1 rounded-md uppercase shrink-0 mt-0.5">
                  §{i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.context}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
