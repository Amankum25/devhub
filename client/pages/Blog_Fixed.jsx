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
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            Developer Blog
          </h1>
          <p className="text-muted-foreground">
            Insights, tutorials, and stories from our developer community
          </p>
        </div>
        
        <Button asChild className="flex items-center gap-2">
          <Link to="/blog/new">
            <Plus className="w-4 h-4" />
            Write Article
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search articles, tags, or authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full sm:w-48">
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Articles</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{posts.reduce((acc, post) => acc + post.views, 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{posts.reduce((acc, post) => acc + post.likes, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Likes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{posts.reduce((acc, post) => acc + post.comments, 0)}</p>
              <p className="text-sm text-muted-foreground">Comments</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Featured Articles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.slice(0, 2).map((post) => (
              <PostCard key={post.id} post={post} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {selectedFilter === "all" ? "All Articles" : `${categories.find(c => c.value === selectedFilter)?.label} Articles`}
        </h2>
        
        {filteredPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? `No articles match "${searchTerm}". Try adjusting your search.`
                : "No articles available in this category."
              }
            </p>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedFilter("all"); }}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredPosts.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="w-full sm:w-auto">
            Load More Articles
          </Button>
        </div>
      )}
    </div>
  );
}
