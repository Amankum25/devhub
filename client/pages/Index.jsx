import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Bot, 
  MessageSquare, 
  BookOpen, 
  Zap, 
  Users, 
  Star,
  Github,
  ArrowRight,
  Sparkles,
  Brain,
  FileCode,
  Share2
} from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Tools',
      description: 'Code explanation, bug fixing, resume review, and project suggestions powered by advanced AI.',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: BookOpen,
      title: 'Developer Blog',
      description: 'Share your knowledge, learn from others, and build your developer brand.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Code,
      title: 'Code Snippets',
      description: 'Save, share, and discover useful code snippets across multiple programming languages.',
      gradient: 'from-green-500 to-blue-500'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Connect with fellow developers, get help, and collaborate in real-time.',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { label: 'Active Developers', value: '10K+', icon: Users },
    { label: 'Code Snippets', value: '50K+', icon: FileCode },
    { label: 'AI Interactions', value: '1M+', icon: Brain },
    { label: 'Projects Shared', value: '25K+', icon: Share2 }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Full Stack Developer',
      content: 'DevHub\'s AI tools have revolutionized my coding workflow. The code explainer saves me hours!',
      avatar: '👩‍💻'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Software Engineer',
      content: 'The community here is incredible. I\'ve learned so much from the shared snippets and discussions.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emily Johnson',
      role: 'Frontend Developer',
      content: 'Perfect platform for sharing knowledge and getting help. The AI resume reviewer helped me land my dream job!',
      avatar: '👩‍🎓'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Now with AI-Powered Features
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Build, Learn, Share
              <br />
              with AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The ultimate platform for developers to collaborate, learn, and grow. 
              Powered by AI to supercharge your development workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/ai-tools">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Bot className="mr-2 h-4 w-4" />
                  Try AI Tools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to excel as a developer
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From AI-powered coding assistance to community collaboration, 
              we've got all the tools to accelerate your growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by developers worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community has to say about DevHub
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"></div>
            <CardContent className="relative p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to supercharge your development?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of developers who are already using DevHub to build better, learn faster, and share more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Zap className="mr-2 h-4 w-4" />
                    Get Started Today
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
