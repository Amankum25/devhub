import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Code,
  MessageCircle,
  Activity,
  Key,
  Settings,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AdminNavigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const adminMenuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & Analytics",
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: Users,
      description: "Manage Users",
    },
    {
      path: "/admin/posts",
      label: "Posts",
      icon: FileText,
      description: "Content Management",
    },
    {
      path: "/admin/comments",
      label: "Comments",
      icon: MessageSquare,
      description: "Moderation",
    },
    {
      path: "/admin/snippets",
      label: "Snippets",
      icon: Code,
      description: "Code Management",
    },
    {
      path: "/admin/chat",
      label: "Chat",
      icon: MessageCircle,
      description: "Monitor Chats",
    },
    {
      path: "/admin/ai-logs",
      label: "AI Assistant Logs",
      icon: Activity,
      description: "AI Usage Tracking",
    },
    {
      path: "/admin/oauth",
      label: "OAuth Clients",
      icon: Key,
      description: "Third-party Apps",
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: Settings,
      description: "Global Configuration",
    },
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-slate-300">DevHub Management</p>
          </div>
        </div>

        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent border-slate-600 hover:bg-slate-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Site
          </Button>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {adminMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive(item.path)
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-slate-700",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive(item.path)
                    ? "text-white"
                    : "text-slate-400 group-hover:text-white",
                )}
              />
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div
                  className={cn(
                    "text-xs transition-colors",
                    isActive(item.path)
                      ? "text-blue-100"
                      : "text-slate-500 group-hover:text-slate-300",
                  )}
                >
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 text-center">Admin v1.0.0</div>
      </div>
    </div>
  );
};

export default AdminNavigation;
