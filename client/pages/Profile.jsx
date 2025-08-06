import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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
import { toast } from "../hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Edit3,
  Camera,
  Save,
  X,
  Shield,
  Bell,
  Eye,
  Key,
  Trash2,
  Code,
  Trophy,
  Star,
  TrendingUp,
  Activity,
  Users,
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Full-stack developer passionate about React, Node.js, and AI. Building the future one line of code at a time.",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    github: "johndoe",
    linkedin: "johndoe",
    twitter: "johndoe",
    company: "TechCorp Inc.",
    position: "Senior Frontend Developer",
    experience: "5+ years",
    skills: [
      "React",
      "JavaScript",
      "TypeScript",
      "Node.js",
      "Python",
      "AWS",
      "Docker",
      "Git",
    ],
    avatar: "/placeholder.svg",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    profileVisibility: "public",
    showActivity: true,
    showEmail: false,
    twoFactorAuth: false,
    language: "en",
    theme: "light",
  });

  const [stats] = useState({
    posts: 24,
    followers: 156,
    following: 89,
    reputation: 1247,
    badges: 8,
    contributions: 127,
  });

  const [activity] = useState([
    {
      type: "post",
      title: 'Created new blog post: "React 18 Best Practices"',
      time: "2 hours ago",
    },
    {
      type: "comment",
      title: 'Commented on "JavaScript Performance Tips"',
      time: "5 hours ago",
    },
    {
      type: "like",
      title: 'Liked "Understanding TypeScript Generics"',
      time: "1 day ago",
    },
    {
      type: "follow",
      title: "Started following Alice Johnson",
      time: "2 days ago",
    },
    {
      type: "snippet",
      title: 'Shared code snippet: "Custom React Hook"',
      time: "3 days ago",
    },
  ]);

  const [achievements] = useState([
    {
      name: "First Post",
      description: "Published your first blog post",
      earned: true,
      date: "2023-01-15",
    },
    {
      name: "Popular Author",
      description: "Received 100+ likes on a post",
      earned: true,
      date: "2023-03-22",
    },
    {
      name: "Code Contributor",
      description: "Shared 10+ code snippets",
      earned: true,
      date: "2023-05-10",
    },
    {
      name: "Community Helper",
      description: "Helped 50+ developers in chat",
      earned: false,
      progress: 35,
    },
    {
      name: "Consistency King",
      description: "Posted for 30 consecutive days",
      earned: false,
      progress: 18,
    },
  ]);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSettingChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSaveProfile = () => {
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    }, 1000);
  };

  const handleAvatarChange = () => {
    // Simulate avatar upload
    toast({
      title: "Avatar updated",
      description: "Your profile picture has been updated.",
    });
  };

  const addSkill = (skill) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-4xl space-y-8">
          <Card className="w-full bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Your Profile</CardTitle>
              <CardDescription className="text-slate-300">
                Manage your personal info, activity, achievements, and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4 bg-slate-700/50 backdrop-blur-xl">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">Profile</TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">Activity</TabsTrigger>
                  <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">Achievements</TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative inline-block">
                      <Avatar className="h-24 w-24 mx-auto border-2 border-purple-400/50 shadow-lg">
                        <AvatarImage src={profileData.avatar} />
                        <AvatarFallback className="text-xl bg-slate-700 text-white">
                          {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 border-slate-600 bg-slate-800/80 hover:bg-slate-700/80" onClick={handleAvatarChange}>
                        <Camera className="h-4 w-4 text-slate-300" />
                      </Button>
                    </div>
                  <h2 className="text-xl font-bold mt-2">{profileData.firstName} {profileData.lastName}</h2>
                  <p className="text-muted-foreground">{profileData.position} at {profileData.company}</p>
                  <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profileData.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{profileData.bio}</p>
                  <div className="flex justify-center space-x-3 mt-2">
                    {profileData.github && (<Button variant="ghost" size="sm" className="p-2"><Github className="h-4 w-4" /></Button>)}
                    {profileData.linkedin && (<Button variant="ghost" size="sm" className="p-2"><Linkedin className="h-4 w-4" /></Button>)}
                    {profileData.twitter && (<Button variant="ghost" size="sm" className="p-2"><Twitter className="h-4 w-4" /></Button>)}
                    {profileData.website && (<Button variant="ghost" size="sm" className="p-2"><Globe className="h-4 w-4" /></Button>)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t w-full">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{stats.posts}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{stats.followers}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{stats.reputation}</div>
                      <div className="text-xs text-muted-foreground">Reputation</div>
                    </div>
                  </div>
                </div>
                <Card className="mt-8">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <Button variant={isEditing ? "outline" : "default"} size="sm" onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? (<X className="h-4 w-4 mr-2" />) : (<Edit3 className="h-4 w-4 mr-2" />)}
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={profileData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} disabled={!isEditing} />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={profileData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} disabled={!isEditing} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={profileData.email} onChange={(e) => handleInputChange("email", e.target.value)} disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" value={profileData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} disabled={!isEditing} rows={3} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" value={profileData.company} onChange={(e) => handleInputChange("company", e.target.value)} disabled={!isEditing} />
                      </div>
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" value={profileData.position} onChange={(e) => handleInputChange("position", e.target.value)} disabled={!isEditing} />
                      </div>
                    </div>
                    <div>
                      <Label>Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {skill}
                            {isEditing && (<button onClick={() => removeSkill(skill)} className="ml-2 text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button>)}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <Input placeholder="Add a skill and press Enter" className="mt-2" onKeyDown={(e) => {if (e.key === "Enter") {addSkill(e.target.value);e.target.value = "";}}} />
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSaveProfile}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activity.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <Activity className="h-5 w-5 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${achievement.earned ? "bg-yellow-50 border-yellow-200" : "bg-muted border-muted-foreground"}`}>
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${achievement.earned ? "bg-yellow-100" : "bg-muted"}`}>
                              <Trophy className={`h-5 w-5 ${achievement.earned ? "text-yellow-600" : "text-muted-foreground"}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{achievement.name}</h4>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              {achievement.earned ? (
                                <p className="text-xs text-green-600 mt-1">Earned on {achievement.date}</p>
                              ) : (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{achievement.progress}/50</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                                    <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{width: `${(achievement.progress / 50) * 100}%`}}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive email updates about your activity</p>
                        </div>
                        <Switch id="email-notifications" checked={settings.emailNotifications} onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                        </div>
                        <Switch id="push-notifications" checked={settings.pushNotifications} onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-activity">Show Activity</Label>
                          <p className="text-sm text-muted-foreground">Make your activity visible to other users</p>
                        </div>
                        <Switch id="show-activity" checked={settings.showActivity} onCheckedChange={(checked) => handleSettingChange("showActivity", checked)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-visibility">Profile Visibility</Label>
                        <Select value={settings.profileVisibility} onValueChange={(value) => handleSettingChange("profileVisibility", value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="friends">Friends Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <h4 className="font-medium text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-700 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                        <Button variant="destructive" size="sm" className="mt-3"><Trash2 className="h-4 w-4 mr-2" />Delete Account</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
