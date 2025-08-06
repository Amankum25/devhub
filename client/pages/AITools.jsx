import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  TrendingUp,
  Star,
  ChevronRight,
  Sparkles
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <Alert 
              key={notification.id}
              className={`w-80 animate-in slide-in-from-right duration-300 backdrop-blur-lg bg-slate-800/80 border-slate-700/50 text-white ${
                notification.type === 'success' ? 'border-green-500/50' :
                notification.type === 'error' ? 'border-red-500/50' :
                'border-blue-500/50'
              }`}
            >
              <AlertDescription className="text-sm font-medium text-slate-200">
                {notification.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-2xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            AI-Powered Developer Tools
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Supercharge your development workflow with intelligent AI assistants
            designed specifically for developers
          </p>
          <Badge variant="secondary" className="text-sm bg-slate-800/50 text-slate-200 border-slate-700">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by Advanced AI Models
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Icon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Built-in AI Tools Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Bot className="h-6 w-6 mr-2 text-purple-400" />
            Available AI Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50"
                  onClick={() => handleNavigateToTool(tool.path)}
                >
                  {tool.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-yellow-500/90 text-yellow-900">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                  />

                  <CardHeader className="relative">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${tool.color} mb-4 shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-white">{tool.title}</CardTitle>
                    <CardDescription className="text-sm text-slate-400">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-400">
                        Key Features:
                      </p>
                      <ul className="space-y-1">
                        {tool.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-xs text-slate-400 flex items-center"
                          >
                            <ChevronRight className="h-3 w-3 mr-1 text-purple-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-slate-500">
                        {tool.usageCount} uses this month
                      </div>
                      <Button
                        size="sm"
                        className="group-hover:scale-105 transition-transform bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToTool(tool.path);
                        }}
                      >
                        Try Now
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Clock className="h-5 w-5 mr-2" />
                Recent AI Interactions
              </CardTitle>
              <CardDescription className="text-slate-400">Your latest AI assistant usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{prompt.tool}</p>
                        <span className="text-xs text-slate-400">
                          {formatTimeAgo(prompt.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {prompt.text}
                      </p>
                      <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                        {prompt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700/50" onClick={() => navigate('/ai/history')}>
                View All History
              </Button>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Zap className="h-5 w-5 mr-2" />
                Quick Start Guide
              </CardTitle>
              <CardDescription className="text-slate-400">Get the most out of AI tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Choose Your Tool</p>
                    <p className="text-xs text-slate-400">
                      Select the AI tool that matches your current need
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Provide Clear Input</p>
                    <p className="text-xs text-slate-400">
                      Be specific about what you want the AI to help with
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Get Instant Results</p>
                    <p className="text-xs text-slate-400">
                      Receive AI-powered suggestions and explanations
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Apply & Learn</p>
                    <p className="text-xs text-slate-400">
                      Use the insights to improve your development skills
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => handleNavigateToTool('/ai/code-explain')}
              >
                <Brain className="h-4 w-4 mr-2" />
                Start with Code Explainer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pro Tips */}
        <Card className="mt-8 bg-slate-800/30 backdrop-blur-xl border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Pro Tips for Better AI Interactions
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>
                    • Be specific about the programming language and framework
                    you're using
                  </li>
                  <li>
                    • Include relevant context like error messages or expected
                    behavior
                  </li>
                  <li>
                    • Ask follow-up questions to dive deeper into complex topics
                  </li>
                  <li>
                    • Use the AI suggestions as learning opportunities, not just
                    quick fixes
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AITools;