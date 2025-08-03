import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle,
  Flag,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  User
} from 'lucide-react';

const AdminChat = () => {
  const flaggedChats = [
    {
      id: 1,
      user: 'John Doe',
      room: 'General Discussion',
      message: 'Inappropriate content that was flagged by users...',
      time: '2 hours ago',
      severity: 'high',
      status: 'pending'
    },
    {
      id: 2,
      user: 'Jane Smith',
      room: 'React Help',
      message: 'Spam message with external links...',
      time: '4 hours ago',
      severity: 'medium',
      status: 'reviewed'
    },
    {
      id: 3,
      user: 'Bob Brown',
      room: 'JavaScript Tips',
      message: 'Offensive language detected by auto-moderation...',
      time: '1 day ago',
      severity: 'low',
      status: 'resolved'
    }
  ];

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800">Reviewed</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chat Monitoring</h1>
        <p className="text-gray-600 mt-2">Monitor and moderate chat rooms and messages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">45</div>
            <p className="text-sm text-blue-600 font-medium">Active Rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">128</div>
            <p className="text-sm text-green-600 font-medium">Online Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-sm text-red-600 font-medium">Flagged Messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">1.2K</div>
            <p className="text-sm text-purple-600 font-medium">Messages Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Flagged Messages</CardTitle>
            <CardDescription>Messages requiring moderation attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flaggedChats.map((chat) => (
                <div key={chat.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{chat.user}</span>
                        <span className="text-sm text-gray-500">in {chat.room}</span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{chat.message}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {chat.time}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      {getSeverityBadge(chat.severity)}
                      {getStatusBadge(chat.status)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline">
                      <Flag className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    <Button size="sm" variant="outline">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Warn User
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Chat Rooms</CardTitle>
            <CardDescription>Currently active discussion rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'General Discussion', users: 45, messages: 234 },
                { name: 'React Help', users: 32, messages: 156 },
                { name: 'JavaScript Tips', users: 28, messages: 189 },
                { name: 'Career Advice', users: 23, messages: 98 },
                { name: 'Project Showcase', users: 19, messages: 76 }
              ].map((room, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900">{room.name}</div>
                      <div className="text-sm text-gray-500">{room.messages} messages today</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{room.users}</span>
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

export default AdminChat;
