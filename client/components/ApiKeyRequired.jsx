import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Key, Settings } from 'lucide-react';
import { api } from '../lib/api';

const ApiKeyRequired = ({ children, toolName }) => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const response = await api.get('/gemini/check-api-key');
      setHasApiKey(response.data.hasApiKey);
    } catch (error) {
      console.error('Error checking API key status:', error);
      setHasApiKey(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-6">
        <div className="max-w-2xl mx-auto pt-20">
          <div className="text-center mb-8">
            <Key className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">{toolName}</h1>
            <p className="text-gray-300">AI-powered tool to enhance your development workflow</p>
          </div>

          <Alert className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 mb-6">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-200">
              <strong>API Key Required:</strong> You need to configure your Gemini API key to use this tool.
            </AlertDescription>
          </Alert>

          <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-purple-900/80 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Getting Started</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Google AI Studio</a></li>
              <li>Go to Settings → AI Configuration</li>
              <li>Enter your API key and save</li>
              <li>Return here to start using the tool</li>
            </ol>
          </div>

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/settings')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure API Key
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/ai-tools')}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              Back to AI Tools
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ApiKeyRequired;
