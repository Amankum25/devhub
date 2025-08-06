import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { api } from '../lib/api';

const DeepSeekSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      const response = await api.get('/deepseek/check-api-key');
      setHasApiKey(response.data.hasApiKey);
    } catch (error) {
      console.error('Error checking API key status:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/deepseek/set-api-key', { apiKey: apiKey.trim() });
      setHasApiKey(true);
      setApiKey('');
      toast({
        title: "Success",
        description: "DeepSeek API key saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveApiKey = async () => {
    setIsLoading(true);
    try {
      await api.delete('/deepseek/remove-api-key');
      setHasApiKey(false);
      toast({
        title: "Success",
        description: "DeepSeek API key removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white">DeepSeek API Configuration</CardTitle>
        <CardDescription className="text-gray-300">
          Configure your DeepSeek API key to enable AI features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasApiKey ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div>
                <p className="text-green-300 font-medium">API Key Active</p>
                <p className="text-green-400/80 text-sm">All AI features are enabled</p>
              </div>
              <Button 
                onClick={handleRemoveApiKey}
                disabled={isLoading}
                variant="destructive"
                size="sm"
              >
                Remove Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-white">DeepSeek API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your DeepSeek API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-black/30 border-purple-500/30 text-white placeholder:text-gray-400"
              />
            </div>
            <Button 
              onClick={handleSaveApiKey}
              disabled={isLoading || !apiKey.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? 'Saving...' : 'Save API Key'}
            </Button>
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Need an API key?</strong> Get one from{' '}
                <a 
                  href="https://platform.deepseek.com/api_keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  DeepSeek Platform
                </a>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeepSeekSettings;
