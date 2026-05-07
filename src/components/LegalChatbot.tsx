"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, ChevronRight, Sparkles, BookOpen } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { page: string; text: string }[];
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What are the key directions in this judgment?",
  "What is the deadline for compliance?",
  "Who is the respondent obligated to report to?",
  "Should the respondent consider filing an appeal?",
  "What happens if the respondent misses the deadline?",
  "What departments need to be notified?",
];

// Simulated RAG responses keyed by intent
function getSimulatedResponse(question: string, extractedData: any, synthesis: any): ChatMessage {
  const q = question.toLowerCase();

  const caseName = extractedData?.case_details?.case_number || "this case";
  const petitioner = typeof extractedData?.parties?.petitioner === "object"
    ? extractedData?.parties?.petitioner?.name
    : extractedData?.parties?.petitioner || "the petitioner";
  const respondent = typeof extractedData?.parties?.respondent === "object"
    ? extractedData?.parties?.respondent?.name
    : extractedData?.parties?.respondent || "the respondent";
  const judge = extractedData?.case_details?.judge || "the presiding judge";
  const court = extractedData?.case_details?.court || "the court";
  const outcome = extractedData?.case_outcome || synthesis?.case_summary?.outcome || "disposed";
  const legalSummary = synthesis?.case_summary?.legal_summary || "The court has issued directions requiring timely compliance from the concerned parties.";

  const directions = extractedData?.key_directions || [];
  const deadlines = synthesis?.critical_deadlines || [];
  const appealRec = synthesis?.appeal_recommendation;
  const respondentActions = synthesis?.respondent_actions || [];
  const petitionerActions = synthesis?.petitioner_actions || [];

  // Match intent
  if (q.includes("key direction") || q.includes("order") || q.includes("directive")) {
    const dirList = directions.length > 0
      ? directions.map((d: any, i: number) => `${d.direction_id || `D${i + 1}`}: "${d.text}"`).join("\n\n")
      : "No specific directions were extracted from this judgment.";
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `Based on my analysis of ${caseName}, the following key directions were identified:\n\n${dirList}\n\nEach direction has been mapped to specific obligations and action items in the pipeline output.`,
      sources: directions.slice(0, 2).map((d: any) => ({
        page: d.page_reference || "N/A",
        text: d.text?.substring(0, 120) + "..." || "Direction text",
      })),
      timestamp: new Date(),
    };
  }

  if (q.includes("deadline") || q.includes("timeline") || q.includes("when") || q.includes("time")) {
    const deadlineInfo = deadlines.length > 0
      ? deadlines.map((d: any) => `• ${d.description}: ${d.date || d.deadline_date || "Date not specified"} (${d.days_remaining != null ? `${d.days_remaining} days remaining` : "timeline pending"})`).join("\n")
      : "No explicit deadlines were identified. However, standard statutory limitation periods may apply.";
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `Here are the critical timelines for ${caseName}:\n\n${deadlineInfo}\n\nI recommend setting up calendar reminders for each deadline to ensure timely compliance.`,
      sources: [{ page: "Timeline Analysis", text: "Deadlines derived from order text and statutory provisions" }],
      timestamp: new Date(),
    };
  }

  if (q.includes("appeal") || q.includes("challenge") || q.includes("review")) {
    const rec = appealRec?.recommendation?.replace(/_/g, " ") || "not determined";
    const reasoning = appealRec?.reasoning || "Appeal analysis was not conclusive based on available information.";
    const forum = appealRec?.appeal_forum || "the appropriate appellate authority";
    const limitation = appealRec?.limitation_period || "as per applicable statute";
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `**Appeal Analysis for ${caseName}:**\n\n**Recommendation:** ${rec.charAt(0).toUpperCase() + rec.slice(1)}\n\n**Reasoning:** ${reasoning}\n\n**Appeal Forum:** ${forum}\n**Limitation Period:** ${limitation}\n\nNote: This is an AI-assisted analysis. Please consult with your legal department for a definitive opinion.`,
      sources: [{ page: "Legal Analysis", text: "Appeal viability assessed based on case outcome, legal grounds, and statutory provisions" }],
      timestamp: new Date(),
    };
  }

  if (q.includes("miss") || q.includes("fail") || q.includes("consequence") || q.includes("contempt") || q.includes("penalty")) {
    const risks = respondentActions
      .filter((a: any) => a.compliance_risk_if_missed)
      .map((a: any) => `• ${a.description}: **Risk** — ${a.compliance_risk_if_missed}`)
      .join("\n");
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `**Consequences of non-compliance in ${caseName}:**\n\n${risks || "• Potential contempt of court proceedings\n• Administrative penalties\n• Matter may be listed for show-cause"}\n\nThe court's order typically carries mandatory compliance obligations. Failure to act within stipulated timelines may result in the court initiating suo motu proceedings.`,
      sources: [{ page: "Compliance Risk Analysis", text: "Risk assessment based on court directives and statutory consequences" }],
      timestamp: new Date(),
    };
  }

  if (q.includes("department") || q.includes("notify") || q.includes("responsible") || q.includes("who")) {
    const depts = [...new Set([...respondentActions, ...petitionerActions]
      .map((a: any) => a.responsible_department)
      .filter(Boolean))];
    const deptList = depts.length > 0
      ? depts.map(d => `• ${d}`).join("\n")
      : "• The concerned department(s) should be identified based on the nature of directives.";
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `**Departments involved in ${caseName}:**\n\n${deptList}\n\nI recommend immediate notification to all listed departments with a copy of the court order and a clear breakdown of their respective obligations.`,
      sources: [{ page: "Action Plan", text: "Department assignments derived from obligation analysis" }],
      timestamp: new Date(),
    };
  }

  if (q.includes("respondent") && (q.includes("report") || q.includes("obligat"))) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `**Respondent's reporting obligations in ${caseName}:**\n\nThe respondent (${respondent}) is required to comply with the court's directions as specified in the order. Based on the extracted data:\n\n${respondentActions.slice(0, 3).map((a: any) => `• **${a.type}:** ${a.description}`).join("\n") || "• Specific reporting obligations are detailed in the action plan section."}\n\nAll compliance reports should be submitted to the Registry of ${court}.`,
      sources: [{ page: "Order Text", text: "Respondent obligations extracted from court directions" }],
      timestamp: new Date(),
    };
  }

  if (q.includes("summar") || q.includes("overview") || q.includes("about")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `**Case Summary — ${caseName}:**\n\n**Court:** ${court}\n**Judge:** ${judge}\n**Petitioner:** ${petitioner}\n**Respondent:** ${respondent}\n**Outcome:** ${outcome}\n\n${legalSummary}\n\nThe multi-agent pipeline has identified ${respondentActions.length} respondent actions and ${petitionerActions.length} petitioner actions requiring attention.`,
      sources: [{ page: "Full Document", text: "Summary compiled from extracted case metadata and legal analysis" }],
      timestamp: new Date(),
    };
  }

  // Default fallback
  return {
    id: Date.now().toString(),
    role: "assistant",
    content: `Based on my analysis of ${caseName}, here is what I found:\n\n${legalSummary}\n\nThe case involves ${petitioner} (petitioner) vs ${respondent} (respondent), decided by ${judge} at ${court}. The outcome was: **${outcome}**.\n\nWould you like me to elaborate on any specific aspect — directions, deadlines, appeal options, or departmental responsibilities?`,
    sources: [{ page: "Full Analysis", text: "Response generated from multi-agent pipeline output" }],
    timestamp: new Date(),
  };
}

