import { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";
import {
  BriefcaseBusiness,
  Send,
  ChevronDown,
  Bot,
  User,
  Loader2,
  Trophy,
  TrendingUp,
  TrendingDown,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lightbulb,
  Code2,
  MessageSquare,
} from "lucide-react";

const COMPANIES = [
  "Amazon",
  "Google",
  "Microsoft",
  "Flipkart",
  "Adobe",
  "Goldman Sachs",
];

const COMPANY_COLORS = {
  Amazon: { bg: "#FF9900", text: "#0B0E1A" },
  Google: { bg: "#4285F4", text: "#fff" },
  Microsoft: { bg: "#00A4EF", text: "#fff" },
  Flipkart: { bg: "#2874F0", text: "#fff" },
  Adobe: { bg: "#FF0000", text: "#fff" },
  "Goldman Sachs": { bg: "#6495ED", text: "#fff" },
};

const QUICK_REPLIES = [
  { label: "Hint", value: "hint" },
  { label: "Full Solution", value: "full solution" },
  { label: "Skip Question", value: "skip" },
];

// Strip the ```json ... ``` block from the final AI message
function stripEvalJson(text) {
  return text.replace(/```json[\s\S]*?```/g, "").trim();
}

export default function InterviewPage() {
  const [phase, setPhase] = useState("select"); // select | loading | chat | complete
  const [company, setCompany] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (phase === "chat") inputRef.current?.focus();
  }, [phase]);

  const startInterview = async () => {
    if (!company) return;
    setPhase("loading");
    setError("");
    try {
      const res = await api.post("/interview/start", { company }, false);
      if (!res.success) throw new Error(res.error || "Failed to start");
      setSessionId(res.sessionId);
      setMessages([{ role: "assistant", content: res.message }]);
      setQuestionNumber(res.questionNumber || 1);
      setPhase("chat");
    } catch (err) {
      setError(err.message || "Failed to start interview. Is GROQ_API_KEY set?");
      setPhase("select");
    }
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);

    const userMsg = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await api.post("/interview/chat", { sessionId, userMessage: msg }, false);
      if (!res.success) throw new Error(res.error || "Failed");

      setQuestionNumber(res.questionNumber || questionNumber);

      const aiContent = res.isComplete ? stripEvalJson(res.message) : res.message;
      setMessages((prev) => [...prev, { role: "assistant", content: aiContent }]);

      if (res.isComplete && res.evaluation) {
        setEvaluation(res.evaluation);
        setTimeout(() => setPhase("complete"), 800);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${err.message}. Please try again.` },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const resetInterview = () => {
    setPhase("select");
    setCompany("");
    setSessionId(null);
    setMessages([]);
    setInput("");
    setQuestionNumber(1);
    setEvaluation(null);
    setError("");
  };

  const color = COMPANY_COLORS[company] || { bg: "#3BD671", text: "#0B0E1A" };

  // ── SELECT SCREEN ────────────────────────────────────────────────────────────
  if (phase === "select" || phase === "loading") {
    return (
      <div className="min-h-screen bg-[#0B0E1A] pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3BD671]/15 border border-[#3BD671]/25 mb-4">
              <BriefcaseBusiness className="h-7 w-7 text-[#3BD671]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">AI Interview</h1>
            <p className="text-slate-500 text-sm">
              Practice real coding interviews with AI. Get 2 questions, live feedback & a final score.
            </p>
          </div>

          {/* Card */}
          <div className="bg-[#0E1120] border border-[#252B40] rounded-2xl p-6 space-y-5">
            {/* Company Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Company
              </label>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#0B0E1A] border border-[#252B40] rounded-xl text-sm text-left transition-colors hover:border-[#3BD671]/40 focus:outline-none focus:border-[#3BD671]/60"
                >
                  <span className={company ? "text-white font-medium" : "text-slate-500"}>
                    {company || "Choose a company…"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#141829] border border-[#252B40] rounded-xl shadow-xl z-20 overflow-hidden">
                    {COMPANIES.map((c) => {
                      const cc = COMPANY_COLORS[c];
                      return (
                        <button
                          key={c}
                          onClick={() => {
                            setCompany(c);
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-[#252B40] transition-colors"
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cc.bg }}
                          />
                          <span className="text-slate-200">{c}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* How it works */}
            <div className="space-y-2 py-1">
              {[
                { icon: Code2, text: "2 questions auto-selected for your chosen company" },
                { icon: Bot, text: "AI interviewer evaluates each answer in real-time" },
                { icon: Trophy, text: "Final score, strengths & hiring decision at the end" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-500">
                  <Icon className="h-3.5 w-3.5 text-[#3BD671]/60 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={startInterview}
              disabled={!company || phase === "loading"}
              className="w-full btn-gradient text-[#0B0E1A] font-bold py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {phase === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting Interview…
                </>
              ) : (
                <>
                  <BriefcaseBusiness className="h-4 w-4" />
                  Start Interview
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETE SCREEN ──────────────────────────────────────────────────────────
  if (phase === "complete" && evaluation) {
    const score = evaluation.score || 0;
    const hired = evaluation.decision?.toLowerCase().includes("hire") && !evaluation.decision?.toLowerCase().includes("no hire");
    const scoreColor = score >= 7 ? "#3BD671" : score >= 5 ? "#FBBF24" : "#F87171";

    return (
      <div className="min-h-screen bg-[#0B0E1A] pt-20 pb-12 px-4">
        <div className="max-w-xl mx-auto space-y-5">
          {/* Score card */}
          <div className="bg-[#0E1120] border border-[#252B40] rounded-2xl p-6 text-center">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 mb-4 text-2xl font-bold"
              style={{
                borderColor: scoreColor,
                color: scoreColor,
                backgroundColor: scoreColor + "15",
              }}
            >
              {score}/10
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Interview Complete</h2>
            <p className="text-sm text-slate-500 mb-4">
              {company} — Technical Interview
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border"
              style={{
                backgroundColor: (hired ? "#3BD671" : "#F87171") + "15",
                borderColor: (hired ? "#3BD671" : "#F87171") + "40",
                color: hired ? "#3BD671" : "#F87171",
              }}
            >
              {hired ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {evaluation.decision}
            </div>
          </div>

          {/* Strengths */}
          {evaluation.strengths?.length > 0 && (
            <div className="bg-[#0E1120] border border-[#252B40] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-[#3BD671]" />
                <h3 className="text-sm font-semibold text-white">Strengths</h3>
              </div>
              <ul className="space-y-1.5">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3BD671] mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {evaluation.weaknesses?.length > 0 && (
            <div className="bg-[#0E1120] border border-[#252B40] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4 text-[#F87171]" />
                <h3 className="text-sm font-semibold text-white">Areas to Improve</h3>
              </div>
              <ul className="space-y-1.5">
                {evaluation.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F87171] mt-1.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Topics to study */}
          {evaluation.topics?.length > 0 && (
            <div className="bg-[#0E1120] border border-[#252B40] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-[#FBBF24]" />
                <h3 className="text-sm font-semibold text-white">Topics to Study</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {evaluation.topics.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/25 text-[#FBBF24]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={resetInterview}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#3BD671] border border-[#3BD671]/30 rounded-xl hover:bg-[#3BD671]/10 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Start a New Interview
          </button>
        </div>
      </div>
    );
  }

  // ── CHAT SCREEN ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B0E1A] flex flex-col pt-16">
      {/* Top bar */}
      <div className="border-b border-[#252B40] bg-[#0E1120] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: color.bg + "25", border: `1px solid ${color.bg}40`, color: color.bg }}
          >
            {company[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{company} Interview</p>
            <p className="text-xs text-slate-500">Technical Round · 2 Questions</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="flex items-center gap-1"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                    n < questionNumber
                      ? "bg-[#3BD671] border-[#3BD671] text-[#0B0E1A]"
                      : n === questionNumber
                      ? "border-[#3BD671] text-[#3BD671] bg-[#3BD671]/10"
                      : "border-[#252B40] text-slate-600"
                  }`}
                >
                  {n < questionNumber ? <CheckCircle2 className="h-3 w-3" /> : n}
                </div>
                {n < 2 && <div className={`w-6 h-px ${n < questionNumber ? "bg-[#3BD671]" : "bg-[#252B40]"}`} />}
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-500 sm:hidden">Q{questionNumber}/2</span>
          <button
            onClick={resetInterview}
            className="text-xs text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1 border border-[#252B40] rounded-lg px-2 py-1"
          >
            <RotateCcw className="h-3 w-3" /> End
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-[#3BD671]/15 border border-[#3BD671]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-[#3BD671]" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#3BD671]/15 border border-[#3BD671]/20 text-white rounded-tr-sm"
                  : "bg-[#0E1120] border border-[#252B40] text-slate-300 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-[#252B40] flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-[#3BD671]/15 border border-[#3BD671]/25 flex items-center justify-center flex-shrink-0">
              <Bot className="h-3.5 w-3.5 text-[#3BD671]" />
            </div>
            <div className="bg-[#0E1120] border border-[#252B40] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-[#3BD671]/60 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-[#3BD671]/60 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-[#3BD671]/60 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <div className="border-t border-[#252B40]/50 bg-[#0B0E1A] px-4 pt-2 pb-1 max-w-3xl mx-auto w-full">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_REPLIES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => sendMessage(value)}
              disabled={sending}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-[#252B40] text-slate-500 hover:text-[#3BD671] hover:border-[#3BD671]/40 transition-colors disabled:opacity-40"
            >
              {label}
            </button>
          ))}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <Lightbulb className="h-3 w-3 text-slate-700" />
            <span className="text-xs text-slate-700">Type your solution or use quick actions</span>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[#252B40] bg-[#0E1120] px-4 py-3 max-w-3xl mx-auto w-full">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your answer, approach, or code… (Enter to send, Shift+Enter for newline)"
            rows={2}
            disabled={sending}
            className="flex-1 bg-[#0B0E1A] border border-[#252B40] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:border-[#3BD671]/50 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || sending}
            className="w-10 h-10 self-end flex-shrink-0 rounded-xl btn-gradient text-[#0B0E1A] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-700 mt-1.5 pl-1">
          <MessageSquare className="inline h-3 w-3 mr-1" />
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
