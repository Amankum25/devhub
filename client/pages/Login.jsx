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
    // Google authentication successful
    // User data and token are already stored by GoogleLoginButton
    navigate("/dashboard");
  };

  const handleGoogleError = (error) => {
    console.error("Google authentication error:", error);
    setError("Google authentication failed. Please try again.");
  };

  const handleGithubLogin = () => {
    toast({
      title: "GitHub OAuth",
      description: "GitHub authentication would be implemented here.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>

          {/* Login Card */}
          <Card className="w-full bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                <LogIn className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-slate-300">
                Sign in to your DevHub account to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-border"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={isLoading}
              />
              <Button
                variant="outline"
                onClick={handleGithubLogin}
                disabled={isLoading}
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo:</strong> Use any valid email and password (6+ chars)
              to login
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