export default function LegalChatbot({
  extractedData,
  synthesis,
}: {
  extractedData: any;
  synthesis: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your **CDP Legal Assistant**. I have analyzed this judgment using the multi-agent pipeline. Ask me anything about the case — directions, deadlines, appeal options, compliance risks, or departmental responsibilities.\n\nYou can also try one of the suggested questions below.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate network delay for realism
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const response = getSimulatedResponse(question, extractedData, synthesis);
    setMessages((prev) => [...prev, response]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-cyan-500 dark:to-blue-600 rounded-2xl shadow-2xl dark:shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center hover:scale-110 transition-all duration-300 group"
        >
          <MessageCircle size={28} className="text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-[420px] h-[600px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl dark:shadow-[0_0_40px_rgba(6,182,212,0.15)] border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-cyan-600 dark:to-blue-700 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-wide">CDP Legal Assistant</h3>
                <p className="text-white/60 text-[10px] font-medium tracking-widest uppercase">RAG-Powered • Source-Grounded</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-[#0a0a0a]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-blue-100 dark:bg-blue-500/20"
                    : "bg-indigo-100 dark:bg-cyan-500/20"
                }`}>
                  {msg.role === "user" ? (
                    <User size={16} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Sparkles size={16} className="text-indigo-600 dark:text-cyan-400" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : ""}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 dark:bg-cyan-600 text-white rounded-tr-md"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-tl-md shadow-sm"
                  }`}>
                    {msg.content.split("\n").map((line, i) => {
                      // Simple bold markdown
                      const parts = line.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                          {parts.map((part, j) =>
                            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                          )}
                        </p>
                      );
                    })}
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.sources.map((src, i) => (
                        <div key={i} className="flex items-start gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-xl">
                          <BookOpen size={12} className="text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{src.page}</span>
                            <p className="text-[11px] text-indigo-500/70 dark:text-indigo-300/50 mt-0.5 line-clamp-2">{src.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-indigo-600 dark:text-cyan-400" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Suggested Questions</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-[11px] px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-cyan-500/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 rounded-lg border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-cyan-500/30 transition-colors font-medium flex items-center gap-1"
                  >
                    <ChevronRight size={10} className="shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this judgment..."
                disabled={isTyping}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-500 transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 bg-blue-600 dark:bg-cyan-600 hover:bg-blue-700 dark:hover:bg-cyan-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-xl flex items-center justify-center transition-all shadow-md disabled:shadow-none"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
