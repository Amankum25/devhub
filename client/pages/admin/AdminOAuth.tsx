import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Key,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Activity
} from 'lucide-react';

const AdminOAuth = () => {
  const oauthClients = [
    {
      id: 1,
      name: 'DevHub Mobile App',
      clientId: 'devhub_mobile_***',
      type: 'Native Application',
      status: 'active',
      created: '2023-01-15',
      lastUsed: '2 hours ago',
      requests: 1250
    },
    {
      id: 2,
      name: 'VS Code Extension',
      clientId: 'vscode_ext_***',
      type: 'Desktop Application',
      status: 'active',
      created: '2023-03-20',
      lastUsed: '1 day ago',
      requests: 890
    },
    {
      id: 3,
      name: 'Third-party Analytics',
      clientId: 'analytics_***',
      type: 'Web Application',
      status: 'suspended',
      created: '2023-02-10',
      lastUsed: '1 week ago',
      requests: 234
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Native Application':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Native</Badge>;
      case 'Web Application':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Web</Badge>;
      case 'Desktop Application':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Desktop</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OAuth Clients</h1>
          <p className="text-gray-600 mt-2">Manage third-party application access</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New OAuth Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-sm text-blue-600 font-medium">Total Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">8</div>
            <p className="text-sm text-green-600 font-medium">Active Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">2.4K</div>
            <p className="text-sm text-purple-600 font-medium">API Requests Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">99.2%</div>
            <p className="text-sm text-orange-600 font-medium">Uptime</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Applications</CardTitle>
          <CardDescription>OAuth clients with access to your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Application</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Client ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Last Used</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Requests</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {oauthClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <Key className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {client.clientId}
                        </code>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getTypeBadge(client.type)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {client.created}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Activity className="h-4 w-4 mr-1" />
                        {client.lastUsed}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {client.requests.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center space-x-1 justify-end">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <EyeOff className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default AdminOAuth;
