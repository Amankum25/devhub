import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings,
  Shield,
  Globe,
  Palette,
  Bell,
  Database,
  Mail,
  Save
} from 'lucide-react';

const AdminSettings = () => {
  const settingsSections = [
    {
      title: 'General Settings',
      icon: Settings,
      settings: [
        { id: 'maintenance', label: 'Maintenance Mode', description: 'Put the platform in maintenance mode', enabled: false },
        { id: 'registration', label: 'User Registration', description: 'Allow new user registrations', enabled: true },
        { id: 'public_profiles', label: 'Public Profiles', description: 'Allow users to have public profiles', enabled: true }
      ]
    },
    {
      title: 'Security Settings',
      icon: Shield,
      settings: [
        { id: 'two_factor', label: 'Require 2FA', description: 'Require two-factor authentication for all users', enabled: false },
        { id: 'password_strength', label: 'Strong Passwords', description: 'Enforce strong password requirements', enabled: true },
        { id: 'session_timeout', label: 'Session Timeout', description: 'Automatic session timeout after inactivity', enabled: true }
      ]
    },
    {
      title: 'Features',
      icon: Globe,
      settings: [
        { id: 'ai_tools', label: 'AI Tools', description: 'Enable AI-powered development tools', enabled: true },
        { id: 'real_time_chat', label: 'Real-time Chat', description: 'Enable chat functionality', enabled: true },
        { id: 'code_snippets', label: 'Code Snippets', description: 'Allow users to share code snippets', enabled: true },
        { id: 'blog_posts', label: 'Blog Posts', description: 'Enable blog posting functionality', enabled: true }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        { id: 'email_notifications', label: 'Email Notifications', description: 'Send email notifications to users', enabled: true },
        { id: 'push_notifications', label: 'Push Notifications', description: 'Send push notifications', enabled: false },
        { id: 'moderation_alerts', label: 'Moderation Alerts', description: 'Alert admins about content requiring moderation', enabled: true }
      ]
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">Configure global platform features and security</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {settingsSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <Card key={sectionIndex}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span>{section.title}</span>
                </CardTitle>
                <CardDescription>
                  {section.title === 'General Settings' && 'Basic platform configuration options'}
                  {section.title === 'Security Settings' && 'Security and authentication settings'}
                  {section.title === 'Features' && 'Enable or disable platform features'}
                  {section.title === 'Notifications' && 'Configure notification preferences'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor={setting.id} className="text-sm font-medium">
                        {setting.label}
                      </Label>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                    <Switch id={setting.id} defaultChecked={setting.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Branding</span>
            </CardTitle>
            <CardDescription>Customize platform appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform_name">Platform Name</Label>
              <Input id="platform_name" defaultValue="DevHub" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex space-x-2">
                <Input id="primary_color" defaultValue="#6366f1" className="w-20" />
                <div className="w-10 h-10 rounded border" style={{ backgroundColor: '#6366f1' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input id="logo_url" placeholder="https://example.com/logo.png" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Email Configuration</span>
            </CardTitle>
            <CardDescription>Configure email delivery settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input id="smtp_host" placeholder="smtp.example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input id="smtp_port" placeholder="587" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_email">From Email</Label>
              <Input id="from_email" placeholder="noreply@devhub.com" />
            </div>
            <Button variant="outline" className="w-full">
              Test Email Configuration
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>System Information</span>
          </CardTitle>
          <CardDescription>Platform status and system details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-sm text-gray-600">System Status</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">v1.2.3</div>
              <p className="text-sm text-gray-600">Platform Version</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">99.9%</div>
              <p className="text-sm text-gray-600">Uptime (30 days)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
