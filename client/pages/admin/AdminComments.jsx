import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Flag,
  CheckCircle,
  XCircle,
  User,
  Calendar,
} from "lucide-react";

const AdminComments = () => {
  const comments = [
    {
      id: 1,
      content: "Great article! Really helped me understand React hooks better.",
      author: "John Doe",
      post: "Advanced React Patterns for 2024",
      date: "2023-12-01",
      status: "approved",
      flagged: false,
    },
    {
      id: 2,
      content: "This is spam content with promotional links...",
      author: "Spam User",
      post: "Building Scalable APIs",
      date: "2023-12-01",
      status: "flagged",
      flagged: true,
    },
    {
      id: 3,
      content: "Thanks for sharing this knowledge!",
      author: "Alice Johnson",
      post: "CSS Grid vs Flexbox",
      date: "2023-11-30",
      status: "pending",
      flagged: false,
    },
  ];

  const getStatusBadge = (status, flagged) => {
    if (flagged) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <Flag className="h-3 w-3 mr-1" />
          Flagged
        </Badge>
      );
    }
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Comments Moderation
        </h1>
        <p className="text-gray-600 mt-2">Review and moderate user comments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">156</div>
            <p className="text-sm text-green-600 font-medium">
              Approved Comments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">23</div>
            <p className="text-sm text-yellow-600 font-medium">
              Pending Review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">8</div>
            <p className="text-sm text-red-600 font-medium">Flagged Comments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
          <CardDescription>Review and moderate user comments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {comment.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {comment.date}
                      </div>
                      <span>on "{comment.post}"</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(comment.status, comment.flagged)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button size="sm" variant="outline">
                    <Flag className="h-4 w-4 mr-1" />
                    Flag
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminComments;
