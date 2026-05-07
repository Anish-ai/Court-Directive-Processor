"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, X, Send, Bot, User, ChevronRight, Sparkles, BookOpen,
  Shield, Search, Brain, AlertTriangle, ChevronDown, ChevronUp, Flag,
  Lightbulb, RefreshCw
} from "lucide-react";

interface ChatSource {
  page: number;
  text: string;
  score: number;
  chunk_id: string;
}

type ResponseMode =
  | "VERIFIED_OPERATIONAL"
  | "SOURCE_GROUNDED_JUDGMENT"
  | "GENERAL_LEGAL"
  | "MIXED_ANALYTICAL"
  | "INSUFFICIENT_EVIDENCE";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: ResponseMode;
  confidence?: number;
  sources?: ChatSource[];
  query_type?: string;
  reasoning?: string;
  alternative_answer?: string;
  simplified?: string;
  timestamp: Date;
}

const MODE_CONFIG: Record<ResponseMode, { label: string; color: string; darkColor: string; icon: any }> = {
  VERIFIED_OPERATIONAL: { label: "Verified Record", color: "bg-emerald-100 text-emerald-700 border-emerald-200", darkColor: "dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20", icon: Shield },
  SOURCE_GROUNDED_JUDGMENT: { label: "Source-Grounded", color: "bg-blue-100 text-blue-700 border-blue-200", darkColor: "dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20", icon: Search },
  GENERAL_LEGAL: { label: "General Legal", color: "bg-amber-100 text-amber-700 border-amber-200", darkColor: "dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20", icon: Brain },
  MIXED_ANALYTICAL: { label: "Mixed Analysis", color: "bg-purple-100 text-purple-700 border-purple-200", darkColor: "dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20", icon: Sparkles },
  INSUFFICIENT_EVIDENCE: { label: "Insufficient Evidence", color: "bg-red-100 text-red-700 border-red-200", darkColor: "dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20", icon: AlertTriangle },
};

const SUGGESTED_QUESTIONS = [
  "What are the key directions in this judgment?",
  "What is the deadline for compliance?",
  "Should the department consider filing an appeal?",
  "What is contempt of court?",
  "Why is this judgment risky for the department?",
  "Which departments need to be notified?",
];

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 80 ? "text-emerald-600 dark:text-emerald-400" : pct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <span className={`text-[10px] font-black tracking-wider ${color}`}>
      {pct}% confidence
    </span>
  );
}

