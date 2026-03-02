import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Code,
  MessageSquare,
  Zap,
  ArrowRight,
  Terminal,
  Brain,
  Users,
  BookOpen,
  Target,
  ChevronRight,
  Shield,
  Cpu,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Tools",
    description:
      "Code explainer, bug fixer, resume reviewer, project suggestions powered by Groq LLM.",
    accent: "#3BD671",
  },
  {
    icon: Terminal,
    title: "Code Snippets",
    description:
      "Save, discover and share useful code snippets with syntax highlighting across any language.",
    accent: "#60A5FA",
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description:
      "Topic-specific chat rooms for developers. Connect instantly via WebSockets.",
    accent: "#A78BFA",
  },
  {
    icon: Target,
    title: "DSA Practice",
    description:
      "LeetCode-style problem sets with difficulty filtering and progress tracking.",
    accent: "#FB923C",
  },
  {
    icon: Users,
    title: "Developer Community",
    description:
      "Profiles, direct messages and a feed to share knowledge with the broader dev community.",
    accent: "#F472B6",
  },
  {
    icon: BookOpen,
    title: "Blog & Posts",
    description:
      "Write and read technical articles. Stay up-to-date with content from fellow engineers.",
    accent: "#34D399",
  },
];

const stats = [
  { value: "10+", label: "AI Tools" },
  { value: "500+", label: "Practice Problems" },
  { value: "Real-time", label: "Chat Engine" },
  { value: "Free", label: "Always" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-[#0B0E1A] text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#3BD671 1px, transparent 1px), linear-gradient(to right, #3BD671 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#3BD671]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-blue-500/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto max-w-5xl relative">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3BD671]/30 bg-[#3BD671]/10 text-[#3BD671] text-xs font-semibold uppercase tracking-wider">
              <Cpu className="h-3 w-3" /> AI-Powered Developer Platform
            </span>
          </div>

          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            The platform built{" "}
            <span className="text-[#3BD671]">for developers</span>
            <br className="hidden sm:block" /> who ship fast
          </h1>

          <p className="text-center text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            DevHub combines AI tools, real-time chat, code snippets and DSA
            practice into one clean, dark workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button className="btn-gradient text-[#0B0E1A] font-bold px-8 py-3 h-12 text-base rounded-lg shadow-[0_0_20px_rgba(59,214,113,0.35)] hover:shadow-[0_0_30px_rgba(59,214,113,0.55)] transition-shadow">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/ai-tools">
              <Button
                variant="outline"
                className="px-8 py-3 h-12 text-base rounded-lg border-[#252B40] text-slate-300 hover:text-white hover:border-[#3BD671]/40 hover:bg-[#3BD671]/5"
              >
                Explore AI Tools <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Terminal preview */}
          <div className="mt-16 rounded-xl border border-[#252B40] bg-[#0E1120] overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#252B40] bg-[#141829]">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-[#3BD671]/70" />
              <span className="ml-3 text-xs text-slate-500 font-mono">
                devhub-ai ~ code-explainer
              </span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed">
              <p className="text-slate-500">
                &gt; <span className="text-[#3BD671]">explain</span>{" "}
                <span className="text-slate-300">this async/await pattern</span>
              </p>
              <div className="mt-4 space-y-1 text-slate-300">
                <p><span className="text-blue-400">const</span> <span className="text-yellow-300">fetchData</span> = <span className="text-blue-400">async</span> () =&gt; {'{'}</p>
                <p className="pl-4"><span className="text-blue-400">const</span> res = <span className="text-blue-400">await</span> <span className="text-yellow-300">fetch</span>(url);</p>
                <p className="pl-4"><span className="text-blue-400">return</span> res.<span className="text-yellow-300">json</span>();</p>
                <p>{'}'}</p>
              </div>
              <div className="mt-4 border-t border-[#252B40] pt-4">
                <p className="text-slate-500 text-xs mb-2">AI Response:</p>
                <p className="text-[#3BD671] text-xs">
                  This is an async arrow function that fetches JSON data. The `await` keyword pauses execution until the Promise resolves, making async code read like synchronous code...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-[#252B40] bg-[#0E1120]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-[#3BD671]">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything a developer needs
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From AI assistance to community all in one place, built with performance and simplicity in mind.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group p-6 rounded-xl border border-[#252B40] bg-[#0E1120] hover:bg-[#141829] transition-all duration-200 cursor-default"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: f.accent + "20", border: "1px solid " + f.accent + "30" }}
                  >
                    <Icon className="h-5 w-5" style={{ color: f.accent }} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="rounded-2xl border border-[#3BD671]/20 bg-[#0E1120] p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3BD671]/5 to-transparent pointer-events-none" />
            <Shield className="h-10 w-10 text-[#3BD671] mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Start building today free</h2>
            <p className="text-slate-400 mb-8">
              Join developers already using DevHub to write better code, prepare for interviews and connect with the community.
            </p>
            <Link to="/register">
              <Button className="btn-gradient text-[#0B0E1A] font-bold px-10 py-3 h-12 text-base rounded-lg">
                Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#252B40] py-8 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#3BD671] rounded-md flex items-center justify-center">
              <Terminal className="h-4 w-4 text-[#0B0E1A]" />
            </div>
            <span className="font-bold text-white text-sm">Dev<span className="text-[#3BD671]">Hub</span></span>
          </div>
          <p className="text-slate-600 text-xs">
            {new Date().getFullYear()} DevHub. Built for developers.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/login" className="hover:text-[#3BD671] transition-colors">Login</Link>
            <Link to="/register" className="hover:text-[#3BD671] transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}