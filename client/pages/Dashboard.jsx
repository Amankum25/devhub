import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  MessageSquare,
  Code,
  Brain,
  FileText,
  Users,
  Calendar,
  Clock,
  Star,
  Activity,
  Plus,
  ChevronRight,
  Zap,
  Target,
  Award
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    aiCalls: 0,
    messages: 0,
    likes: 0
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('devhub_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Simulate loading stats
      setTimeout(() => {
        setStats({
          posts: Math.floor(Math.random() * 20) + 5,
          aiCalls: Math.floor(Math.random() * 50) + 10,
          messages: Math.floor(Math.random() * 100) + 25,
          likes: Math.floor(Math.random() * 200) + 50
        });
      }, 500);
    }
  }, []);

  const quickActions = [
    {
      title: 'Write a Post',
      description: 'Share your knowledge with the community',
      icon: FileText,
      href: '/blog/new',
      color: 'bg-blue-500'
    },
    {
      title: 'Share Code Snippet',
      description: 'Upload useful code snippets',
      icon: Code,
      href: '/code-snippets',
      color: 'bg-green-500'
    },
    {
      title: 'Ask AI Assistant',
      description: 'Get help with coding problems',
      icon: Brain,
      href: '/ai-tools',
      color: 'bg-purple-500'
    },
    {
      title: 'Join Chat',
      description: 'Connect with other developers',
      icon: MessageSquare,
      href: '/chat',
      color: 'bg-orange-500'
    }
  ];

  const recentActivity = [
    {
      type: 'post',
      title: 'Your post "React Best Practices" received 5 new likes',
      time: '2 hours ago',
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      type: 'comment',
      title: 'New comment on your snippet "useState Hook"',
      time: '4 hours ago',
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      type: 'ai',
      title: 'AI helped you explain a complex algorithm',
      time: '1 day ago',
      icon: Brain,
      color: 'text-purple-500'
    },
    {
      type: 'achievement',
      title: 'You reached 100 total interactions!',
      time: '2 days ago',
      icon: Award,
      color: 'text-green-500'
    }
  ];

  const achievements = [
    { name: 'First Post', description: 'Published your first blog post', completed: true },
    { name: 'Code Contributor', description: 'Shared 5 code snippets', completed: true },
    { name: 'AI Explorer', description: 'Used AI tools 10 times', completed: true },
    { name: 'Community Helper', description: 'Help 10 developers in chat', completed: false },
    { name: 'Popular Creator', description: 'Get 100 likes on your content', completed: false },
    { name: 'Daily Streak', description: 'Login for 7 consecutive days', completed: false }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h2>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedAchievements = achievements.filter(a => a.completed).length;
  const progressPercentage = (completedAchievements / achievements.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user.firstName || user.name}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening in your DevHub journey
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Badge variant="secondary" className="text-sm">
              <Activity className="h-3 w-3 mr-1" />
              Member since {new Date(user.registeredAt || user.loginTime).toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Published</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.posts}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +2 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aiCalls}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +5 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messages}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.likes}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +8 this week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Jump into your most common activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link key={index} to={action.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${action.color}`}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-sm">{action.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {action.description}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest interactions and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <Icon className={`h-4 w-4 mt-0.5 ${activity.color}`} />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-foreground">{activity.title}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Progress */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Profile Progress
                </CardTitle>
                <CardDescription>
                  Complete your profile to unlock features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Profile Completion</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Profile photo</span>
                      <Badge variant="secondary" className="text-xs">Done</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Bio description</span>
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Social links</span>
                      <Badge variant="secondary" className="text-xs">Done</Badge>
                    </div>
                  </div>

                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="w-full">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  {completedAchievements} of {achievements.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="w-full bg-muted rounded-full h-2 mb-3">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {achievements.slice(0, 4).map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        achievement.completed ? 'bg-green-500' : 'bg-muted'
                      }`}>
                        {achievement.completed && <Award className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          achievement.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="ghost" size="sm" className="w-full mt-3">
                    View All Achievements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
