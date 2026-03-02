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
  Briefcase,
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
      title: "AI Interview",
      description: "Practice with real company questions",
      icon: Briefcase,
      href: "/interview",
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
      <div className="min-h-screen bg-[#0B0E1A] flex items-center justify-center p-4">
        <div className="rounded-xl border border-[#252B40] bg-[#0E1120] p-8 max-w-sm w-full text-center shadow-xl shadow-black/30">
          <Activity className="h-10 w-10 text-[#3BD671] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in required</h2>
          <p className="text-slate-500 text-sm mb-6">Log in to view your dashboard and activity.</p>
          <Link to="/login">
            <Button className="btn-gradient text-[#0B0E1A] font-bold w-full h-10">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedAchievements = achievements.filter((a) => a.completed).length;
  const progressPercentage = (completedAchievements / achievements.length) * 100;

  return (
    <div className="min-h-screen bg-[#0B0E1A] pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good to see you, <span className="text-[#3BD671]">{user.firstName}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Here's what's happening on your DevHub</p>
          </div>
          <Link to="/profile">
            <Button variant="outline" className="border-[#252B40] text-slate-300 hover:text-white hover:border-[#3BD671]/40 text-sm">
              View Profile
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Posts Published", value: stats.posts, icon: FileText, color: "#60A5FA", trend: "+2 this week" },
            { label: "AI Interactions", value: stats.aiCalls, icon: Brain, color: "#3BD671", trend: "+5 this week" },
            { label: "Messages Sent", value: stats.messages, icon: MessageSquare, color: "#A78BFA", trend: "+12 this week" },
            { label: "Total Likes", value: stats.likes, icon: Star, color: "#FB923C", trend: "+8 this week" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border border-[#252B40] bg-[#0E1120] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs">{stat.label}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "20" }}>
                    <Icon className="h-4 w-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-[#3BD671]" /> {stat.trend}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.href}>
                    <div className="rounded-xl border border-[#252B40] bg-[#0E1120] p-4 hover:bg-[#141829] hover:border-[#3BD671]/20 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm">{action.title}</h3>
                          <p className="text-xs text-slate-500 truncate">{action.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-[#3BD671] transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="mt-2">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h2>
              <div className="rounded-xl border border-[#252B40] bg-[#0E1120] divide-y divide-[#252B40]">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-4 hover:bg-[#141829] transition-colors">
                      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${activity.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 leading-snug">{activity.title}</p>
                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Achievements</h2>
            <div className="rounded-xl border border-[#252B40] bg-[#0E1120] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white font-semibold">{completedAchievements}/{achievements.length} completed</p>
                <Award className="h-4 w-4 text-[#3BD671]" />
              </div>
              <div className="w-full bg-[#252B40] rounded-full h-2 mb-4">
                <div
                  className="bg-[#3BD671] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${achievement.completed ? "bg-[#3BD671]" : "bg-[#252B40]"}`}>
                      {achievement.completed && <Award className="h-3 w-3 text-[#0B0E1A]" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${achievement.completed ? "text-white" : "text-slate-600"}`}>{achievement.name}</p>
                      <p className="text-xs text-slate-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Search */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Find Developers</h2>
              <div className="rounded-xl border border-[#252B40] bg-[#0E1120] p-4">
                <UserSearch />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
