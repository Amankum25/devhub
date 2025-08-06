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
import { useToast } from "@/hooks/use-toast";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { api } from '../lib/api';
import { toast } from 'react-toastify';
import {
  Eye,
  EyeOff,
  UserPlus,
  Github,
  Mail,
  Lock,
  User,
  ArrowLeft,
  CheckCircle,
  Upload,
} from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    githubProfile: "",
    linkedinProfile: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState(null);
  const { toast } = useToast();
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

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Avatar file size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields");
      toast.error("Please fill in all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    // Check password strength requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match! Please check and try again.");
      return false;
    }

    // Validate URLs if provided
    if (
      formData.githubProfile &&
      !formData.githubProfile.includes("github.com")
    ) {
      setError("Please enter a valid GitHub profile URL");
      return false;
    }

    if (
      formData.linkedinProfile &&
      !formData.linkedinProfile.includes("linkedin.com")
    ) {
      setError("Please enter a valid LinkedIn profile URL");
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
      const response = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        username: formData.username || undefined,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
        company: formData.company || undefined,
        position: formData.position || undefined,
        github: formData.githubProfile || undefined,
        linkedin: formData.linkedinProfile || undefined,
        twitter: formData.twitterProfile || undefined,
      }, false); // Don't include auth token for registration

      if (response.success) {
        toast.success("🎉 Account Created Successfully! Welcome to DevHub!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorMessage = response.error?.message || response.message || "Registration failed. Please try again.";
        setError(errorMessage);
        toast.error(`Registration failed: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = "Network error. Please check your connection and try again.";
      if (err.message.includes("Email or username already exists")) {
        errorMessage = "Email or username already exists. Please use a different one.";
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

  const handleGithubSignup = () => {
    toast({
      title: "GitHub OAuth",
      description: "GitHub registration would be implemented here.",
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
          <Card className="w-full bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Join DevHub</CardTitle>
              <CardDescription className="text-slate-300">
                Create your account to start building, learning, and sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-600">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    <label htmlFor="avatar" className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-1 cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-colors">
                      <Upload className="h-3 w-3" />
                    </label>
                    <input id="avatar" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isLoading} />
                  </div>
                  <p className="text-xs text-slate-400">Upload your profile picture (optional)</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                    <Input id="firstName" name="firstName" type="text" placeholder="John" value={formData.firstName} onChange={handleChange} disabled={isLoading} required className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                    <Input id="lastName" name="lastName" type="text" placeholder="Doe" value={formData.lastName} onChange={handleChange} disabled={isLoading} required className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400" />
                  </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" name="email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleChange} className="pl-10" disabled={isLoading} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={formData.password} onChange={handleChange} className="pl-10 pr-10" disabled={isLoading} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground" disabled={isLoading}>
                    {showPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} className="pl-10 pr-10" disabled={isLoading} required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground" disabled={isLoading}>
                    {showConfirmPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Social Profiles (Optional)</h4>
                <div className="space-y-2">
                  <Label htmlFor="githubProfile">GitHub Profile</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="githubProfile" name="githubProfile" type="url" placeholder="https://github.com/username" value={formData.githubProfile} onChange={handleChange} className="pl-10" disabled={isLoading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="linkedinProfile" name="linkedinProfile" type="url" placeholder="https://linkedin.com/in/username" value={formData.linkedinProfile} onChange={handleChange} className="pl-10" disabled={isLoading} />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input id="terms" type="checkbox" className="rounded border-border" required />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={isLoading} />
              <Button variant="outline" onClick={handleGithubSignup} disabled={isLoading}>
                <Github className="h-4 w-4 mr-2" />GitHub
              </Button>
            </div>
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
