import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  Heart,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Clock,
  Tag,
  Star
} from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock blog posts data
  const mockPosts = [
    {
      id: 1,
      title: 'Advanced React Patterns for 2024',
      excerpt: 'Explore the latest React patterns including Compound Components, Render Props, and Custom Hooks that will make your React applications more maintainable and scalable.',
      author: 'Sarah Chen',
      authorAvatar: '👩‍💻',
      publishDate: '2024-01-15',
      readTime: '8 min read',
      tags: ['React', 'JavaScript', 'Frontend'],
      likes: 89,
      comments: 23,
      featured: true,
      category: 'frontend'
    },
    {
      id: 2,
      title: 'Building Scalable APIs with Node.js',
      excerpt: 'Learn how to build robust and scalable backend APIs using Node.js, Express, and modern best practices including error handling, authentication, and database optimization.',
      author: 'Marcus Rodriguez',
      authorAvatar: '👨‍💻',
      publishDate: '2024-01-12',
      readTime: '12 min read',
      tags: ['Node.js', 'API', 'Backend'],
      likes: 67,
      comments: 15,
      featured: false,
      category: 'backend'
    },
    {
      id: 3,
      title: 'CSS Grid vs Flexbox: When to Use Each',
      excerpt: 'A comprehensive guide to modern CSS layout techniques. Understand the differences between CSS Grid and Flexbox and learn when to use each for maximum effectiveness.',
      author: 'Emily Johnson',
      authorAvatar: '👩‍🎓',
      publishDate: '2024-01-10',
      readTime: '6 min read',
      tags: ['CSS', 'Layout', 'Frontend'],
      likes: 45,
      comments: 8,
      featured: false,
      category: 'frontend'
    },
    {
      id: 4,
      title: 'Understanding TypeScript Generics',
      excerpt: 'Deep dive into TypeScript generics and their practical applications. Learn how to write type-safe, reusable code that scales with your application.',
      author: 'David Kim',
      authorAvatar: '👨‍🔬',
      publishDate: '2024-01-08',
      readTime: '10 min read',
      tags: ['TypeScript', 'JavaScript'],
      likes: 78,
      comments: 19,
      featured: true,
      category: 'programming'
    },
    {
      id: 5,
      title: 'Database Optimization Techniques',
      excerpt: 'Performance optimization strategies for modern databases. Learn indexing, query optimization, and caching techniques to speed up your applications.',
      author: 'Lisa Wang',
      authorAvatar: '👩‍🔬',
      publishDate: '2024-01-05',
      readTime: '15 min read',
      tags: ['Database', 'Performance', 'Backend'],
      likes: 92,
      comments: 31,
      featured: false,
      category: 'backend'
    },
    {
      id: 6,
      title: 'Getting Started with Docker for Developers',
      excerpt: 'Learn containerization basics with Docker. From creating your first container to orchestrating multi-service applications, this guide covers it all.',
      author: 'Alex Turner',
      authorAvatar: '👨‍🎓',
      publishDate: '2024-01-03',
      readTime: '9 min read',
      tags: ['Docker', 'DevOps', 'Containers'],
      likes: 156,
      comments: 42,
      featured: true,
      category: 'devops'
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Posts', count: mockPosts.length },
    { value: 'popular', label: 'Popular', count: mockPosts.filter(p => p.likes > 70).length },
    { value: 'recent', label: 'Recent', count: mockPosts.filter(p => new Date(p.publishDate) > new Date('2024-01-10')).length },
    { value: 'featured', label: 'Featured', count: mockPosts.filter(p => p.featured).length }
  ];

  const allTags = [...new Set(mockPosts.flatMap(post => post.tags))];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPosts(mockPosts);
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case 'popular':
        return post.likes > 70;
      case 'recent':
        return new Date(post.publishDate) > new Date('2024-01-10');
      case 'featured':
        return post.featured;
      default:
        return true;
    }
  });

  const handleTagClick = (tag) => {
    setSearchTerm(tag);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <BookOpen className="h-8 w-8 mr-3" />
              Developer Blog
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover insights, tutorials, and stories from the developer community
            </p>
          </div>
          <Link to="/blog/new">
            <Button className="mt-4 md:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Write Post
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts by title, author, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {filterOptions.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={selectedFilter === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.value)}
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    {filter.label} ({filter.count})
                  </Button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Popular Tags:</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleTagClick(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Posts */}
        {selectedFilter === 'all' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Featured Posts
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {posts.filter(post => post.featured).slice(0, 2).map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
                      <Badge className="mb-3 bg-yellow-500 text-yellow-900">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                      <Link to={`/blog/${post.id}`}>
                        <h3 className="text-xl font-bold hover:text-primary transition-colors cursor-pointer mb-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{post.authorAvatar}</span>
                          <div>
                            <p className="text-sm font-medium">{post.author}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(post.publishDate).toLocaleDateString()}
                              <Clock className="h-3 w-3 ml-2 mr-1" />
                              {post.readTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comments}
                          </div>
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
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {selectedFilter === 'all' ? 'Latest Posts' : `${filterOptions.find(f => f.value === selectedFilter)?.label} Posts`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <div className="flex gap-1">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs cursor-pointer" onClick={() => handleTagClick(tag)}>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Link to={`/blog/${post.id}`}>
                          <h3 className="text-xl font-bold hover:text-primary transition-colors cursor-pointer mb-2">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{post.authorAvatar}</span>
                        <div>
                          <p className="text-sm font-medium">{post.author}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(post.publishDate).toLocaleDateString()}
                            <Clock className="h-3 w-3 ml-2 mr-1" />
                            {post.readTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <div className="flex items-center cursor-pointer hover:text-red-500 transition-colors">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comments}
                          </div>
                        </div>
                        <Link to={`/blog/${post.id}`}>
                          <Button variant="outline" size="sm">
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
