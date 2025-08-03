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
  AlertCircle, 
  Loader2,
  Code,
  Bug
} from "lucide-react";

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
      // Combine code and bug description with separator
      const input = `${code}|SEPARATOR|${bugDescription}`;
      
      const response = await fetch("/api/ai/interact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          tool: "bug_fix",
          input: input,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || "Failed to analyze code");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Bug fix error:", err);
    } finally {
      setIsAnalyzing(false);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <Wrench className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Bug Fixer
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                    {result.output}
                  </pre>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {result.tokensUsed} tokens used
                    </Badge>
                    <span>Processed in {result.processingTime}ms</span>
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
              <p className="text-muted-foreground">
                Learn better coding practices and patterns to avoid similar issues in the future
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
