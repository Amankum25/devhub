import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Target, 
  Brain, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2,
  BookOpen,
  Zap,
  TrendingUp,
  Clock
} from "lucide-react";
import { api } from '../lib/api';

export default function AlgorithmHelper() {
  const [algorithmName, setAlgorithmName] = useState("");
  const [problemType, setProblemType] = useState("");
  const [context, setContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!algorithmName.trim()) {
      setError("Please specify the algorithm you want to learn about");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post('/gemini/explain-algorithm', {
        algorithmName: algorithmName.trim(),
        problemType: problemType.trim(),
        context: context.trim()
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
              explanation: response.data,
              complexity: "Analysis not available",
              useCases: "Not specified"
            };
          }
        }
        setResult(parsedResult);
      } else {
        setError(response.message || "Failed to analyze algorithm");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Algorithm analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (result?.explanation) {
      navigator.clipboard.writeText(result.explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setAlgorithmName("");
    setProblemType("");
    setContext("");
    setResult(null);
    setError("");
  };

  const exampleProblems = [
    {
      algorithmName: "Binary Search",
      problemType: "Search Algorithm",
      context: "Finding elements in sorted arrays efficiently"
    },
    {
      algorithmName: "Quick Sort",
      problemType: "Sorting Algorithm", 
      context: "Divide and conquer approach to sorting"
    },
    {
      algorithmName: "Dijkstra's Algorithm",
      problemType: "Graph Algorithm",
      context: "Finding shortest paths in weighted graphs"
    },
    {
      algorithmName: "Dynamic Programming",
      problemType: "Problem-solving Technique",
      context: "Fibonacci sequence and memoization"
    },
    {
      algorithmName: "Breadth-First Search",
      problemType: "Graph Traversal",
      context: "Level-order traversal and shortest path in unweighted graphs"
    },
    {
      algorithmName: "Merge Sort",
      problemType: "Sorting Algorithm",
      context: "Stable sorting with guaranteed O(n log n) time complexity"
    }
  ];

  const handleExampleClick = (example) => {
    setAlgorithmName(example.algorithmName);
    setProblemType(example.problemType);
    setContext(example.context);
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
            <div className="p-3 bg-indigo-500/20 backdrop-blur-xl rounded-xl border border-indigo-500/30 shadow-lg">
              <Target className="h-8 w-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Algorithm Helper
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Understand complex algorithms with step-by-step explanations and optimized solutions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Algorithm Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Algorithm Name: *
              </label>
              <Textarea
                placeholder="e.g., Binary Search, Quick Sort, Dijkstra's Algorithm..."
                value={algorithmName}
                onChange={(e) => setAlgorithmName(e.target.value)}
                className="min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Problem Type (optional):
                </label>
                <Textarea
                  placeholder="e.g., Sorting, Graph, Dynamic Programming..."
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Context (optional):
                </label>
                <Textarea
                  placeholder="e.g., For finding shortest paths, array sorting..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </div>

            {/* Example Problems */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Or try these examples:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {exampleProblems.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="text-left justify-start h-auto p-3 text-sm"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-medium">{example.algorithmName}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {example.problemType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {example.context}
                        </span>
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
                    <Target className="h-4 w-4 mr-2" />
                    Get Algorithm Help
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Algorithm Solution
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
                {/* Algorithm Explanation */}
                {result.explanation && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-blue-400">Algorithm Explanation</h4>
                    <div className="p-4 bg-muted rounded-lg border-l-4 border-blue-500">
                      <div className="text-sm whitespace-pre-wrap text-blue-100">
                        {result.explanation}
                      </div>
                    </div>
                  </div>
                )}

                {/* Time/Space Complexity */}
                {result.complexity && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-green-400">Time & Space Complexity</h4>
                    <div className="p-4 bg-muted rounded-lg border-l-4 border-green-500">
                      <div className="text-sm whitespace-pre-wrap text-green-100">
                        {result.complexity}
                      </div>
                    </div>
                  </div>
                )}

                {/* Implementation */}
                {result.implementation && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-purple-400">Implementation Examples</h4>
                    <div className="p-4 bg-muted rounded-lg border-l-4 border-purple-500">
                      <pre className="text-sm whitespace-pre-wrap font-mono text-purple-100">
                        {result.implementation}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Use Cases */}
                {result.useCases && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-yellow-400">Use Cases & Applications</h4>
                    <div className="p-4 bg-muted rounded-lg border-l-4 border-yellow-500">
                      <div className="text-sm whitespace-pre-wrap text-yellow-100">
                        {result.useCases}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step by Step */}
                {result.stepByStep && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-orange-400">Step-by-Step Process</h4>
                    <div className="p-4 bg-muted rounded-lg border-l-4 border-orange-500">
                      <div className="text-sm whitespace-pre-wrap text-orange-100">
                        {result.stepByStep}
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual Explanation */}
                {result.visualExplanation && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-indigo-400">Visual Explanation</h4>
                    <div className="p-4 bg-muted rounded-lg border-l-4 border-indigo-500">
                      <div className="text-sm whitespace-pre-wrap text-indigo-100">
                        {result.visualExplanation}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                {result.notes && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-pink-400">Additional Notes</h4>
                    <div className="p-4 bg-muted rounded-lg border-l-4 border-pink-500">
                      <div className="text-sm whitespace-pre-wrap text-pink-100">
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
                      <span>Processed in {result.processingTime}ms</span>
                    )}
                  </div>
                  {result.model && (
                    <Badge variant="outline">{result.model}</Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Specify an algorithm to get comprehensive explanations with complexity analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-6 text-center">
          Algorithm Helper Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Step-by-Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get detailed breakdowns of algorithm logic and implementation steps
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Complexity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Understand time and space complexity with Big O notation explanations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Optimizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Learn how to optimize algorithms for better performance and efficiency
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Alternative Approaches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Explore different algorithmic approaches and when to use each one
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}
