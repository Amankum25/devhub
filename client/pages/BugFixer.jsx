import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wrench, 
  Play, 
  Copy, 
  Check, 
  CheckCircle,
  AlertCircle, 
  Loader2,
  Code,
  Bug,
  Zap
} from "lucide-react";
import { api } from '../lib/api';

export default function BugFixer() {
  const [code, setCode] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError("Please enter some code to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      console.log('Sending bug fix request...', {
        code: code.substring(0, 100) + '...',
        language: 'javascript',
        errorMessage: bugDescription
      });

      const response = await api.post('/gemini/fix-bugs', {
        code,
        language: 'javascript',
        errorMessage: bugDescription
      });

      console.log('Bug fix response received:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      // Handle the new structured response format
      if (response.success && (response.analysis || response.fixedCode)) {
        console.log('Response has structured data...');
        
        const analysisData = {
          success: true,
          output: response.fixedCode || code,
          explanation: response.analysis || 'Code analysis completed',
          suggestions: response.suggestions || ['No specific suggestions provided'],
          issues: response.issues || [],
          improvements: response.improvements || ['No specific improvements identified']
        };
        
        setResult(analysisData);
        console.log('Structured analysis set successfully:', analysisData);
        return;
      }

      // Handle legacy response formats
      let analysisData = null;
      const responseData = response.data || response;
      
      if (typeof responseData === 'string') {
        console.log('Response is string, parsing...');
        analysisData = parseAnalysisFromString(responseData);
      } else if (responseData.analysis || responseData.fixedCode || responseData.explanation) {
        console.log('Response has analysis data...');
        analysisData = {
          explanation: responseData.analysis || responseData.explanation || '',
          fixedCode: responseData.fixedCode || responseData.fixed_code || '',
          suggestions: responseData.suggestions || [],
          issues: responseData.issues || []
        };
      } else if (responseData.choices && responseData.choices[0]) {
        console.log('Response has choices format...');
        const content = responseData.choices[0].message?.content || responseData.choices[0].text;
        analysisData = parseAnalysisFromString(content);
      } else {
        console.log('Response format not recognized, treating as string...');
        analysisData = parseAnalysisFromString(JSON.stringify(responseData));
      }

      if (analysisData) {
        // Transform the analysis data to match the existing component structure
        setResult({
          success: true,
          output: analysisData.fixedCode,
          explanation: analysisData.explanation,
          suggestions: analysisData.suggestions,
          issues: analysisData.issues
        });
        console.log('Legacy analysis set successfully:', analysisData);
      } else {
        throw new Error('Could not parse analysis from response');
      }

    } catch (err) {
      setError(err.message || "Network error. Please try again.");
      console.error("Bug fix error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseAnalysisFromString = (text) => {
    console.log('Parsing analysis from text:', text.substring(0, 200) + '...');
    
    try {
      // Try to extract sections from the text
      const lines = text.split('\n');
      let explanation = '';
      let fixedCode = '';
      let suggestions = [];
      let issues = [];
      
      let currentSection = 'explanation';
      let codeStarted = false;
      
      for (let line of lines) {
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('fixed code') || lowerLine.includes('corrected code') || lowerLine.includes('solution')) {
          currentSection = 'code';
          codeStarted = false;
          continue;
        } else if (lowerLine.includes('suggestions') || lowerLine.includes('recommendations')) {
          currentSection = 'suggestions';
          continue;
        } else if (lowerLine.includes('issues') || lowerLine.includes('problems') || lowerLine.includes('bugs')) {
          currentSection = 'issues';
          continue;
        }
        
        if (currentSection === 'explanation' && !lowerLine.includes('```')) {
          explanation += line + '\n';
        } else if (currentSection === 'code') {
          if (line.includes('```')) {
            codeStarted = !codeStarted;
            continue;
          }
          if (codeStarted || (!line.includes('```') && line.trim())) {
            fixedCode += line + '\n';
          }
        } else if (currentSection === 'suggestions' && line.trim() && !line.includes('```')) {
          if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
            suggestions.push(line.replace(/^[-•\d.]\s*/, '').trim());
          }
        } else if (currentSection === 'issues' && line.trim() && !line.includes('```')) {
          if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
            issues.push({ 
              type: 'error', 
              message: line.replace(/^[-•\d.]\s*/, '').trim(),
              line: 0 
            });
          }
        }
      }
      
      return {
        explanation: explanation.trim() || text,
        fixedCode: fixedCode.trim() || code,
        suggestions: suggestions.length > 0 ? suggestions : ['Check the analysis above for improvement suggestions'],
        issues: issues.length > 0 ? issues : []
      };
    } catch (e) {
      console.error('Error parsing analysis:', e);
      return {
        explanation: text,
        fixedCode: code,
        suggestions: ['Check the analysis above for improvement suggestions'],
        issues: []
      };
    }
  };

  const handleCopy = () => {
    if (result?.output) {
      navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setCode("");
    setBugDescription("");
    setResult(null);
    setError("");
  };

  // Test function for debugging
  const testDisplay = () => {
    const testAnalysis = {
      success: true,
      output: `// Fixed JavaScript code with improvements
function calculateTotal(items) {
  // Input validation added
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  // Use reduce for better performance and readability
  return items.reduce((total, item) => {
    // Handle null/undefined items gracefully
    const price = parseFloat(item?.price) || 0;
    const quantity = parseInt(item?.quantity) || 0;
    return total + (price * quantity);
  }, 0);
}

// Added error handling for API calls
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}`,
      explanation: `**Code Analysis Complete!**

The original code had several issues that have been identified and fixed:

**Issues Found:**
- Missing input validation for array parameters
- No error handling for API calls
- Potential null reference errors
- Inefficient loop usage instead of array methods

**Analysis:**
Your code structure was good, but needed some defensive programming practices and modern JavaScript improvements. The main function lacked input validation which could cause runtime errors with invalid data.`,
      suggestions: [
        "Always validate function parameters, especially arrays and objects",
        "Use modern JavaScript array methods like reduce() for better performance",
        "Add proper error handling for all async operations",
        "Consider using TypeScript for better type safety",
        "Add JSDoc comments for better code documentation",
        "Implement unit tests to catch bugs early"
      ],
      issues: [
        { type: 'error', message: 'Missing input validation could cause runtime errors', line: 1 },
        { type: 'warning', message: 'No error handling for async operations', line: 12 },
        { type: 'info', message: 'Consider using more modern JavaScript features', line: 5 }
      ],
      improvements: [
        "Added comprehensive input validation to prevent runtime errors",
        "Implemented proper error handling for async API calls",
        "Replaced traditional for loop with reduce() for better performance",
        "Added null-safe property access using optional chaining",
        "Improved code readability with better variable names and comments",
        "Added proper HTTP status code checking for API responses"
      ]
    };
    setResult(testAnalysis);
    console.log('Enhanced test analysis set:', testAnalysis);
  };

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
            <div className="p-3 bg-red-500/20 backdrop-blur-xl rounded-xl border border-red-500/30 shadow-lg">
              <Wrench className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Bug Fixer
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Get AI-powered solutions for common programming issues and bugs
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Paste your code here:
              </label>
              <Textarea
                placeholder="Enter your code that has a bug..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Bug Description (Optional):
              </label>
              <Textarea
                placeholder="Describe the bug or issue you're experiencing..."
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bug className="h-4 w-4 mr-2" />
                    Fix Bug
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button variant="outline" onClick={testDisplay} className="bg-green-600 hover:bg-green-700 text-white">
                Test Display
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Bug Fix Results
              </span>
              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="ml-2"
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
              <div className="space-y-6">
                {/* Explanation Section */}
                {result.explanation && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Analysis
                    </h4>
                    <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                      {result.explanation}
                    </div>
                  </div>
                )}

                {/* Fixed Code Section */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Fixed Code
                  </h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                      {result.output}
                    </pre>
                  </div>
                </div>

                {/* Improvements Section */}
                {result.improvements && result.improvements.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Improvements Made
                    </h4>
                    <ul className="space-y-2">
                      {result.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions Section */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Additional Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-purple-800 dark:text-purple-200 flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Issues Section */}
                {result.issues && result.issues.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Issues Found
                    </h4>
                    <ul className="space-y-2">
                      {result.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">{issue.type}:</span> {issue.message}
                            {issue.line > 0 && <span className="text-xs opacity-75"> (Line {issue.line})</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {result.tokensUsed || 'N/A'} tokens used
                    </Badge>
                    <span>Processed in {result.processingTime || 'N/A'}ms</span>
                  </div>
                  {result.model && (
                    <Badge variant="outline">{result.model}</Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your code and click "Fix Bug" to get AI-powered solutions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-6 text-center">
          Bug Fixer Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Error Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automatically identify syntax errors, logic issues, and common programming mistakes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-500" />
                Smart Fixes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get corrected code with explanations of what was wrong and how it was fixed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5 text-green-500" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Learn better coding practices and patterns to avoid similar issues in the future
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}
