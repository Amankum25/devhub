import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Code,
  FileText,
  Wrench,
  Lightbulb,
  Zap,
  Clock,
  TrendingUp,
  Star,
  ChevronRight,
  Sparkles,
  Target,
  Bot,
} from "lucide-react";

export default function AITools() {
  const [recentPrompts, setRecentPrompts] = useState([
    {
      id: 1,
      tool: "Code Explainer",
      prompt: "Explain this React useEffect hook...",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      tool: "Resume Review",
      prompt: "Review my software engineer resume",
      time: "1 day ago",
      status: "completed",
    },
    {
      id: 3,
      tool: "Project Suggestions",
      prompt: "Suggest projects for React and Node.js",
      time: "2 days ago",
      status: "completed",
    },
  ]);

  const aiTools = [
    {
      id: "code-explain",
      title: "Code Explainer",
      description:
        "Get AI-powered explanations for any code snippet in multiple programming languages",
      icon: Code,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
      href: "/ai/code-explain",
      features: [
        "Multi-language support",
        "Line-by-line breakdown",
        "Best practices tips",
      ],
      popular: true,
      usageCount: 1245,
    },
    {
      id: "resume-review",
      title: "Resume Review",
      description:
        "Get intelligent feedback and suggestions to improve your technical resume",
      icon: FileText,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
      href: "/ai/resume-review",
      features: [
        "ATS optimization",
        "Industry-specific tips",
        "Skill gap analysis",
      ],
      popular: false,
      usageCount: 892,
    },
    {
      id: "bug-fixer",
      title: "Bug Fixer",
      description:
        "Analyze your code and get AI-powered solutions for common programming issues",
      icon: Wrench,
      color: "bg-red-500",
      gradient: "from-red-500 to-red-600",
      href: "/ai/bug-fixer",
      features: [
        "Error detection",
        "Solution suggestions",
        "Code optimization",
      ],
      popular: true,
      usageCount: 756,
    },
    {
      id: "project-suggest",
      title: "Project Suggestions",
      description:
        "Get personalized project ideas based on your skills and interests",
      icon: Lightbulb,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
      href: "/ai/project-suggest",
      features: [
        "Skill-based matching",
        "Difficulty levels",
        "Resource recommendations",
      ],
      popular: false,
      usageCount: 634,
    },
    {
      id: "code-generator",
      title: "Code Generator",
      description:
        "Generate boilerplate code, functions, and components from natural language",
      icon: Zap,
      color: "bg-yellow-500",
      gradient: "from-yellow-500 to-yellow-600",
      href: "/ai/code-generator",
      features: [
        "Natural language input",
        "Multiple frameworks",
        "Clean, readable code",
      ],
      popular: true,
      usageCount: 1089,
    },
    {
      id: "algorithm-helper",
      title: "Algorithm Helper",
      description:
        "Understand complex algorithms with step-by-step explanations and visualizations",
      icon: Target,
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600",
      href: "/ai/algorithm-helper",
      features: [
        "Visual explanations",
        "Time complexity analysis",
        "Practice problems",
      ],
      popular: false,
      usageCount: 445,
    },
  ];

  const stats = [
    { label: "Total AI Interactions", value: "5.2K+", icon: Brain },
    { label: "Problems Solved", value: "3.8K+", icon: Wrench },
    { label: "Code Explanations", value: "2.1K+", icon: Code },
    { label: "Success Rate", value: "98.5%", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            AI-Powered Developer Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Supercharge your development workflow with intelligent AI assistants
            designed specifically for developers
          </p>
          <Badge variant="secondary" className="text-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by Advanced AI Models
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Tools Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <Bot className="h-6 w-6 mr-2" />
            Available AI Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {tool.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-yellow-500 text-yellow-900">
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
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${tool.color} mb-4`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Key Features:
                      </p>
                      <ul className="space-y-1">
                        {tool.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-xs text-muted-foreground flex items-center"
                          >
                            <ChevronRight className="h-3 w-3 mr-1 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-muted-foreground">
                        {tool.usageCount} uses this month
                      </div>
                      <Link to={tool.href}>
                        <Button
                          size="sm"
                          className="group-hover:scale-105 transition-transform"
                        >
                          Try Now
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent AI Interactions
              </CardTitle>
              <CardDescription>Your latest AI assistant usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{prompt.tool}</p>
                        <span className="text-xs text-muted-foreground">
                          {prompt.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {prompt.prompt}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {prompt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All History
              </Button>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>Get the most out of AI tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Choose Your Tool</p>
                    <p className="text-xs text-muted-foreground">
                      Select the AI tool that matches your current need
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Provide Clear Input</p>
                    <p className="text-xs text-muted-foreground">
                      Be specific about what you want the AI to help with
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Get Instant Results</p>
                    <p className="text-xs text-muted-foreground">
                      Receive AI-powered suggestions and explanations
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    <p className="text-sm font-medium">Apply & Learn</p>
                    <p className="text-xs text-muted-foreground">
                      Use the insights to improve your development skills
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/ai/code-explain">
                <Button className="w-full mt-6">
                  <Brain className="h-4 w-4 mr-2" />
                  Start with Code Explainer
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Pro Tips */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Pro Tips for Better AI Interactions
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
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
}
