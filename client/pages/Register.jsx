import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Upload,
  ChevronRight,
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
    <div className="min-h-screen bg-[#0B0E1A] relative overflow-hidden">
      <div className="min-h-screen flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-[#3BD671] rounded-lg flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-[#0B0E1A]" />
              </div>
              <span className="text-xl font-bold text-white">Dev<span className="font-normal text-slate-400">Hub</span></span>
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">Join the developer community</p>
          </div>

          <div className="bg-[#0E1120] rounded-xl border border-[#252B40] p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-lg text-red-400 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#141829] border-2 border-[#252B40] flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-slate-600" />
                    )}
                  </div>
                  <label htmlFor="avatar" className="absolute bottom-0 right-0 w-5 h-5 bg-[#3BD671] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#2ea85c] transition-colors">
                    <Upload className="h-2.5 w-2.5 text-[#0B0E1A]" />
                  </label>
                  <input id="avatar" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isLoading} />
                </div>
                <p className="text-xs text-slate-600">Profile picture (optional)</p>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">First Name *</label>
                  <input
                    name="firstName" type="text" placeholder="John"
                    value={formData.firstName} onChange={handleChange} disabled={isLoading} required
                    className="w-full px-3 py-2 text-sm bg-[#141829] border border-[#252B40] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#3BD671]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Last Name *</label>
                  <input
                    name="lastName" type="text" placeholder="Doe"
                    value={formData.lastName} onChange={handleChange} disabled={isLoading} required
                    className="w-full px-3 py-2 text-sm bg-[#141829] border border-[#252B40] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#3BD671]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                  <input
                    name="email" type="email" placeholder="john@example.com"
                    value={formData.email} onChange={handleChange} disabled={isLoading} required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#141829] border border-[#252B40] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#3BD671]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                  <input
                    name="password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters, Upper+Lower+Number"
                    value={formData.password} onChange={handleChange} disabled={isLoading} required
                    className="w-full pl-9 pr-10 py-2 text-sm bg-[#141829] border border-[#252B40] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#3BD671]/50 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                  <input
                    name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Repeat your password"
                    value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} required
                    className="w-full pl-9 pr-10 py-2 text-sm bg-[#141829] border border-[#252B40] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#3BD671]/50 transition-colors"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Optional socials */}
              <details className="group">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 list-none flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                  Social profiles (optional)
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                    <input
                      name="githubProfile" type="url" placeholder="https://github.com/username"
                      value={formData.githubProfile} onChange={handleChange} disabled={isLoading}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-[#141829] border border-[#252B40] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#3BD671]/50 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                    <input
                      name="linkedinProfile" type="url" placeholder="https://linkedin.com/in/username"
                      value={formData.linkedinProfile} onChange={handleChange} disabled={isLoading}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-[#141829] border border-[#252B40] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#3BD671]/50 transition-colors"
                    />
                  </div>
                </div>
              </details>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input id="terms" type="checkbox" required className="mt-0.5 accent-[#3BD671]" />
                <label htmlFor="terms" className="text-xs text-slate-500">
                  I agree to the{" "}
                  <Link to="/terms" className="text-[#3BD671] hover:underline">Terms of Service</Link>{" "}and{" "}
                  <Link to="/privacy" className="text-[#3BD671] hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit" disabled={isLoading}
                className="w-full btn-gradient text-[#0B0E1A] font-semibold py-2.5 rounded-lg text-sm transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-[#0B0E1A] border-t-transparent rounded-full animate-spin" /> Creating account…</>
                ) : (
                  <><UserPlus className="h-4 w-4" /> Create Account</>
                )}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#252B40]" /></div>
              <div className="relative flex justify-center"><span className="bg-[#0E1120] px-3 text-xs text-slate-600">OR</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={isLoading} />
              <button
                onClick={handleGithubSignup} disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#252B40] bg-[#141829] hover:bg-[#1a2035] text-white text-sm transition-colors disabled:opacity-60"
              >
                <Github className="h-4 w-4" /> GitHub
              </button>
            </div>

            <p className="text-center text-xs text-slate-600 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-[#3BD671] hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
