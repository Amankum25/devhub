import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Search,
  Filter,
  Heart,
  MessageSquare,
  Calendar,
  Clock,
  Eye,
  Tag,
  Star,
  Plus,
  TrendingUp,
  Bookmark,
  Share2,
} from "lucide-react";

export default function Blog() {
  usePageTitle("Blog - DevHub");
  
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Mock blog posts data
  const mockPosts = [
    {
      id: 1,
      title: "Advanced React Patterns for 2024",
      excerpt:
        "Explore the latest React patterns including Compound Components, Render Props, and Custom Hooks that will make your React applications more maintainable and scalable.",
      author: "Sarah Chen",
      authorAvatar: "SC",
      publishDate: "2024-01-15",
      readTime: "8 min read",
      tags: ["React", "JavaScript", "Frontend"],
      likes: 89,
      comments: 23,
      views: 1250,
      featured: true,
      category: "frontend",
    },
    {
      id: 2,
      title: "Building Scalable APIs with Node.js",
      excerpt:
        "Learn how to build robust and scalable backend APIs using Node.js, Express, and modern best practices including error handling, authentication, and database optimization.",
      author: "Marcus Rodriguez",
      authorAvatar: "MR",
      publishDate: "2024-01-12",
      readTime: "12 min read",
      tags: ["Node.js", "API", "Backend"],
      likes: 67,
      comments: 15,
      views: 980,
      featured: false,
      category: "backend",
    },
    {
      id: 3,
      title: "CSS Grid vs Flexbox: When to Use Each",
      excerpt:
        "A comprehensive guide to modern CSS layout techniques. Understand the differences between CSS Grid and Flexbox and learn when to use each for maximum effectiveness.",
      author: "Emily Johnson",
      authorAvatar: "EJ",
      publishDate: "2024-01-10",
      readTime: "6 min read",
      tags: ["CSS", "Layout", "Frontend"],
      likes: 45,
      comments: 8,
      views: 750,
      featured: false,
      category: "frontend",
    },
    {
      id: 4,
      title: "Understanding TypeScript Generics",
      excerpt:
        "Deep dive into TypeScript generics and their practical applications. Learn how to write type-safe, reusable code that scales with your application.",
      author: "David Kim",
      authorAvatar: "DK",
      publishDate: "2024-01-08",
      readTime: "10 min read",
      tags: ["TypeScript", "JavaScript"],
      likes: 78,
      comments: 19,
      views: 1100,
      featured: true,
      category: "programming",
    },
    {
      id: 5,
      title: "Database Optimization Techniques",
      excerpt:
        "Performance optimization strategies for modern databases. Learn indexing, query optimization, and caching techniques to speed up your applications.",
      author: "Alex Thompson",
      authorAvatar: "AT",
      publishDate: "2024-01-05",
      readTime: "15 min read",
      tags: ["Database", "Performance", "Backend"],
      likes: 92,
      comments: 27,
      views: 1400,
      featured: false,
      category: "backend",
    },
    {
      id: 6,
      title: "Modern JavaScript ES2024 Features",
      excerpt:
        "Discover the latest JavaScript features in ES2024 and how they can improve your development workflow and code quality.",
      author: "Jennifer Lee",
      authorAvatar: "JL",
      publishDate: "2024-01-03",
      readTime: "7 min read",
      tags: ["JavaScript", "ES2024", "Features"],
      likes: 56,
      comments: 12,
      views: 890,
      featured: false,
      category: "programming",
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setPosts(mockPosts);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === "all" || post.category === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const featuredPosts = posts.filter(post => post.featured);

  const categories = [
    { value: "all", label: "All Posts" },
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "programming", label: "Programming" },
  ];

  const handleLike = (postId) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  };

  const PostCard = ({ post, featured = false }) => (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${featured ? 'border-primary/20' : ''}`}>
      {/* Post Image */}
      <div className="relative overflow-hidden">
        <div 
          className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:scale-105 transition-transform duration-300"
          style={{
            background: `linear-gradient(135deg, ${
              post.category === 'frontend' ? 'rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%' :
              post.category === 'backend' ? 'rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%' :
              'rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%'
            })`
          }}
        />
        {featured && (
          <Badge className="absolute top-3 left-3 bg-primary">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
              <Link to={`/blog/${post.id}`} className="line-clamp-2">
                {post.title}
              </Link>
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm line-clamp-3">
          {post.excerpt}
        </CardDescription>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {post.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{post.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Author and Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">{post.authorAvatar}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{post.author}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(post.id)}
              className="h-8 px-2 hover:text-red-500"
            >
              <Heart className="w-4 h-4 mr-1" />
              {post.likes}
            </Button>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {post.comments}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="space-y-4">
              <div className="h-48 bg-muted animate-pulse rounded-t" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <BookOpen className="w-6 h-6" />
              <span className="font-medium">Developer Blog</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Stories & Insights
            </h1>
            
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Discover the latest insights, tutorials, and stories from our developer community
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                <Link to="/blog/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Write Article
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trending Posts
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-300/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search articles, tags, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-0 bg-slate-900/50 text-white placeholder:text-gray-400 focus:bg-slate-900/70 transition-colors"
                />
              </div>
              
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 border-0 bg-slate-900/50 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{posts.length}</p>
                  <p className="text-blue-100">Articles</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-200 group-hover:scale-110 transition-transform" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{posts.reduce((acc, post) => acc + post.views, 0).toLocaleString()}</p>
                  <p className="text-green-100">Views</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200 group-hover:scale-110 transition-transform" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{posts.reduce((acc, post) => acc + post.likes, 0)}</p>
                  <p className="text-pink-100">Likes</p>
                </div>
                <Heart className="w-8 h-8 text-pink-200 group-hover:scale-110 transition-transform" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{posts.reduce((acc, post) => acc + post.comments, 0)}</p>
                  <p className="text-purple-100">Comments</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-200 group-hover:scale-110 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-500/30">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-yellow-200">Featured Articles</span>
              </div>
              <h2 className="text-3xl font-bold text-white">Editor's Picks</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post) => (
                <Card key={post.id} className="group hover:shadow-2xl transition-all duration-500 shadow-lg overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                  <div className="relative h-64 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-400 text-yellow-900 border-0 shadow-md">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-200 transition-colors">
                        <Link to={`/blog/${post.id}`}>
                          {post.title}
                        </Link>
                      </h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    <p className="text-slate-300 line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500">
                          <AvatarFallback className="text-white text-sm">{post.authorAvatar}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium text-white">{post.author}</p>
                          <p className="text-slate-400">{new Date(post.publishDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">
              {selectedFilter === "all" ? "Latest Articles" : `${categories.find(c => c.value === selectedFilter)?.label} Articles`}
            </h2>
            <p className="text-slate-400">Explore our collection of developer insights and tutorials</p>
          </div>
          
          {filteredPosts.length === 0 ? (
            <Card className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-lg">
              <CardContent className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">No articles found</h3>
                <p className="text-slate-400">
                  {searchTerm 
                    ? `No articles match "${searchTerm}". Try adjusting your search.`
                    : "No articles available in this category."
                  }
                </p>
                <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedFilter("all"); }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 shadow-md overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                  <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-600">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/80 via-purple-500/80 to-indigo-600/80"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                      <Link to={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-slate-300 text-sm line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500">
                          <AvatarFallback className="text-white text-xs">{post.authorAvatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-300">{post.author}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <div className="text-center">
            <Button size="lg" variant="outline" className="px-8 py-3 bg-slate-800/50 backdrop-blur-xl text-white hover:bg-slate-700/50 border-2 border-slate-600/50">
              Load More Articles
              <TrendingUp className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
