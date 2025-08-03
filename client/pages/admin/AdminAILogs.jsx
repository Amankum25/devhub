import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Bot, User, Clock, TrendingUp, FileText } from "lucide-react";

const AdminAILogs = () => {
  const logs = [
    {
      id: 1,
      user: "John Doe",
      tool: "Code Explainer",
      prompt: "Explain this React component...",
      response: "This React component is a functional component that...",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      user: "Jane Smith",
      tool: "Resume Review",
      prompt: "Review my software engineer resume",
      response: "Your resume shows strong technical skills...",
      time: "3 hours ago",
      status: "completed",
    },
    {
      id: 3,
      user: "Alice Johnson",
      tool: "Project Suggestions",
      prompt: "Suggest projects for React and Node.js",
      response: "Here are 5 project ideas for your skill level...",
      time: "5 hours ago",
      status: "completed",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Assistant Logs</h1>
        <p className="text-gray-600 mt-2">Track AI usage and interactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">1,245</div>
            <p className="text-sm text-blue-600 font-medium">
              Total Interactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">89</div>
            <p className="text-sm text-green-600 font-medium">Today's Usage</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">4.2s</div>
            <p className="text-sm text-purple-600 font-medium">
              Avg Response Time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">98.5%</div>
            <p className="text-sm text-orange-600 font-medium">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent AI Interactions</CardTitle>
            <CardDescription>Latest AI assistant usage logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {log.user}
                        </span>
                        <Badge variant="outline">{log.tool}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Prompt:</p>
                          <p className="text-sm text-gray-700">{log.prompt}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Response:
                          </p>
                          <p className="text-sm text-gray-700 truncate">
                            {log.response}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3" />
                        {log.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular AI Tools</CardTitle>
            <CardDescription>Most used AI features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Code Explainer", usage: 345, growth: "+12%" },
                { name: "Resume Review", usage: 234, growth: "+8%" },
                { name: "Project Suggestions", usage: 189, growth: "+15%" },
                { name: "Bug Fixer", usage: 156, growth: "+5%" },
              ].map((tool, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {tool.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tool.usage} uses this month
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      {tool.growth}
                    </span>
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

export default AdminAILogs;
