import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Placeholder pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogNew from "./pages/BlogNew";
import BlogEdit from "./pages/BlogEdit";
import CodeSnippets from "./pages/CodeSnippets";
import AITools from "./pages/AITools";
import CodeExplain from "./pages/CodeExplain";
import ResumeReview from "./pages/ResumeReview";
import ProjectSuggest from "./pages/ProjectSuggest";
import Chat from "./pages/Chat";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";

// Admin components
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminComments from "./pages/admin/AdminComments";
import AdminSnippets from "./pages/admin/AdminSnippets";
import AdminChat from "./pages/admin/AdminChat";
import AdminAILogs from "./pages/admin/AdminAILogs";
import AdminOAuth from "./pages/admin/AdminOAuth";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Main User Pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<UserProfile />} />
            
            {/* Blog & Posts */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/blog/new" element={<BlogNew />} />
            <Route path="/blog/edit/:id" element={<BlogEdit />} />
            
            {/* Code Snippets */}
            <Route path="/code-snippets" element={<CodeSnippets />} />
            
            {/* AI Tools */}
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/ai/code-explain" element={<CodeExplain />} />
            <Route path="/ai/resume-review" element={<ResumeReview />} />
            <Route path="/ai/project-suggest" element={<ProjectSuggest />} />
            
            {/* Communication */}
            <Route path="/chat" element={<Chat />} />
            <Route path="/messages" element={<Messages />} />
            
            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
