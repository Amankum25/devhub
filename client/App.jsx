import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from 'react-toastify';
import Navigation from "./components/Navigation";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Placeholder pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Practice from "./pages/Practice";
import InterviewPage from "./pages/InterviewPage";
import AITools from "./pages/AITools";
import AIHistory from "./pages/AIHistory";
import CodeExplain from "./pages/CodeExplain";
import ResumeReview from "./pages/ResumeReview";
import ProjectSuggest from "./pages/ProjectSuggest";
import BugFixer from "./pages/BugFixer";
import AlgorithmHelper from "./pages/AlgorithmHelper";
import CodeGenerator from "./pages/CodeGenerator";
import Chat from "./pages/Chat";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";

// Route protection
import ProtectedRoute from "./components/ProtectedRoute";

// Admin components
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminComments from "./pages/admin/AdminComments";
import AdminChat from "./pages/admin/AdminChat";
import AdminAILogs from "./pages/admin/AdminAILogs";
import AdminOAuth from "./pages/admin/AdminOAuth";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => {
  // Ensure the title is always set correctly
  useEffect(() => {
    document.title = "DevHub - AI-Powered Developer Platform";
    // Force dark mode permanently
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Main User Pages */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

              {/* Practice - LeetCode Problems */}
              <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />

              {/* AI Interview */}
              <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />

              {/* AI Tools */}
              <Route path="/ai-tools" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
              <Route path="/ai" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
              <Route path="/ai/history" element={<ProtectedRoute><AIHistory /></ProtectedRoute>} />
              <Route path="/ai/code-explain" element={<ProtectedRoute><CodeExplain /></ProtectedRoute>} />
              <Route path="/ai/resume-review" element={<ProtectedRoute><ResumeReview /></ProtectedRoute>} />
              <Route path="/ai/project-suggest" element={<ProtectedRoute><ProjectSuggest /></ProtectedRoute>} />
              <Route path="/ai/bug-fixer" element={<ProtectedRoute><BugFixer /></ProtectedRoute>} />
              <Route path="/ai/algorithm-helper" element={<ProtectedRoute><AlgorithmHelper /></ProtectedRoute>} />
              <Route path="/ai/code-generator" element={<ProtectedRoute><CodeGenerator /></ProtectedRoute>} />

              {/* Communication */}
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

              {/* Settings */}
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="comments" element={<AdminComments />} />
                <Route path="chat" element={<AdminChat />} />
                <Route path="ai-logs" element={<AdminAILogs />} />
                <Route path="oauth" element={<AdminOAuth />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")).render(<App />);