import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bot, 
  Code, 
  FileText, 
  MessageCircle, 
  Wrench, 
  Zap, 
  Clock,
  Brain,
  Lightbulb,
  Target,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

const AITools = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [recentPrompts, setRecentPrompts] = useState([
    {
      id: 1,
      tool: "Code Explainer",
      text: "Explain this React useEffect hook...",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: "completed",
    },
    {
      id: 2,
      tool: "Resume Review",
      text: "Review my software engineer resume",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
    },
    {
      id: 3,
      tool: "Project Suggestions",
      text: "Suggest projects for React and Node.js",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
    },
  ]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleNavigateToTool = (path) => {
    addNotification(`Opening ${path}...`, 'info');
    navigate(path);
  };

  const aiTools = [
    {
      id: "code-explain",
      title: "Code Explainer",
      description: "Get AI-powered explanations for any code snippet in multiple programming languages",
      icon: Code,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
      path: "/ai/code-explain",
      features: [
        "Multi-language support",
        "Line-by-line breakdown",
        "Best practices tips",
      ],
      popular: true,
      usageCount: 1245,
      category: "Development"
    },
    {
      id: "resume-review",
      title: "Resume Review",
      description: "Get intelligent feedback and suggestions to improve your technical resume",
      icon: FileText,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
      path: "/ai/resume-review",
      features: [
        "ATS optimization",
        "Industry-specific tips",
        "Skill gap analysis",
      ],
      popular: false,
      usageCount: 892,
      category: "Career"
    },
    {
      id: "bug-fixer",
      title: "Bug Fixer",
      description: "Analyze your code and get AI-powered solutions for common programming issues",
      icon: Wrench,
      color: "bg-red-500",
      gradient: "from-red-500 to-red-600",
      path: "/ai/bug-fixer",
      features: [
        "Error detection",
        "Solution suggestions",
        "Code optimization",
      ],
      popular: true,
      usageCount: 756,
      category: "Development"
    },
    {
      id: "project-suggest",
      title: "Project Suggestions",
      description: "Get personalized project ideas based on your skills and interests",
      icon: Lightbulb,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
      path: "/ai/project-suggest",
      features: [
        "Skill-based matching",
        "Difficulty levels",
        "Resource recommendations",
      ],
      popular: false,
      usageCount: 634,
      category: "Planning"
    },
    {
      id: "code-generator",
      title: "Code Generator",
      description: "Generate boilerplate code, functions, and components from natural language",
      icon: Zap,
      color: "bg-yellow-500",
      gradient: "from-yellow-500 to-yellow-600",
      path: "/ai/code-generator",
      features: [
        "Natural language input",
        "Multiple frameworks",
        "Clean, readable code",
      ],
      popular: true,
      usageCount: 1089,
      category: "Development"
    },
    {
      id: "algorithm-helper",
      title: "Algorithm Helper",
      description: "Understand complex algorithms with step-by-step explanations and visualizations",
      icon: Target,
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600",
      path: "/ai/algorithm-helper",
      features: [
        "Visual explanations",
        "Time complexity analysis",
        "Practice problems",
      ],
      popular: false,
      usageCount: 445,
      category: "Development"
    },
  ];

  const stats = [
    { label: "Total AI Interactions", value: "5.2K+", icon: Brain },
    { label: "Problems Solved", value: "3.8K+", icon: Wrench },
    { label: "Code Explanations", value: "2.1K+", icon: Code },
    { label: "Success Rate", value: "98.5%", icon: TrendingUp },
  ];

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-[#0B0E1A] pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#3BD671]/15 border border-[#3BD671]/25 flex items-center justify-center">
              <Brain className="h-5 w-5 text-[#3BD671]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Tools</h1>
              <p className="text-slate-500 text-sm">Powered by Groq LLM — fast, smart, free</p>
            </div>
          </div>
        </div>

        {/* Tool Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            const colorMap = {
              "bg-blue-500": "#60A5FA",
              "bg-green-500": "#3BD671",
              "bg-red-500": "#F87171",
              "bg-purple-500": "#A78BFA",
              "bg-yellow-500": "#FBBF24",
              "bg-indigo-500": "#818CF8",
            };
            const accent = colorMap[tool.color] || "#3BD671";
            return (
              <div
                key={tool.id}
                className="group rounded-xl border border-[#252B40] bg-[#0E1120] hover:bg-[#141829] hover:border-[#252B40] transition-all duration-200 cursor-pointer p-5"
                onClick={() => handleNavigateToTool(tool.path)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: accent + "20", border: "1px solid " + accent + "30" }}
                  >
                    <Icon className="h-5 w-5" style={{ color: accent }} />
                  </div>
                  {tool.popular && (
                    <span className="text-xs bg-[#3BD671]/15 text-[#3BD671] border border-[#3BD671]/25 px-2 py-0.5 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">{tool.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">{tool.description}</p>
                <ul className="space-y-1 mb-4">
                  {tool.features.map((f, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <ChevronRight className="h-3 w-3 text-[#3BD671]/60" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700">{tool.usageCount.toLocaleString()} uses</span>
                  <span className="text-xs text-[#3BD671] group-hover:underline font-medium flex items-center gap-0.5">
                    Open <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent history */}
          <div className="rounded-xl border border-[#252B40] bg-[#0E1120] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-white">Recent Interactions</h2>
            </div>
            <div className="space-y-3">
              {recentPrompts.map((prompt) => (
                <div key={prompt.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#141829] transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3BD671] mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white truncate">{prompt.tool}</p>
                      <span className="text-xs text-slate-600 whitespace-nowrap">{formatTimeAgo(prompt.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{prompt.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/ai/history')}
              className="mt-3 w-full text-xs text-slate-600 hover:text-[#3BD671] transition-colors border border-[#252B40] rounded-lg py-2"
            >
              View all history
            </button>
          </div>

          {/* Quick guide */}
          <div className="rounded-xl border border-[#252B40] bg-[#0E1120] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-[#FBBF24]" />
              <h2 className="text-sm font-semibold text-white">Tips for better results</h2>
            </div>
            <div className="space-y-3">
              {[
                { step: "1", tip: "Be specific", detail: "Mention the language, framework and exact problem" },
                { step: "2", tip: "Provide context", detail: "Include error messages or expected behaviour" },
                { step: "3", tip: "Iterate", detail: "Ask follow-ups to dig deeper into complex topics" },
                { step: "4", tip: "Learn from it", detail: "Use AI answers as learning material, not just quick fixes" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3BD671]/15 text-[#3BD671] text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">{item.tip}</p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-4 w-full btn-gradient text-[#0B0E1A] font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1"
              onClick={() => handleNavigateToTool('/ai/code-explain')}
            >
              <Brain className="h-3.5 w-3.5" /> Start with Code Explainer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITools;