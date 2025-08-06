import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Lightbulb, 
  Rocket, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2,
  Target,
  Code2,
  Sparkles
} from "lucide-react";
import { api } from '../lib/api';

export default function ProjectSuggest() {
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [interests, setInterests] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!skills.trim()) {
      setError("Please describe your skills and experience");
      return;
    }

    setIsGenerating(true);
    setError("");
    setResult(null);

    try {
      console.log('Sending project suggestion request...', {
        skills: skills.substring(0, 50) + '...',
        experience,
        interests: interests.substring(0, 50) + '...'
      });

      const response = await api.post('/gemini/suggest-projects', {
        skills,
        experience: experience || 'Not specified',
        interests
      }, false); // Don't include authentication

      console.log('Project suggestion response received:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.success && response.data) {
        setResult({
          success: true,
          output: response.data,
          suggestions: response.data
        });
        console.log('Project suggestions set successfully');
      } else {
        throw new Error('Could not generate project suggestions');
      }

    } catch (err) {
      setError(err.message || "Network error. Please try again.");
      console.error("Project suggestion error:", err);
    } finally {
      setIsGenerating(false);
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
    setSkills("");
    setExperience("");
    setInterests("");
    setResult(null);
    setError("");
  };

  const examplePrompts = [
    {
      title: "Frontend Developer - Beginner",
      skills: "HTML, CSS, JavaScript, basic React",
      experience: "6 months self-taught",
      interests: "Web development, responsive design, user interfaces"
    },
    {
      title: "Full-Stack Developer - Intermediate",
      skills: "React, Node.js, Express, MongoDB, PostgreSQL",
      experience: "2 years professional experience",
      interests: "Modern web apps, API development, database design"
    },
    {
      title: "Python Developer - ML Focus",
      skills: "Python, pandas, scikit-learn, Django, REST APIs",
      experience: "1 year experience, CS graduate",
      interests: "Machine learning, data analysis, AI applications"
    },
    {
      title: "Mobile Developer - Cross-Platform",
      skills: "React Native, JavaScript, Firebase, Redux",
      experience: "Intermediate level, 1.5 years",
      interests: "Mobile apps, cross-platform development, UI/UX"
    }
  ];

  const handleExampleClick = (example) => {
    setSkills(example.skills);
    setExperience(example.experience);
    setInterests(example.interests);
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
            <div className="p-3 bg-orange-500/20 backdrop-blur-xl rounded-xl border border-orange-500/30 shadow-lg">
              <Lightbulb className="h-8 w-8 text-orange-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-lime-400 bg-clip-text text-transparent">
              Project Suggestions
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get personalized project ideas based on your skills and interests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skills" className="text-sm font-medium">
                    Your Skills *
                  </Label>
                  <Textarea
                    id="skills"
                    placeholder="Example: JavaScript, React, Node.js, Python, databases, AWS..."
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="min-h-[100px] mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-sm font-medium">
                    Experience Level
                  </Label>
                  <Input
                    id="experience"
                    placeholder="Example: Beginner, 2 years experience, Senior developer..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="interests" className="text-sm font-medium">
                  Interests & Goals
                </Label>
                <Textarea
                  id="interests"
                  placeholder="Example: Web development, mobile apps, machine learning, blockchain, portfolio building..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="min-h-[150px] mt-2"
                />
              </div>
            </div>

            {/* Example Prompts */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Quick Start Examples:
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {examplePrompts.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="text-left justify-start h-auto p-3 text-sm"
                  >
                    {example.title}
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
                    <Rocket className="h-4 w-4 mr-2" />
                    Get Project Ideas
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
                <Sparkles className="h-5 w-5" />
                Project Ideas
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
                  <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                    {result.output}
                  </pre>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {result.tokensUsed} tokens used
                    </Badge>
                    <span>Generated in {result.processingTime}ms</span>
                  </div>
                  {result.model && (
                    <Badge variant="outline">{result.model}</Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Describe your interests to get personalized project suggestions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-6 text-center">
          Project Suggestion Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code2 className="h-5 w-5 text-blue-500" />
                Tech Stack Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get suggestions for the best technologies and frameworks for your project
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Skill Level Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Projects tailored to your experience level, from beginner to advanced
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Detailed Implementation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Get step-by-step guidance and key features to include in your project
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}
