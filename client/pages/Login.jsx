import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from '../lib/api';
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { toast } from 'react-toastify';
import {
  Eye,
  EyeOff,
  LogIn,
  Github,
  Mail,
  Lock,
  ArrowLeft,
} from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // Removed useToast, using react-toastify's toast
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      }, false); // Don't include auth token for login

      if (response.token) {
        toast.success("🎉 Login Successful! Welcome back to DevHub!");

        // Use auth context to store authentication data
        login(response.user, response.token, response.refreshToken);

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        const errorMessage = response.error?.message || response.message || "Login failed. Please try again.";
        setError(errorMessage);
        toast.error(`Login failed: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Network error. Please check your connection and try again.";

      if (err.message.includes("Invalid email or password")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (err.message.includes("Server error")) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (authData) => {
    // Google authentication successful - update AuthContext state
    login(authData.user, authData.token, authData.refreshToken);
    navigate("/dashboard");
  };

  const handleGoogleError = (error) => {
    console.error("Google authentication error:", error);
    setError("Google authentication failed. Please try again.");
  };

  const handleGithubLogin = () => {
    toast.info("GitHub Login Coming Soon! 🚀", {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0E1A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#3BD671]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-4 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-slate-500 hover:text-[#3BD671] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-[#3BD671] rounded-lg flex items-center justify-center">
              <LogIn className="h-5 w-5 text-[#0B0E1A]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your DevHub account</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[#252B40] bg-[#0E1120] p-6 shadow-xl shadow-black/30 space-y-5">
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
              <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-400 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-[#141829] border-[#252B40] text-white placeholder:text-slate-600 focus:border-[#3BD671]/50 focus:ring-[#3BD671]/20 h-11"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-400 text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-[#141829] border-[#252B40] text-white placeholder:text-slate-600 focus:border-[#3BD671]/50 focus:ring-[#3BD671]/20 h-11"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-gradient text-[#0B0E1A] font-bold h-11 rounded-lg text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0B0E1A] border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#252B40]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0E1120] px-3 text-slate-600">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={isLoading}
            />
            <Button
              variant="outline"
              className="w-full bg-[#141829] hover:bg-[#1E2438] text-slate-300 border-[#252B40] h-11 text-sm"
              onClick={handleGithubLogin}
              disabled={isLoading}
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#3BD671] hover:text-[#3BD671]/80 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
