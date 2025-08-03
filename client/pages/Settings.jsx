import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { toast } from "../hooks/use-toast";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Eye,
  Key,
  Globe,
  Palette,
  Monitor,
  Smartphone,
  Mail,
  MessageSquare,
  Users,
  Code,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Save,
  ExternalLink,
  AlertTriangle,
  Check,
  X,
  Info,
} from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    // Appearance
    theme: "light",
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    sidebar: "expanded",

    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    desktopNotifications: true,
    soundEnabled: true,
    notifyNewPosts: true,
    notifyComments: true,
    notifyMentions: true,
    notifyFollowers: false,

    // Privacy
    profileVisibility: "public",
    showEmail: false,
    showActivity: true,
    allowSearch: true,
    allowMessages: true,
    requireFollowApproval: false,

    // Security
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: "7",
    passwordExpiry: "never",

    // Content
    autoSave: true,
    defaultPostVisibility: "public",
    enableMarkdown: true,
    enableCodeHighlighting: true,
    showLineNumbers: true,
    tabSize: "2",

    // Data & Storage
    autoBackup: true,
    backupFrequency: "weekly",
    dataRetention: "1year",
    downloadFormat: "json",
  });

  const [activeDevices] = useState([
    {
      id: 1,
      name: "MacBook Pro",
      browser: "Chrome",
      location: "San Francisco, CA",
      lastActive: "2 minutes ago",
      current: true,
    },
    {
      id: 2,
      name: "iPhone 14",
      browser: "Safari",
      location: "San Francisco, CA",
      lastActive: "1 hour ago",
      current: false,
    },
    {
      id: 3,
      name: "iPad Pro",
      browser: "Safari",
      location: "New York, NY",
      lastActive: "2 days ago",
      current: false,
    },
  ]);

  const [integrations] = useState([
    {
      name: "GitHub",
      connected: true,
      description: "Sync your repositories and contributions",
      icon: Code,
    },
    {
      name: "Google",
      connected: true,
      description: "Sign in with Google account",
      icon: Mail,
    },
    {
      name: "Slack",
      connected: false,
      description: "Get notifications in Slack",
      icon: MessageSquare,
    },
    {
      name: "Discord",
      connected: false,
      description: "Join our Discord community",
      icon: Users,
    },
  ]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = (section) => {
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings saved",
        description: `${section} settings have been updated successfully.`,
      });
    }, 500);
  };

  const handleExportData = () => {
    toast({
      title: "Export started",
      description:
        "Your data export has been initiated. You'll receive an email when it's ready.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description:
        "We've sent you an email with instructions to confirm account deletion.",
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and application settings.
          </p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance & Display</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) =>
                        handleSettingChange("theme", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) =>
                        handleSettingChange("language", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) =>
                        handleSettingChange("timezone", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">
                          Eastern Time (ET)
                        </SelectItem>
                        <SelectItem value="America/Chicago">
                          Central Time (CT)
                        </SelectItem>
                        <SelectItem value="America/Denver">
                          Mountain Time (MT)
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time (PT)
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          London (GMT)
                        </SelectItem>
                        <SelectItem value="Europe/Paris">
                          Paris (CET)
                        </SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) =>
                        handleSettingChange("dateFormat", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("Appearance")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("emailNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("pushNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Desktop Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Native desktop notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.desktopNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("desktopNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sound Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Play sound for notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) =>
                        handleSettingChange("soundEnabled", checked)
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>

                  <div className="flex items-center justify-between">
                    <Label>New Posts</Label>
                    <Switch
                      checked={settings.notifyNewPosts}
                      onCheckedChange={(checked) =>
                        handleSettingChange("notifyNewPosts", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Comments on My Posts</Label>
                    <Switch
                      checked={settings.notifyComments}
                      onCheckedChange={(checked) =>
                        handleSettingChange("notifyComments", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mentions</Label>
                    <Switch
                      checked={settings.notifyMentions}
                      onCheckedChange={(checked) =>
                        handleSettingChange("notifyMentions", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>New Followers</Label>
                    <Switch
                      checked={settings.notifyFollowers}
                      onCheckedChange={(checked) =>
                        handleSettingChange("notifyFollowers", checked)
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("Notification")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Privacy & Visibility</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select
                      value={settings.profileVisibility}
                      onValueChange={(value) =>
                        handleSettingChange("profileVisibility", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          Public - Anyone can view
                        </SelectItem>
                        <SelectItem value="private">
                          Private - Only followers
                        </SelectItem>
                        <SelectItem value="registered">
                          Registered Users Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-gray-500">
                        Display your email on your profile
                      </p>
                    </div>
                    <Switch
                      checked={settings.showEmail}
                      onCheckedChange={(checked) =>
                        handleSettingChange("showEmail", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Activity Status</Label>
                      <p className="text-sm text-gray-500">
                        Let others see when you're active
                      </p>
                    </div>
                    <Switch
                      checked={settings.showActivity}
                      onCheckedChange={(checked) =>
                        handleSettingChange("showActivity", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Search</Label>
                      <p className="text-sm text-gray-500">
                        Allow your profile to appear in search results
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowSearch}
                      onCheckedChange={(checked) =>
                        handleSettingChange("allowSearch", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Direct Messages</Label>
                      <p className="text-sm text-gray-500">
                        Let other users send you direct messages
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowMessages}
                      onCheckedChange={(checked) =>
                        handleSettingChange("allowMessages", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Follow Approval</Label>
                      <p className="text-sm text-gray-500">
                        Manually approve new followers
                      </p>
                    </div>
                    <Switch
                      checked={settings.requireFollowApproval}
                      onCheckedChange={(checked) =>
                        handleSettingChange("requireFollowApproval", checked)
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("Privacy")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.twoFactorEnabled}
                        onCheckedChange={(checked) =>
                          handleSettingChange("twoFactorEnabled", checked)
                        }
                      />
                      <Button variant="outline" size="sm">
                        Setup
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Login Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Get notified of new sign-ins to your account
                      </p>
                    </div>
                    <Switch
                      checked={settings.loginNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("loginNotifications", checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout</Label>
                    <Select
                      value={settings.sessionTimeout}
                      onValueChange={(value) =>
                        handleSettingChange("sessionTimeout", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Active Sessions</h4>
                  <div className="space-y-3">
                    {activeDevices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Monitor className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{device.name}</p>
                            <p className="text-sm text-gray-500">
                              {device.browser} • {device.location}
                            </p>
                            <p className="text-xs text-gray-400">
                              Last active: {device.lastActive}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {device.current && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                          {!device.current && (
                            <Button variant="outline" size="sm">
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Change Password</Button>
                  <Button onClick={() => handleSave("Security")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Settings */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Content & Editor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-save</Label>
                      <p className="text-sm text-gray-500">
                        Automatically save drafts while writing
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoSave}
                      onCheckedChange={(checked) =>
                        handleSettingChange("autoSave", checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Default Post Visibility</Label>
                    <Select
                      value={settings.defaultPostVisibility}
                      onValueChange={(value) =>
                        handleSettingChange("defaultPostVisibility", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Markdown</Label>
                      <p className="text-sm text-gray-500">
                        Use Markdown syntax in posts and comments
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableMarkdown}
                      onCheckedChange={(checked) =>
                        handleSettingChange("enableMarkdown", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Code Syntax Highlighting</Label>
                      <p className="text-sm text-gray-500">
                        Highlight code blocks with syntax colors
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableCodeHighlighting}
                      onCheckedChange={(checked) =>
                        handleSettingChange("enableCodeHighlighting", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Line Numbers</Label>
                      <p className="text-sm text-gray-500">
                        Display line numbers in code blocks
                      </p>
                    </div>
                    <Switch
                      checked={settings.showLineNumbers}
                      onCheckedChange={(checked) =>
                        handleSettingChange("showLineNumbers", checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tab Size</Label>
                    <Select
                      value={settings.tabSize}
                      onValueChange={(value) =>
                        handleSettingChange("tabSize", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 spaces</SelectItem>
                        <SelectItem value="4">4 spaces</SelectItem>
                        <SelectItem value="8">8 spaces</SelectItem>
                        <SelectItem value="tab">Tab character</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("Content")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data & Storage Settings */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Data & Storage</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-gray-500">
                        Automatically backup your data
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) =>
                        handleSettingChange("autoBackup", checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select
                      value={settings.backupFrequency}
                      onValueChange={(value) =>
                        handleSettingChange("backupFrequency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Retention</Label>
                    <Select
                      value={settings.dataRetention}
                      onValueChange={(value) =>
                        handleSettingChange("dataRetention", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 months</SelectItem>
                        <SelectItem value="6months">6 months</SelectItem>
                        <SelectItem value="1year">1 year</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Export & Import</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Export Your Data</Label>
                      <p className="text-sm text-gray-500">
                        Download all your posts, comments, and profile data
                      </p>
                    </div>
                    <Button onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select
                      value={settings.downloadFormat}
                      onValueChange={(value) =>
                        handleSettingChange("downloadFormat", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-red-600">Danger Zone</h4>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-medium text-red-900">
                          Delete Account
                        </h5>
                        <p className="text-sm text-red-700 mt-1">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-3"
                          onClick={handleDeleteAccount}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave("Data")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