function SourcePanel({ sources }: { sources: ChatSource[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
      >
        <BookOpen size={10} />
        {sources.length} source{sources.length > 1 ? "s" : ""} cited
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1.5">
          {sources.map((src, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-xl"
            >
              <BookOpen size={11} className="text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {src.page > 0 && (
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded">
                      Page {src.page}
                    </span>
                  )}
                  <span className="text-[9px] text-indigo-400 dark:text-indigo-500">
                    relevance: {Math.round(src.score * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-indigo-500/70 dark:text-indigo-300/50 mt-0.5 line-clamp-3">
                  {src.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SimplifyButton({
  messageId,
  text,
  onSimplified,
}: {
  messageId: string;
  text: string;
  onSimplified: (simplified: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleSimplify = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.simplified) {
        onSimplified(data.simplified);
      }
    } catch {
      onSimplified("Could not simplify. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSimplify}
      disabled={loading}
      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <RefreshCw size={10} className="animate-spin" />
      ) : (
        <Lightbulb size={10} />
      )}
      {loading ? "Simplifying..." : "Explain Simply"}
    </button>
  );
}

function AlternativeAnswer({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest hover:text-violet-800 dark:hover:text-violet-300 transition-colors"
      >
        <RefreshCw size={10} />
        Alternative interpretation
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>
      {expanded && (
        <div className="mt-1.5 px-3 py-2.5 bg-violet-50 dark:bg-violet-500/5 border border-violet-200 dark:border-violet-500/15 rounded-xl">
          <p className="text-[12px] text-violet-700 dark:text-violet-300/80 leading-relaxed">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

export default function LegalChatbot({
  extractedData,
  synthesis,
  caseId,
}: {
  extractedData: any;
  synthesis: any;
  caseId?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm the **CDP Legal Intelligence Assistant**.\n\nI can answer questions about this judgment using **4 intelligence modes**:\n\n• **Verified Records** — from approved action plans\n• **Source-Grounded** — retrieved from the judgment text\n• **General Legal** — procedural law knowledge\n• **Mixed Analysis** — combined reasoning\n\nEvery response includes a mode label, confidence score, and source citations.",
      mode: "VERIFIED_OPERATIONAL",
      confidence: 1,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingStage, setTypingStage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTypingStage("Classifying query...");

    try {
      // Build conversation history for context
      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      setTypingStage("Retrieving evidence...");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: question,
          caseId: caseId || undefined,
          extractedData,
          synthesis,
          conversationHistory: history,
        }),
      });

      setTypingStage("Generating response...");
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: Date.now().toString() + "-assistant",
        role: "assistant",
        content: data.answer || "I couldn't generate a response. Please try again.",
        mode: data.mode || "INSUFFICIENT_EVIDENCE",
        confidence: data.confidence || 0,
        sources: data.sources || [],
        query_type: data.query_type,
        reasoning: data.reasoning,
        alternative_answer: data.alternative_answer || undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          role: "assistant",
          content: "An error occurred while processing your question. Please try again.",
          mode: "INSUFFICIENT_EVIDENCE" as ResponseMode,
          confidence: 0,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setTypingStage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Trigger */}
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
        <div className="fixed bottom-8 right-8 z-50 w-[440px] h-[640px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl dark:shadow-[0_0_40px_rgba(6,182,212,0.15)] border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-cyan-600 dark:to-blue-700 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-wide">CDP Legal Assistant</h3>
                <p className="text-white/60 text-[10px] font-medium tracking-widest uppercase">
                  Hybrid RAG • {caseId ? "Case Indexed" : "General Mode"}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0a0a0a]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-blue-100 dark:bg-blue-500/20" : "bg-indigo-100 dark:bg-cyan-500/20"
                }`}>
                  {msg.role === "user" ? (
                    <User size={16} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Sparkles size={16} className="text-indigo-600 dark:text-cyan-400" />
                  )}
                </div>

                <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : ""}`}>
                  {/* Mode Badge */}
                  {msg.role === "assistant" && msg.mode && msg.id !== "welcome" && (
                    <div className="flex items-center gap-2 mb-1.5">
                      {(() => {
                        const config = MODE_CONFIG[msg.mode];
                        const Icon = config.icon;
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.color} ${config.darkColor}`}>
                            <Icon size={10} />
                            {config.label}
                          </span>
                        );
                      })()}
                      {msg.confidence != null && <ConfidenceBadge confidence={msg.confidence} />}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 dark:bg-cyan-600 text-white rounded-tr-md"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-tl-md shadow-sm"
                  }`}>
                    {msg.content.split("\n").map((line, i) => {
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

                  {/* Source Panel */}
                  {msg.sources && msg.sources.length > 0 && (
                    <SourcePanel sources={msg.sources} />
                  )}

                  {/* Alternative Answer */}
                  {msg.role === "assistant" && msg.alternative_answer && msg.id !== "welcome" && (
                    <AlternativeAnswer text={msg.alternative_answer} />
                  )}

                  {/* Action Buttons */}
                  {msg.role === "assistant" && msg.id !== "welcome" && (
                    <div className="mt-2 flex items-center gap-2">
                      {!msg.simplified && (
                        <SimplifyButton
                          messageId={msg.id}
                          text={msg.content}
                          onSimplified={(simplified) => {
                            setMessages((prev) =>
                              prev.map((m) => m.id === msg.id ? { ...m, simplified } : m)
                            );
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Simplified Version */}
                  {msg.simplified && (
                    <div className="mt-2 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb size={11} className="text-amber-600 dark:text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Plain English</span>
                      </div>
                      <p className="text-[12px] text-amber-800 dark:text-amber-200/80 leading-relaxed">{msg.simplified}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-indigo-600 dark:text-cyan-400" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    {typingStage && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium ml-1">
                        {typingStage}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Suggested Questions
              </p>
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

          {/* Input */}
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
