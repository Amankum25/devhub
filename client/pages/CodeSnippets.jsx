import { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [snippets, setSnippets] = useState([
    {
      id: 1,
      title: "React Custom Hook for API Calls",
      description:
        "A reusable custom hook for making API requests with loading states, error handling, and caching",
      code: `import { useState, useEffect } from 'react';

const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useApi;`,
      language: "javascript",
      tags: ["react", "hooks", "api", "custom-hook"],
      author: "John Doe",
      avatar: "/placeholder.svg",
      likes: 45,
      views: 234,
      forks: 12,
      createdAt: "2023-12-01",
      isPublic: true,
      isFavorited: false,
    },
    {
      id: 2,
      title: "Python Data Validation Decorator",
      description:
        "A decorator for validating function parameters with type checking and custom validation rules",
      code: `from functools import wraps
from typing import Any, Callable, Dict

def validate_params(**validations):
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Get function signature
            import inspect
            sig = inspect.signature(func)
            bound_args = sig.bind(*args, **kwargs)
            bound_args.apply_defaults()
            
            # Validate each parameter
            for param_name, validator in validations.items():
                if param_name in bound_args.arguments:
                    value = bound_args.arguments[param_name]
                    if not validator(value):
                        raise ValueError(f"Invalid value for {param_name}: {value}")
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Usage example
@validate_params(
    name=lambda x: isinstance(x, str) and len(x) > 0,
    age=lambda x: isinstance(x, int) and 0 <= x <= 150
)
def create_user(name: str, age: int):
    return f"User {name}, age {age}"`,
      language: "python",
      tags: ["python", "decorator", "validation", "typing"],
      author: "Alice Smith",
      avatar: "/placeholder.svg",
      likes: 32,
      views: 156,
      forks: 8,
      createdAt: "2023-11-28",
      isPublic: true,
      isFavorited: true,
    },
    {
      id: 3,
      title: "CSS Flexbox Grid System",
      description:
        "A flexible grid system using CSS flexbox with responsive breakpoints and utility classes",
      code: `.grid {
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;
}

.grid-col {
  padding: 0.5rem;
  flex: 1;
}

/* Column widths */
.grid-col-1 { flex: 0 0 8.333333%; }
.grid-col-2 { flex: 0 0 16.666667%; }
.grid-col-3 { flex: 0 0 25%; }
.grid-col-4 { flex: 0 0 33.333333%; }
.grid-col-6 { flex: 0 0 50%; }
.grid-col-12 { flex: 0 0 100%; }

/* Responsive breakpoints */
@media (max-width: 768px) {
  .grid-col-sm-12 { flex: 0 0 100%; }
  .grid-col-sm-6 { flex: 0 0 50%; }
}

@media (max-width: 480px) {
  .grid-col-xs-12 { flex: 0 0 100%; }
}

/* Utility classes */
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.no-gutters { margin: 0; }
.no-gutters .grid-col { padding: 0; }`,
      language: "css",
      tags: ["css", "flexbox", "grid", "responsive"],
      author: "Bob Wilson",
      avatar: "/placeholder.svg",
      likes: 28,
      views: 189,
      forks: 15,
      createdAt: "2023-11-25",
      isPublic: true,
      isFavorited: false,
    },
    {
      id: 4,
      title: "Node.js Rate Limiter Middleware",
      description:
        "Express middleware for implementing rate limiting with Redis backend and customizable rules",
      code: `const redis = require('redis');
const client = redis.createClient();

const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests',
    statusCode = 429,
    keyGenerator = (req) => req.ip,
    skipSuccessfulRequests = false
  } = options;

  return async (req, res, next) => {
    const key = \`rate_limit:\${keyGenerator(req)}\`;
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = \`\${key}:\${window}\`;

    try {
      const current = await client.incr(redisKey);
      
      if (current === 1) {
        await client.expire(redisKey, Math.ceil(windowMs / 1000));
      }

      if (current > max) {
        return res.status(statusCode).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': Math.max(0, max - current),
        'X-RateLimit-Reset': new Date(window * windowMs + windowMs)
      });

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Fail open
    }
  };
};

module.exports = rateLimit;`,
      language: "javascript",
      tags: ["nodejs", "express", "middleware", "rate-limiting", "redis"],
      author: "Carol Davis",
      avatar: "/placeholder.svg",
      likes: 67,
      views: 445,
      forks: 23,
      createdAt: "2023-11-22",
      isPublic: true,
      isFavorited: true,
    },
  ]);

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

  const handleSaveSnippet = () => {
    if (!newSnippet.title || !newSnippet.code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const snippet = {
      id: Date.now(),
      ...newSnippet,
      author: "You",
      avatar: "/placeholder.svg",
      likes: 0,
      views: 0,
      forks: 0,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorited: false,
    };

    setSnippets((prev) => [snippet, ...prev]);
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

    toast({
      title: "Snippet created!",
      description: "Your code snippet has been saved successfully.",
    });
  };

  const mySnippets = snippets.filter((snippet) => snippet.author === "You");
  const favoriteSnippets = snippets.filter((snippet) => snippet.isFavorited);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Code Snippets</h1>
            <p className="text-gray-600 mt-2">
              Discover, share, and save useful code snippets
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Snippet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Code Snippet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      value={newSnippet.title}
                      onChange={(e) =>
                        setNewSnippet((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter snippet title"
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
                  <Button onClick={handleSaveSnippet}>Save Snippet</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-sm text-gray-500">Total Snippets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-sm text-gray-500">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">456</p>
                  <p className="text-sm text-gray-500">Favorited</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">67</p>
                  <p className="text-sm text-gray-500">Contributors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse All</TabsTrigger>
            <TabsTrigger value="my-snippets">
              My Snippets ({mySnippets.length})
            </TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites ({favoriteSnippets.length})
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search snippets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSnippets.map((snippet) => (
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
                            {snippet.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{snippet.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{snippet.createdAt}</span>
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
                      <pre className="whitespace-pre-wrap">{snippet.code}</pre>
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
                              {snippet.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{snippet.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{snippet.createdAt}</span>
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
