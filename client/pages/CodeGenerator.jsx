import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, 
  Code, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Terminal,
  Lightbulb
} from "lucide-react";
import { api } from '../lib/api';

export default function CodeGenerator() {
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [framework, setFramework] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please describe what code you want to generate");
      return;
    }

    setIsGenerating(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post('/gemini/generate-code', {
        description: description.trim(),
        language: language.trim(),
        framework: framework.trim()
      }, false); // Don't include authentication

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.success) {
        // Parse the structured response
        let parsedResult = response.data;
        if (typeof response.data === 'string') {
          try {
            // Try to parse if it's a JSON string
            parsedResult = JSON.parse(response.data);
          } catch (e) {
            // If not JSON, treat as plain text
            parsedResult = { 
              code: response.data,
              explanation: "Generated code",
              setup: "No specific setup required"
            };
          }
        }
        setResult(parsedResult);
      } else {
        setError(response.message || "Failed to generate code");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Code generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setDescription("");
    setLanguage("");
    setFramework("");
    setResult(null);
    setError("");
  };

  const examplePrompts = [
    {
      description: "Create a React component for a user profile card with avatar and details",
      language: "JavaScript",
      framework: "React"
    },
    {
      description: "Generate a Python function to calculate factorial recursively with error handling",
      language: "Python",
      framework: ""
    },
    {
      description: "Write a JavaScript function to validate email addresses using regex",
      language: "JavaScript",
      framework: ""
    },
    {
      description: "Create a REST API endpoint for user authentication with JWT tokens",
      language: "JavaScript",
      framework: "Node.js/Express"
    },
    {
      description: "Generate a CSS animation for a loading spinner with smooth transitions",
      language: "CSS",
      framework: ""
    },
    {
      description: "Create a Python class for database connection with error handling",
      language: "Python",
      framework: "SQLAlchemy"
    }
  ];

  const handleExampleClick = (example) => {
    setDescription(example.description);
    setLanguage(example.language);
    setFramework(example.framework);
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
            <div className="p-3 bg-yellow-500/20 backdrop-blur-xl rounded-xl border border-yellow-500/30 shadow-lg">
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Code Generator
          </h1>
        </div>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Generate boilerplate code, functions, and components from natural language descriptions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Terminal className="h-5 w-5 text-purple-400" />
              Code Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-300">
                Describe what code you want to generate: *
              </label>
              <Textarea
                placeholder="Example: Create a React component for a todo list with add, delete, and toggle functionality..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-300">
                  Programming Language (optional):
                </label>
                <Textarea
                  placeholder="e.g., JavaScript, Python, Java, C++, etc."
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-300">
                  Framework/Library (optional):
                </label>
                <Textarea
                  placeholder="e.g., React, Node.js, Django, Spring Boot, etc."
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </div>

            {/* Example Prompts */}
            <div>
              <label className="text-sm font-medium mb-2 block text-slate-300">
                Or try these examples:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {examplePrompts.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="text-left justify-start h-auto p-3 text-sm"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span>{example.description}</span>
                      <div className="flex gap-2">
                        {example.language && (
                          <Badge variant="secondary" className="text-xs">
                            {example.language}
                          </Badge>
                        )}
                        {example.framework && (
                          <Badge variant="outline" className="text-xs">
                            {example.framework}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-400" />
                Generated Code
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
              <div className="space-y-6">
                {/* Code Section */}
                {result.code && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">Generated Code</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Code
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                      <pre className="text-slate-200 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-x-auto">
                        {result.code}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Setup Instructions */}
                {result.setup && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-white">Setup Instructions</h4>
                    <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                      <div className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
                        {result.setup}
                      </div>
                    </div>
                  </div>
                )}

                {/* Usage Examples */}
                {result.usage && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-white">Usage Examples</h4>
                    <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                      <div className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
                        {result.usage}
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {result.explanation && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-white">Code Explanation</h4>
                    <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                      <div className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
                        {result.explanation}
                      </div>
                    </div>
                  </div>
                )}

                {/* Best Practices */}
                {result.bestPractices && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-white">Best Practices</h4>
                    <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                      <div className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
                        {result.bestPractices}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                {result.notes && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-white">Additional Notes</h4>
                    <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                      <div className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
                        {result.notes}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-4">
                    {result.tokensUsed && (
                      <Badge variant="secondary">
                        {result.tokensUsed} tokens used
                      </Badge>
                    )}
                    {result.processingTime && (
                      <span>Generated in {result.processingTime}ms</span>
                    )}
                  </div>
                  {result.model && (
                    <Badge variant="outline">{result.model}</Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Describe your requirements to generate complete code with setup instructions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-6 text-center text-white">
          Code Generator Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Multi-language Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Generate code in JavaScript, Python, React, Node.js, and many other languages
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Code className="h-5 w-5 text-blue-500" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Generated code follows industry standards and best practices
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Detailed Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Code includes helpful comments and explanations for better understanding
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}
