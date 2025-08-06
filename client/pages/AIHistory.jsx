import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';

export default function AIHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data. In the future, you can implement actual API call
      // const response = await api.get('/api/ai/history');
      // setHistory(response.data);
      
      // Mock data for demonstration
      const mockHistory = [
        {
          id: 1,
          tool: 'Code Explainer',
          query: 'Explain this React component',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'completed'
        },
        {
          id: 2,
          tool: 'Resume Review',
          query: 'Review my software engineer resume',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'completed'
        },
        {
          id: 3,
          tool: 'Bug Fixer',
          query: 'Fix TypeError in React app',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          status: 'completed'
        }
      ];
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      // await api.delete(`/api/ai/history/${id}`);
      setHistory(history.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  const getToolPath = (toolName) => {
    const toolPaths = {
      'Code Explainer': '/ai/code-explain',
      'Resume Review': '/ai/resume-review',
      'Bug Fixer': '/ai/bug-fixer',
      'Code Generator': '/ai/code-generator',
      'Project Suggestions': '/ai/project-suggest',
      'Algorithm Helper': '/ai/algorithm-helper'
    };
    return toolPaths[toolName] || '/ai';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/ai" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Tools History</h1>
            <p className="text-gray-600 mt-1">View and manage your AI tool interactions</p>
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No History Yet</h3>
              <p className="text-gray-500 mb-6">Start using AI tools to see your interaction history here</p>
              <Link to="/ai">
                <Button>
                  Explore AI Tools
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{item.tool}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {item.query}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={getToolPath(item.tool)}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteHistoryItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {formatTime(item.timestamp)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
