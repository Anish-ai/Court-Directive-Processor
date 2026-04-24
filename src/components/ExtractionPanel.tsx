"use client";

import { FileText, Users } from 'lucide-react';

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

      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6 transition-colors">
          <FileText size={20} className="text-blue-600 dark:text-cyan-400" /> Registry Parameters
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <InputField label="Case Number" section="case_details" field="case_number" value={data.case_details?.case_number} />
          <InputField label="Court" section="case_details" field="court" value={data.case_details?.court} />
          <InputField label="Judge" section="case_details" field="judge" value={data.case_details?.judge} />
          <div className="flex flex-col gap-1.5 mb-2">
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

      <div className="pt-2 border-t border-slate-200 dark:border-white/10 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6 mt-4 transition-colors">
          <Users size={20} className="text-indigo-600 dark:text-blue-400" /> Identity Matrix
        </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <InputField label="Petitioner" section="parties" field="petitioner" value={data.parties?.petitioner} />
          <InputField label="Respondent" section="parties" field="respondent" value={data.parties?.respondent} />
        </div>
      </div>
    </div>
  );
}
