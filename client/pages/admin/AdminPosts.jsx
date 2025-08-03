import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Heart,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminPosts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const posts = [
    {
      id: 1,
      title: "Advanced React Patterns for 2024",
      author: "Jane Smith",
      excerpt: "Exploring the latest React patterns and best practices...",
      status: "published",
      publishDate: "2023-12-01",
      views: 1250,
      likes: 89,
      comments: 23,
      tags: ["React", "JavaScript", "Frontend"],
      featured: true,
    },
    {
      id: 2,
      title: "Building Scalable APIs with Node.js",
      author: "John Doe",
      excerpt: "Learn how to build robust and scalable backend APIs...",
      status: "published",
      publishDate: "2023-11-28",
      views: 892,
      likes: 67,
      comments: 15,
      tags: ["Node.js", "API", "Backend"],
      featured: false,
    },
    {
      id: 3,
      title: "CSS Grid vs Flexbox: When to Use Each",
      author: "Alice Johnson",
      excerpt: "A comprehensive guide to modern CSS layout techniques...",
      status: "draft",
      publishDate: null,
      views: 0,
      likes: 0,
      comments: 0,
      tags: ["CSS", "Layout", "Frontend"],
      featured: false,
    },
    {
      id: 4,
      title: "Understanding TypeScript Generics",
      author: "Bob Brown",
      excerpt:
        "Deep dive into TypeScript generics and their practical applications...",
      status: "review",
      publishDate: null,
      views: 0,
      likes: 0,
      comments: 0,
      tags: ["TypeScript", "JavaScript"],
      featured: false,
    },
    {
      id: 5,
      title: "Database Optimization Techniques",
      author: "Emily Davis",
      excerpt: "Performance optimization strategies for modern databases...",
      status: "published",
      publishDate: "2023-11-25",
      views: 634,
      likes: 45,
      comments: 8,
      tags: ["Database", "Performance", "Backend"],
      featured: true,
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const stats = [
    { label: "Total Posts", value: "289", color: "text-blue-600" },
    { label: "Published", value: "245", color: "text-green-600" },
    { label: "Drafts", value: "32", color: "text-gray-600" },
    { label: "Under Review", value: "12", color: "text-yellow-600" },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts Management</h1>
          <p className="text-gray-600 mt-2">
            Manage blog posts, articles, and content
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <p className={`text-sm ${stat.color} font-medium`}>
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Content Library</CardTitle>
          <CardDescription>
            Browse and manage all platform content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts by title, author, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Posts Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Post
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Author
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Published
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Engagement
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Tags
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {post.title}
                          </h3>
                          {post.featured && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 text-xs"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {post.excerpt}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        {post.author}
                      </div>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(post.status)}</td>
                    <td className="py-4 px-4">
                      {post.publishDate ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {post.publishDate}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Not published
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <Eye className="h-3 w-3 mr-1" />
                          {post.views} views
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {post.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {post.comments}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Post
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No posts found matching your search.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPosts;
