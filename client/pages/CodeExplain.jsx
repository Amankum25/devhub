import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Play, 
  Copy, 
  Check, 
  Code, 
  BookOpen, 
  Lightbulb, 
  AlertCircle, 
  Loader2,
  Cpu,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { api } from '../lib/api';

const CodeExplain = () => {
  const [code, setCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleExplain = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setError(null); // Clear any previous errors
    setResult(null); // Clear previous results
    
    console.log('Starting code explanation request...');

    try {
      const response = await api.post('/gemini/explain-code', {
        code: code.trim()
      });

      console.log('API Response received:', response); // Debug log
      console.log('Response structure:', {
        hasResponse: !!response,
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : [],
        success: response?.data?.success,
        hasDataField: !!response?.data?.data,
        dataType: typeof response?.data?.data,
        dataLength: response?.data?.data ? response.data.data.length : 0,
        rawData: response?.data?.data ? response.data.data.substring(0, 200) + '...' : 'No data'
      });

      if (!response) {
        setResult(null);
        setError("No response received from server. Please try again later.");
        return;
      }

      // Handle direct response format (response.data)
      if (response.data && typeof response.data === 'string') {
        setError(null);
        setResult(response.data);
        console.log('Using direct response.data format');
        return;
      }

      // Handle nested response format (response.data.data)
      if (response.data && response.data.data && typeof response.data.data === 'string') {
        setError(null);
        setResult(response.data.data);
        console.log('Using nested response.data.data format');
        
        if (response.data.data.includes('API Fallback Mode')) {
          console.log('Using fallback mode due to API service issues');
        }
        return;
      }

      // Handle success flag check
      if (response.data && response.data.success && response.data.data) {
        setError(null);
        setResult(response.data.data);
        console.log('Using success flag format');
        
        if (response.data.data.includes('API Fallback Mode')) {
          console.log('Using fallback mode due to API service issues');
        }
        return;
      }

      // If none of the above worked, show error
      console.log('No valid data format found');
      setError(response.data?.message || response.message || "Failed to explain code");
    } catch (error) {
      console.error('Error explaining code:', error);
      console.error('Error details:', error.response);
      
      if (error.response) {
        // Server responded with error status
        setError(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        setError("No response from server. Please check your connection.");
      } else {
        // Something else happened
        setError("Failed to explain code. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setCode("");
    setResult(null);
    setError("");
  };

  // Test function to verify UI works
  const handleTest = () => {
    setResult("🧪 **Test Response**\n\nThis is a test to verify the UI is working correctly. If you can see this text, the display component is functioning properly.\n\n**Code Analysis:**\n- The response handling is working\n- The UI components are rendering correctly\n- The state management is functioning\n\nNow let's try the actual code explanation!");
    setError(null);
  };

  const exampleCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-lg">
              <Code className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Code Explainer
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Get AI-powered explanations for any code snippet in multiple programming languages
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Code className="h-5 w-5 text-purple-400" />
              Code Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-300">
                Paste your code here:
              </label>
              <Textarea
                placeholder="Enter your code snippet..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[250px] font-mono text-sm bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCode(exampleCode)}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Try Example Code
            </Button>

            {error && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleExplain}
                disabled={isAnalyzing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Explain Code
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={isAnalyzing}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                title="Test UI Display"
              >
                Test
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isAnalyzing}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-400" />
                Code Explanation
              </span>
              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="ml-2 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                <div className="text-slate-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {result}
                </div>
              </div>
            ) : error ? (
              <Alert className="border-red-500/50 bg-red-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your code and click "Explain Code" to get detailed explanations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-6 text-center text-white">
          Code Explainer Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Code className="h-5 w-5 text-blue-400" />
                Multi-language Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Support for JavaScript, Python, Java, C++, and many other programming languages
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5 text-green-400" />
                Line-by-line Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Get detailed explanations of what each part of your code does
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Best Practices Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Learn coding best practices and suggestions for improvement
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CodeExplain;
