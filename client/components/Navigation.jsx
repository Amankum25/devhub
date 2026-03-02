import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  User,
  Briefcase,
  MessageSquare,
  Target,
  Zap,
  Shield,
  Terminal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { name: "Home", path: "/", icon: null },
    { name: "Practice", path: "/practice", icon: Target },
    { name: "AI Tools", path: "/ai-tools", icon: Zap },
    { name: "Interview", path: "/interview", icon: Briefcase },
    { name: "Chat", path: "/chat", icon: MessageSquare },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#0B0E1A]/95 backdrop-blur-xl border-b border-[#252B40] shadow-lg shadow-black/30"
            : "bg-[#0B0E1A]/80 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-[#3BD671] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,214,113,0.4)] group-hover:shadow-[0_0_25px_rgba(59,214,113,0.6)] transition-all duration-300">
                <Terminal className="h-5 w-5 text-[#0B0E1A]" />
              </div>
              <span className="text-lg font-bold text-white hidden sm:block tracking-wide">
                Dev<span className="text-[#3BD671]">Hub</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "text-[#3BD671] bg-[#3BD671]/10 border border-[#3BD671]/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative text-slate-400 hover:text-white hover:bg-white/5 hidden sm:flex"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full ring-2 ring-[#3BD671]/20 hover:ring-[#3BD671]/50 transition-all duration-300 p-0"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-[#3BD671]/20 text-[#3BD671] text-xs font-bold border border-[#3BD671]/30">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60 mt-2 bg-[#141829] border border-[#252B40] shadow-xl shadow-black/40">
                      <DropdownMenuLabel className="pb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-[#3BD671]/20 text-[#3BD671] text-sm font-bold border border-[#3BD671]/30">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-[140px]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#252B40]" />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white focus:bg-[#252B40]">
                          <User className="h-4 w-4 text-[#3BD671]" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white focus:bg-[#252B40]">
                          <User className="h-4 w-4 text-slate-400" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white focus:bg-[#252B40]">
                          <Settings className="h-4 w-4 text-slate-400" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      {user.isAdmin && (
                        <>
                          <DropdownMenuSeparator className="bg-[#252B40]" />
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="flex items-center space-x-2 cursor-pointer text-purple-400 focus:bg-[#252B40]">
                              <Shield className="h-4 w-4" />
                              <span>Admin Panel</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator className="bg-[#252B40]" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center space-x-2 cursor-pointer text-red-400 hover:text-red-300 focus:bg-[#252B40]"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 text-sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="btn-gradient text-[#0B0E1A] text-sm px-4 py-2 h-9 rounded-lg font-semibold">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden text-slate-400 hover:text-white hover:bg-white/5"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-[#0E1120] border-l border-[#252B40] shadow-2xl">
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-white">
                  Dev<span className="text-[#3BD671]">Hub</span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(item.path)
                          ? "bg-[#3BD671]/10 text-[#3BD671] border border-[#3BD671]/20"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {!user && (
                <div className="space-y-2 pt-4 border-t border-[#252B40]">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full border-[#252B40] text-slate-300 hover:text-white hover:border-[#3BD671]/40">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full btn-gradient text-[#0B0E1A] font-semibold">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {user && (
                <div className="pt-4 border-t border-[#252B40] space-y-1">
                  <div className="flex items-center space-x-3 px-2 pb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-[#3BD671]/20 text-[#3BD671] text-sm font-bold">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm">
                    <User className="h-4 w-4 text-[#3BD671]" /><span>Dashboard</span>
                  </Link>
                  <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm">
                    <Settings className="h-4 w-4 text-slate-500" /><span>Settings</span>
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 px-4 py-2 rounded-lg text-purple-400 hover:bg-white/5 text-sm">
                      <Shield className="h-4 w-4" /><span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 w-full text-left text-sm"
                  >
                    <LogOut className="h-4 w-4" /><span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

