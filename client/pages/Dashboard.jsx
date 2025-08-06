import { useState, useEffect } from "react";
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
  TrendingUp,
  MessageSquare,
  Code,
  Brain,
  FileText,
  Users,
  Calendar,
  Clock,
  Star,
  Activity,
  Plus,
  ChevronRight,
  Zap,
  Target,
  Award,
} from "lucide-react";
import UserSearch from "../components/UserSearch";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    aiCalls: 0,
    messages: 0,
    likes: 0,
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("devhub_user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Simulate loading stats
      setTimeout(() => {
        setStats({
          posts: Math.floor(Math.random() * 20) + 5,
          aiCalls: Math.floor(Math.random() * 50) + 10,
          messages: Math.floor(Math.random() * 100) + 25,
          likes: Math.floor(Math.random() * 200) + 50,
        });
      }, 500);
    }
  }, []);

  const quickActions = [
    {
      title: "Write a Post",
      description: "Share your knowledge with the community",
      icon: FileText,
      href: "/blog/new",
      color: "bg-blue-500",
    },
    {
      title: "Share Code Snippet",
      description: "Upload useful code snippets",
      icon: Code,
      href: "/code-snippets",
      color: "bg-green-500",
    },
    {
      title: "Ask AI Assistant",
      description: "Get help with coding problems",
      icon: Brain,
      href: "/ai-tools",
      color: "bg-purple-500",
    },
    {
      title: "Join Chat",
      description: "Connect with other developers",
      icon: MessageSquare,
      href: "/chat",
      color: "bg-orange-500",
    },
  ];

  const recentActivity = [
    {
      type: "post",
      title: 'Your post "React Best Practices" received 5 new likes',
      time: "2 hours ago",
      icon: Star,
      color: "text-yellow-400",
    },
    {
      type: "comment",
      title: 'New comment on your snippet "useState Hook"',
      time: "4 hours ago",
      icon: MessageSquare,
      color: "text-blue-400",
    },
    {
      type: "ai",
      title: "AI helped you explain a complex algorithm",
      time: "1 day ago",
      icon: Brain,
      color: "text-purple-400",
    },
    {
      type: "achievement",
      title: "You reached 100 total interactions!",
      time: "2 days ago",
      icon: Award,
      color: "text-green-400",
    },
  ];

  const achievements = [
    {
      name: "First Post",
      description: "Published your first blog post",
      completed: true,
    },
    {
      name: "Code Contributor",
      description: "Shared 5 code snippets",
      completed: true,
    },
    {
      name: "AI Explorer",
      description: "Used AI tools 10 times",
      completed: true,
    },
    {
      name: "Community Helper",
      description: "Help 10 developers in chat",
      completed: false,
    },
    {
      name: "Popular Creator",
      description: "Get 100 likes on your content",
      completed: false,
    },
    {
      name: "Daily Streak",
      description: "Login for 7 consecutive days",
      completed: false,
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="w-full max-w-md space-y-6 relative z-10">
          <Card className="w-full backdrop-blur-xl bg-slate-800/50 border-slate-700/50 shadow-xl rounded-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-3xl font-extrabold text-white">Please Log In</CardTitle>
              <CardDescription className="text-lg text-slate-300">
                Log in to view your dashboard and activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <Link to="/login">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-md">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completedAchievements = achievements.filter((a) => a.completed).length;
  const progressPercentage =
    (completedAchievements / achievements.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="w-full max-w-7xl mx-auto space-y-8 relative z-10 pt-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <span className="rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-3 shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </span>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent tracking-tight">
              DevHub <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Dashboard</span>
            </h1>
          </div>
          <p className="mt-4 text-lg text-slate-300">Supercharge your development journey with stats, quick actions, and achievements</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <Card className="backdrop-blur-xl bg-slate-800/50 border-slate-700/50 shadow-xl rounded-2xl hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-white">Posts Published</CardTitle>
              <FileText className="h-6 w-6 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{stats.posts}</div>
              <p className="text-xs text-slate-400 mt-1"><TrendingUp className="h-4 w-4 inline mr-1 text-purple-400" />+2 this week</p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-slate-800/50 border-slate-700/50 shadow-xl rounded-2xl hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-white">AI Interactions</CardTitle>
              <Brain className="h-6 w-6 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{stats.aiCalls}</div>
              <p className="text-xs text-slate-400 mt-1"><TrendingUp className="h-4 w-4 inline mr-1 text-purple-400" />+5 this week</p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-slate-800/50 border-slate-700/50 shadow-xl rounded-2xl hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-white">Messages Sent</CardTitle>
              <MessageSquare className="h-6 w-6 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{stats.messages}</div>
              <p className="text-xs text-slate-400 mt-1"><TrendingUp className="h-4 w-4 inline mr-1 text-purple-400" />+12 this week</p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-slate-800/50 border-slate-700/50 shadow-xl rounded-2xl hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-white">Total Likes</CardTitle>
              <Star className="h-6 w-6 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{stats.likes}</div>
              <p className="text-xs text-slate-400 mt-1"><TrendingUp className="h-4 w-4 inline mr-1 text-purple-400" />+8 this week</p>
            </CardContent>
          </Card>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.href}>
                <Card className="backdrop-blur-xl bg-slate-800/50 border-slate-700/50 shadow-xl rounded-2xl hover:bg-slate-800/70 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${action.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white">{action.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-slate-500" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        {/* Recent Activity */}
        <div className="mt-10">
          <Card className="backdrop-blur-xl bg-slate-800/50 border-slate-700/50 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold text-white gap-2">
                <Activity className="h-7 w-7 text-purple-400" />Recent Activity
              </CardTitle>
              <CardDescription className="text-slate-400">Your latest interactions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-slate-700/50 transition-colors">
                      <Icon className={`h-6 w-6 mt-0.5 ${activity.color}`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-lg text-white font-semibold">{activity.title}</p>
                        <div className="flex items-center text-xs text-slate-400">
                          <Clock className="h-4 w-4 mr-1 text-purple-400" />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Achievements */}
        <div className="mt-10">
          <Card className="backdrop-blur-xl bg-slate-800/50 border-slate-700/50 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl font-bold text-white gap-2">
                <Award className="h-7 w-7 text-purple-400" />Achievements
              </CardTitle>
              <CardDescription className="text-slate-400">{completedAchievements} of {achievements.length} completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="w-full bg-slate-700/50 rounded-full h-3 mb-3">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                {achievements.slice(0, 4).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${achievement.completed ? "bg-green-500" : "bg-slate-700/50"}`}>
                      {achievement.completed && <Award className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-lg font-bold ${achievement.completed ? "text-white" : "text-slate-500"}`}>{achievement.name}</p>
                      <p className="text-xs text-slate-400">{achievement.description}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full mt-3 text-slate-400 hover:text-white hover:bg-slate-700/50">View All Achievements</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
