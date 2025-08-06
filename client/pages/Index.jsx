import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Code,
  Users,
  Zap,
  Star,
  ArrowRight,
  Play,
  Github,
  Twitter,
  Linkedin,
  ChevronDown,
  Sparkles,
  Trophy,
  Brain,
  Rocket,
  Shield,
  Globe,
  Heart,
  TrendingUp,
  CheckCircle,
  MessageSquare,
  BookOpen,
  Coffee,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate features
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);

    // Add custom CSS animations
    const style = document.createElement("style");
    style.textContent = `
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }

      .animate-blob {
        animation: blob 7s infinite;
      }

      .animation-delay-2000 {
        animation-delay: 2s;
      }

      .animation-delay-4000 {
        animation-delay: 4s;
      }

      .animation-delay-200 {
        animation-delay: 0.2s;
      }

      .animation-delay-400 {
        animation-delay: 0.4s;
      }

      .animation-delay-600 {
        animation-delay: 0.6s;
      }
    `;

    if (!document.getElementById("index-animations")) {
      style.id = "index-animations";
      document.head.appendChild(style);
    }

    return () => {
      clearInterval(interval);
      // Clean up styles when component unmounts
      const existingStyle = document.getElementById("index-animations");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Tools",
      description:
        "Leverage cutting-edge AI to explain code, suggest projects, and review resumes",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Code,
      title: "Code Snippets",
      description:
        "Share, discover, and organize code snippets with syntax highlighting",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageSquare,
      title: "Real-time Chat",
      description:
        "Connect with developers worldwide in topic-specific chat rooms",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const stats = [
    { label: "Active Developers", value: "50K+", icon: Users },
    { label: "Code Snippets", value: "100K+", icon: Code },
    { label: "AI Interactions", value: "1M+", icon: Zap },
    { label: "Success Stories", value: "500+", icon: Trophy },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer at Google",
      avatar: "/placeholder.svg",
      content:
        "DevHub transformed how I share knowledge and collaborate with other developers. The AI tools are incredibly helpful!",
    },
    {
      name: "Marcus Rodriguez",
      role: "Startup Founder",
      avatar: "/placeholder.svg",
      content:
        "Found my co-founder through DevHub's community. The platform brings together the most talented developers.",
    },
    {
      name: "Emily Watson",
      role: "Full Stack Developer",
      avatar: "/placeholder.svg",
      content:
        "The code snippet library saved me countless hours. It's like having a personal coding assistant.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div
            className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-full px-4 py-2 mb-8 shadow-lg animate-slide-down">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-slate-200">
                New: AI-Powered Code Review
              </span>
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                Beta
              </Badge>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">Build Amazing</span>
              <br />
              <span className="text-white">
                Things Together
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up animation-delay-200">
              Join the world's most innovative developer community. Share code,
              learn with AI, and build the future of technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 animate-slide-up animation-delay-400">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform shadow-lg"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Start Building
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-lg bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50 text-white transition-all duration-300"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-sm text-slate-400 animate-fade-in animation-delay-600">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>50K+ Developers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Enterprise Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-slate-400" />
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Supercharge Your Development
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experience the next generation of developer tools with AI-powered
              assistance and collaborative features.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Cards */}
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = currentFeature === index;

                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-xl ${
                      isActive
                        ? "ring-2 ring-purple-500 bg-slate-800/70 backdrop-blur-xl border-purple-500/50 scale-105 shadow-purple-500/25 shadow-lg"
                        : "hover:shadow-lg bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70"
                    }`}
                    onClick={() => setCurrentFeature(index)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2 text-white">
                            {feature.title}
                          </h3>
                          <p className="text-slate-300 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Feature Visualization */}
            <div className="relative">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 h-96 flex items-center justify-center shadow-xl">
                <div className="text-center">
                  {(() => {
                    const FeatureIcon = features[currentFeature].icon;
                    return (
                      <FeatureIcon className="h-24 w-24 mx-auto mb-6 text-purple-400 animate-pulse" />
                    );
                  })()}
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {features[currentFeature].title}
                  </h3>
                  <p className="text-slate-300">
                    Interactive demo coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="h-12 w-12 mx-auto mb-4 opacity-90" />
                  <div className="text-3xl lg:text-4xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-blue-100 text-sm lg:text-base">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Loved by Developers
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See what the community is saying about their DevHub experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="hover:scale-105 hover:shadow-xl transition-all duration-300 bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-lg animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 border-2 border-purple-400"
                    />
                    <div>
                      <h4 className="font-semibold text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Join the Revolution?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Start your journey with the most innovative developer community.
            Build, learn, and grow with AI-powered tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform shadow-lg"
              >
                <Heart className="h-5 w-5 mr-2 text-red-400" />
                Join Free Today
              </Button>
            </Link>

            <Link to="/blog">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600/50 text-white hover:bg-slate-800/50 backdrop-blur-lg px-8 py-4 rounded-full text-lg font-semibold"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Read Our Blog
              </Button>
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center space-x-6">
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
