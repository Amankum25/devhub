import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";
import {
  Code,
  Search,
  Filter,
  Heart,
  Eye,
  Copy,
  Share,
  Download,
  Plus,
  Edit,
  Trash2,
  Star,
  BookmarkPlus,
  Github,
  Play,
  ChevronDown,
  Calendar,
  User,
  Tag,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function CodeSnippets() {
  const { user, token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [snippets, setSnippets] = useState([]);
  // Fetch snippets on component mount
  useEffect(() => {
    fetchSnippets();
  }, [sortBy, selectedLanguage, selectedTag, searchTerm]);

  const fetchSnippets = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: 1,
        limit: 50,
        sort: sortBy,
        ...(selectedLanguage !== "all" && { language: selectedLanguage }),
        ...(selectedTag !== "all" && { tag: selectedTag }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`http://localhost:3000/api/snippets?${params}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSnippets(data.data.snippets);
        }
      }
    } catch (error) {
      console.error("Error fetching snippets:", error);
      toast({
        title: "Error",
        description: "Failed to load snippets.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const [newSnippet, setNewSnippet] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    tags: [],
    isPublic: true,
  });

  const languages = [
    "all",
    "javascript",
    "python",
    "css",
    "html",
    "typescript",
    "react",
    "node.js",
    "java",
    "c++",
    "c#",
    "php",
    "ruby",
    "go",
    "rust",
    "kotlin",
    "swift",
  ];

  const popularTags = [
    "all",
    "react",
    "hooks",
    "api",
    "validation",
    "middleware",
    "utility",
    "frontend",
    "backend",
    "responsive",
    "authentication",
    "database",
  ];

  const filteredSnippets = snippets
    .filter((snippet) => {
      const matchesSearch =
        snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesLanguage =
        selectedLanguage === "all" || snippet.language === selectedLanguage;
      const matchesTag =
        selectedTag === "all" || snippet.tags.includes(selectedTag);

      return matchesSearch && matchesLanguage && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.likes - a.likes;
        case "views":
          return b.views - a.views;
        case "recent":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied!",
      description: "The code snippet has been copied to your clipboard.",
    });
  };

  const handleLikeSnippet = (snippetId) => {
    setSnippets((prev) =>
      prev.map((snippet) =>
        snippet.id === snippetId
          ? { ...snippet, likes: snippet.likes + 1 }
          : snippet,
      ),
    );
    toast({
      title: "Liked!",
      description: "You liked this code snippet.",
    });
  };

  const handleSaveSnippet = async () => {
    console.log("handleSaveSnippet called");
    console.log("newSnippet:", newSnippet);
    console.log("isAuthenticated():", isAuthenticated());
    console.log("token:", token);
    
    if (!newSnippet.title || !newSnippet.code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated()) {
      toast({
        title: "Error",
        description: "You must be logged in to create snippets.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3000/api/snippets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newSnippet.title,
          description: newSnippet.description,
          code: newSnippet.code,
          language: newSnippet.language,
          tags: newSnippet.tags,
          isPublic: newSnippet.isPublic,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reset form
        setNewSnippet({
          title: "",
          description: "",
          code: "",
          language: "javascript",
          tags: [],
          isPublic: true,
        });
        setIsCreateDialogOpen(false);
        setActiveTab("my-snippets");

        // Refresh snippets list
        await fetchSnippets();

        toast({
          title: "Success!",
          description: "Your code snippet has been created successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create snippet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating snippet:", error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const mySnippets = snippets.filter((snippet) => snippet.username === user?.username);
  const favoriteSnippets = snippets.filter((snippet) => snippet.isFavorited);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-2xl">
              <Code className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Code Snippets
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover, share, and save useful code snippets
          </p>
        </div>

        {isAuthenticated() && (
          <div className="flex justify-center mb-8">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl"
              onClick={() => {
                console.log("Create Snippet button clicked!");
                console.log("Current dialog state:", isCreateDialogOpen);
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Snippet
            </Button>
          </div>
        )}

        {/* Create Snippet Dialog */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Create New Code Snippet</h2>
                <button 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-300 mb-4">Fill out the form below to create and share your code snippet.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Title *</label>
                    <Input
                      value={newSnippet.title}
                      onChange={(e) =>
                        setNewSnippet((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter snippet title"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Language *</label>
                    <Select
                      value={newSnippet.language}
                      onValueChange={(value) =>
                        setNewSnippet((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages
                          .filter((lang) => lang !== "all")
                          .map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newSnippet.description}
                    onChange={(e) =>
                      setNewSnippet((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what this snippet does..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Code *</label>
                  <Textarea
                    value={newSnippet.code}
                    onChange={(e) =>
                      setNewSnippet((prev) => ({
                        ...prev,
                        code: e.target.value,
                      }))
                    }
                    placeholder="Paste your code here..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Tags (comma separated)
                  </label>
                  <Input
                    placeholder="react, hooks, api, custom"
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag);
                      setNewSnippet((prev) => ({ ...prev, tags }));
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newSnippet.isPublic}
                    onChange={(e) =>
                      setNewSnippet((prev) => ({
                        ...prev,
                        isPublic: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="isPublic" className="text-sm">
                    Make this snippet public
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log("Save Snippet button clicked");
                      handleSaveSnippet();
                    }} 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Save Snippet"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">1,234</p>
                  <p className="text-sm text-slate-400">Total Snippets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">89</p>
                  <p className="text-sm text-slate-400">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">456</p>
                  <p className="text-sm text-slate-400">Favorited</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">67</p>
                  <p className="text-sm text-slate-400">Contributors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <TabsTrigger value="browse" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Browse All</TabsTrigger>
            <TabsTrigger value="my-snippets" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              My Snippets ({mySnippets.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Favorites ({favoriteSnippets.length})
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search snippets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang === "all" ? "All Languages" : lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag === "all" ? "All Tags" : tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Liked</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Snippets Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="flex flex-col animate-pulse bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                    <CardHeader>
                      <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 bg-slate-700 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="flex space-x-4">
                          <div className="h-3 bg-slate-700 rounded w-8"></div>
                          <div className="h-3 bg-slate-700 rounded w-8"></div>
                          <div className="h-3 bg-slate-700 rounded w-8"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 bg-slate-700 rounded"></div>
                          <div className="h-8 w-8 bg-slate-700 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSnippets.map((snippet) => (
                <Card key={snippet.id} className="flex flex-col bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white">
                          {snippet.title}
                        </CardTitle>
                        <p className="text-sm text-slate-300 mt-1">
                          {snippet.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/50">{snippet.language}</Badge>
                    </div>

                    <div className="flex items-center space-x-3 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={snippet.avatar} />
                          <AvatarFallback>
                            {(snippet.firstName || snippet.username || "U").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{snippet.firstName && snippet.lastName 
                          ? `${snippet.firstName} ${snippet.lastName}` 
                          : snippet.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {snippet.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="bg-slate-900/80 rounded-lg p-4 text-green-400 font-mono text-sm overflow-x-auto max-h-48 overflow-y-auto border border-slate-700/50">
                      <pre className="whitespace-pre-wrap">{snippet.code}</pre>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{snippet.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{snippet.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Github className="h-4 w-4" />
                          <span>{snippet.forks}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeSnippet(snippet.id)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(snippet.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Snippets Tab */}
          <TabsContent value="my-snippets" className="space-y-6">
            {mySnippets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No snippets yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start building your code snippet library
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Snippet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mySnippets.map((snippet) => (
                  <Card key={snippet.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {snippet.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {snippet.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{snippet.language}</Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {snippet.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-x-auto max-h-48 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {snippet.code}
                        </pre>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{snippet.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{snippet.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Github className="h-4 w-4" />
                            <span>{snippet.forks}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(snippet.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            {favoriteSnippets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start favoriting snippets you find useful
                  </p>
                  <Button onClick={() => setActiveTab("browse")}>
                    Browse Snippets
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {favoriteSnippets.map((snippet) => (
                  <Card key={snippet.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {snippet.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {snippet.description}
                          </p>
                        </div>
                        <Badge variant="secondary">{snippet.language}</Badge>
                      </div>

                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={snippet.avatar} />
                            <AvatarFallback>
                              {(snippet.firstName || snippet.username || "U").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{snippet.firstName && snippet.lastName 
                            ? `${snippet.firstName} ${snippet.lastName}` 
                            : snippet.username}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {snippet.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm overflow-x-auto max-h-48 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {snippet.code}
                        </pre>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{snippet.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{snippet.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Github className="h-4 w-4" />
                            <span>{snippet.forks}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(snippet.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
