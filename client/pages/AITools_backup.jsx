import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Plus,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Settings,
  Trash2,
  Edit,
  Users,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import Navigation from "../components/Navigation";

export default function AITools() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [customTools, setCustomTools] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    type: '',
    config: ''
  });

  useEffect(() => {
    loadCustomTools();
    loadRecentPrompts();
  }, []);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const loadCustomTools = async () => {
    try {
      const response = await api.get('/ai/custom-tools');
      if (response.data && response.data.success) {
        setCustomTools(response.data.tools || []);
      }
    } catch (error) {
      console.error('Error loading custom tools:', error);
      addNotification('Failed to load custom tools', 'error');
    }
  };

  const loadRecentPrompts = async () => {
    try {
      const response = await api.get('/ai/recent-interactions');
      if (response.data && response.data.success) {
        setRecentPrompts(response.data.data.interactions || []);
      }
    } catch (error) {
      console.error('Error loading recent prompts:', error);
      // Fallback to mock data
      setRecentPrompts([
        {
          id: 1,
          tool: 'Code Explainer',
          text: 'Explain this React component',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          tool: 'Resume Review',
          text: 'Review my technical resume',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }
  };

  const addCustomTool = async () => {
    try {
      if (!newTool.name.trim() || !newTool.description.trim() || !newTool.type) {
        addNotification('Please fill in all required fields', 'error');
        return;
      }

      setIsAdding(true);
      const response = await api.post('/ai/custom-tools', newTool);
      
      if (response.data && response.data.success) {
        addNotification('Custom tool added successfully!', 'success');
        setNewTool({ name: '', description: '', type: '', config: '' });
        setIsAddDialogOpen(false);
        loadCustomTools();
      }
    } catch (error) {
      console.error('Error adding custom tool:', error);
      addNotification('Failed to add custom tool', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const checkToolStatus = async (toolId) => {
    try {
      setIsCheckingStatus(true);
      const response = await api.get(`/ai/custom-tools/${toolId}/status`);
      if (response.data && response.data.success) {
        const status = response.data.status;
        addNotification(`Tool status: ${status}`, status === 'active' ? 'success' : 'info');
        loadCustomTools(); // Refresh the tools list
        return status;
      }
    } catch (error) {
      console.error('Error checking tool status:', error);
      addNotification('Failed to check tool status', 'error');
      return 'error';
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const deleteCustomTool = async (toolId) => {
    try {
      const response = await api.delete(`/ai/custom-tools/${toolId}`);
      if (response.data && response.data.success) {
        addNotification('Tool deleted successfully!', 'success');
        loadCustomTools();
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      addNotification('Failed to delete tool', 'error');
    }
  };

  const getToolIcon = (type) => {
    switch (type) {
      case 'code_analysis':
        return <Code className="h-6 w-6 text-blue-400" />;
      case 'text_processing':
        return <FileText className="h-6 w-6 text-green-400" />;
      case 'data_analysis':
        return <Activity className="h-6 w-6 text-purple-400" />;
      case 'automation':
        return <Settings className="h-6 w-6 text-orange-400" />;
      default:
        return <Zap className="h-6 w-6 text-gray-400" />;
    }
  };

  const getToolColor = (type) => {
    switch (type) {
      case 'code_analysis':
        return 'bg-blue-500';
      case 'text_processing':
        return 'bg-green-500';
      case 'data_analysis':
        return 'bg-purple-500';
      case 'automation':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Tools</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Supercharge your development workflow with our collection of AI-powered tools
          </p>
        </div>

        {/* Statistics and Add Tool Button */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">12.5K</p>
                <p className="text-gray-400">Tools Used</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">3.2K</p>
                <p className="text-gray-400">Active Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">98%</p>
                <p className="text-gray-400">Satisfaction</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full h-full flex flex-col items-center justify-center text-center hover:bg-white/10 transition-all duration-300 rounded-xl"
            >
              <Plus className="h-8 w-8 text-blue-400 mb-2" />
              <p className="text-white font-semibold">Add Custom Tool</p>
              <p className="text-gray-400 text-sm">Create your own</p>
            </button>
          </div>
        </div>

        {/* Custom Tools Section */}
        {customTools.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Settings className="h-6 w-6 mr-2 text-purple-400" />
              Your Custom Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customTools.map((tool) => (
                <div
                  key={tool.id}
                  className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-3 ${getToolColor(tool.type)}/20 rounded-xl`}>
                        {getToolIcon(tool.type)}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold text-white">{tool.name}</h3>
                        <div className="flex items-center mt-1">
                          {getStatusIcon(tool.status)}
                          <span className="ml-2 text-sm text-gray-400 capitalize">{tool.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => checkToolStatus(tool.id)}
                        className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                        disabled={isCheckingStatus}
                      >
                        <RefreshCw className={`h-4 w-4 text-blue-400 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => deleteCustomTool(tool.id)}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{tool.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                      {tool.type}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Created {new Date(tool.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Tools Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Zap className="h-6 w-6 mr-2 text-blue-400" />
            Built-in AI Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiTools.map((tool, index) => (
              <div
                key={tool.id}
                className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
              >
                {tool.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    Popular
                  </div>
                )}
                
                <div className="flex items-center mb-4">
                  <div className={`p-3 ${tool.color}/20 rounded-xl`}>
                    <tool.icon className={`h-6 w-6 text-${tool.color.split('-')[1]}-400`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-semibold text-white">{tool.title}</h3>
                    <p className="text-gray-400 text-sm">{tool.usageCount} uses</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{tool.description}</p>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => navigate(tool.href)}
                  className={`w-full bg-gradient-to-r ${tool.gradient} text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2`}
                >
                  <span>Try Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Prompts */}
        {recentPrompts.length > 0 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-blue-400" />
              Recent Activity
            </h2>
            <div className="grid gap-4">
              {recentPrompts.slice(0, 5).map((prompt, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{prompt.tool}</p>
                      <p className="text-gray-400 text-sm truncate max-w-md">{prompt.text}</p>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(prompt.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-lg border ${
                  notification.type === 'success'
                    ? 'bg-green-500/20 border-green-500/30 text-green-400'
                    : notification.type === 'error'
                    ? 'bg-red-500/20 border-red-500/30 text-red-400'
                    : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                } transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <span>{notification.message}</span>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="ml-3 text-gray-400 hover:text-white"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Tool Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-lg border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add Custom Tool</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new custom AI tool for your workflow
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tool Name
              </label>
              <input
                type="text"
                value={newTool.name}
                onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter tool name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newTool.description}
                onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                rows="3"
                placeholder="Describe what this tool does"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tool Type
              </label>
              <Select
                value={newTool.type}
                onValueChange={(value) => setNewTool(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-full bg-white/5 border border-white/10 text-white">
                  <SelectValue placeholder="Select tool type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-white/10">
                  <SelectItem value="code_analysis">Code Analysis</SelectItem>
                  <SelectItem value="text_processing">Text Processing</SelectItem>
                  <SelectItem value="data_analysis">Data Analysis</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Configuration (JSON)
              </label>
              <textarea
                value={newTool.config}
                onChange={(e) => setNewTool(prev => ({ ...prev, config: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
                rows="4"
                placeholder='{"endpoint": "/api/custom", "method": "POST"}'
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => setIsAddDialogOpen(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addCustomTool}
              disabled={isAdding || !newTool.name || !newTool.description || !newTool.type}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isAdding && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>{isAdding ? 'Adding...' : 'Add Tool'}</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
