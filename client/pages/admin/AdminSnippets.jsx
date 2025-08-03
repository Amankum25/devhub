import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, TrendingUp, Heart, Copy, User, Calendar } from "lucide-react";

const AdminSnippets = () => {
  const snippets = [
    {
      id: 1,
      title: "React useEffect Hook",
      language: "JavaScript",
      author: "Jane Smith",
      date: "2023-12-01",
      views: 234,
      likes: 45,
      copies: 89,
    },
    {
      id: 2,
      title: "Python List Comprehension",
      language: "Python",
      author: "John Doe",
      date: "2023-11-30",
      views: 189,
      likes: 32,
      copies: 67,
    },
    {
      id: 3,
      title: "CSS Flexbox Center",
      language: "CSS",
      author: "Alice Johnson",
      date: "2023-11-29",
      views: 156,
      likes: 28,
      copies: 43,
    },
  ];

  const languages = [
    { name: "JavaScript", count: 89, color: "bg-yellow-100 text-yellow-800" },
    { name: "Python", count: 67, color: "bg-blue-100 text-blue-800" },
    { name: "CSS", count: 45, color: "bg-pink-100 text-pink-800" },
    { name: "TypeScript", count: 34, color: "bg-indigo-100 text-indigo-800" },
    { name: "React", count: 29, color: "bg-cyan-100 text-cyan-800" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Code Snippets</h1>
        <p className="text-gray-600 mt-2">
          Manage and analyze code snippet statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">152</div>
            <p className="text-sm text-blue-600 font-medium">Total Snippets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">1.2K</div>
            <p className="text-sm text-green-600 font-medium">Total Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">345</div>
            <p className="text-sm text-red-600 font-medium">Total Likes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">567</div>
            <p className="text-sm text-purple-600 font-medium">Total Copies</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Popular Snippets</CardTitle>
            <CardDescription>
              Most viewed and liked code snippets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {snippets.map((snippet) => (
                <div key={snippet.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {snippet.title}
                    </h3>
                    <Badge variant="outline">{snippet.language}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {snippet.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {snippet.date}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {snippet.views} views
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {snippet.likes} likes
                    </div>
                    <div className="flex items-center">
                      <Copy className="h-4 w-4 mr-1" />
                      {snippet.copies} copies
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Languages Distribution</CardTitle>
            <CardDescription>Breakdown by programming language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Code className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {lang.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{lang.count}</span>
                    <Badge className={lang.color}>{lang.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSnippets;
