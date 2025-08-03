import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  ChevronRight
} from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users,
      description: 'Active registered users',
      color: 'text-blue-600'
    },
    {
      title: 'Active Sessions',
      value: '56',
      change: '-5%',
      trend: 'down',
      icon: Activity,
      description: 'Currently online',
      color: 'text-green-600'
    },
    {
      title: 'Posts',
      value: '289',
      change: '+8%',
      trend: 'up',
      icon: FileText,
      description: 'Published blog posts',
      color: 'text-purple-600'
    },
    {
      title: 'Snippets',
      value: '152',
      change: '+15%',
      trend: 'up',
      icon: MessageSquare,
      description: 'Code snippets shared',
      color: 'text-orange-600'
    }
  ];

  const recentActivity = [
    {
      type: 'user',
      icon: User,
      title: 'Post created by Jane Smith',
      time: '2 hours ago',
      status: 'published'
    },
    {
      type: 'comment',
      icon: MessageSquare,
      title: 'New comment by Alice Johnson',
      time: '3 hours ago',
      status: 'pending'
    },
    {
      type: 'user',
      icon: User,
      title: 'User John Doe logged in',
      time: '3 hours ago',
      status: 'active'
    },
    {
      type: 'alert',
      icon: AlertTriangle,
      title: 'Flagged content reported',
      time: '4 hours ago',
      status: 'review'
    },
    {
      type: 'system',
      icon: CheckCircle,
      title: 'Backup completed successfully',
      time: '6 hours ago',
      status: 'completed'
    }
  ];

  const posts = [
    {
      title: 'Sample Post 1',
      author: 'John Doe',
      date: '09/08/21',
      status: 'Published'
    },
    {
      title: 'Sample Post 2',
      author: 'Alice Johnson',
      date: '08/06/21',
      status: 'Published'
    },
    {
      title: 'Sample Smith',
      author: 'Jane Smith',
      date: '09/02/21',
      status: 'Published'
    },
    {
      title: 'Bob Brown',
      author: 'Bob Brown',
      date: '06/17/20',
      status: 'Draft'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
      case 'active':
      case 'completed':
        return 'text-green-600';
      case 'pending':
      case 'review':
        return 'text-yellow-600';
      case 'Draft':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Published':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Published</Badge>;
      case 'Draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your DevHub platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  <TrendIcon className={`h-3 w-3 mr-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Activity
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </CardTitle>
            <CardDescription>Latest platform activities and events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                      <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Real-Time User Activity Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Real-Time User Activity</CardTitle>
            <CardDescription>Active users over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">Real-time activity chart</p>
                <p className="text-gray-500 text-xs">Chart implementation pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Posts
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
          <CardDescription>Recent blog posts and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Author</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{post.title}</td>
                    <td className="py-3 px-4 text-gray-600">{post.author}</td>
                    <td className="py-3 px-4 text-gray-600">{post.date}</td>
                    <td className="py-3 px-4">{getStatusBadge(post.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
