const OpenAI = require('openai');

class AIService {
  constructor() {
    this.client = null;
    this.initialize();
  }

  initialize() {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.warn('⚠️ OpenAI API key not configured. Using mock responses.');
      return;
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('🤖 OpenAI service initialized successfully');
  }

  async explainCode(code) {
    if (!this.client) {
      return this.getMockResponse('code_explain', code);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful coding assistant. Explain code clearly and concisely, focusing on what the code does, how it works, and any important patterns or best practices used.'
          },
          {
            role: 'user',
            content: `Please explain this code:\n\n${code}`
          }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 2048,
        temperature: 0.7,
      });

      return {
        explanation: response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens,
        model: response.model
      };
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      return this.getMockResponse('code_explain', code);
    }
  }

  async suggestProject(description) {
    if (!this.client) {
      return this.getMockResponse('project_suggest', description);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a project advisor for developers. Suggest practical project ideas based on user descriptions, including tech stack recommendations, key features, and implementation tips.'
          },
          {
            role: 'user',
            content: `Based on this description, suggest a project idea with tech stack and features: ${description}`
          }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 2048,
        temperature: 0.8,
      });

      return {
        suggestion: response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens,
        model: response.model
      };
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      return this.getMockResponse('project_suggest', description);
    }
  }

  async reviewResume(resumeText) {
    if (!this.client) {
      return this.getMockResponse('resume_review', resumeText);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume reviewer. Provide constructive feedback on resumes, highlighting strengths and suggesting specific improvements for better job prospects.'
          },
          {
            role: 'user',
            content: `Please review this resume and provide feedback:\n\n${resumeText}`
          }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 2048,
        temperature: 0.6,
      });

      return {
        review: response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens,
        model: response.model
      };
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      return this.getMockResponse('resume_review', resumeText);
    }
  }

  async fixBug(code, bugDescription) {
    if (!this.client) {
      return this.getMockResponse('bug_fix', code + ' | ' + bugDescription);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a debugging expert. Analyze code, identify issues, and provide fixed versions with explanations of what was wrong and how it was corrected.'
          },
          {
            role: 'user',
            content: `Please analyze this code and fix the bug:\n\nCode:\n${code}\n\nBug Description: ${bugDescription}\n\nProvide the fixed code and explain what was wrong.`
          }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 2048,
        temperature: 0.3,
      });

      return {
        fixedCode: response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens,
        model: response.model
      };
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      return this.getMockResponse('bug_fix', code + ' | ' + bugDescription);
    }
  }

  async helpWithAlgorithm(problemDescription) {
    if (!this.client) {
      return this.getMockResponse('algorithm_help', problemDescription);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an algorithm expert. Help users understand algorithms, provide step-by-step solutions, analyze time/space complexity, and suggest optimal approaches for programming problems.'
          },
          {
            role: 'user',
            content: `Help me with this algorithm problem: ${problemDescription}\n\nProvide:\n1. Problem analysis\n2. Step-by-step approach\n3. Code implementation\n4. Time/Space complexity\n5. Alternative approaches if any`
          }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 2048,
        temperature: 0.6,
      });

      return {
        solution: response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens,
        model: response.model
      };
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      return this.getMockResponse('algorithm_help', problemDescription);
    }
  }

  async generateCode(prompt) {
    if (!this.client) {
      return this.getMockResponse('code_generate', prompt);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a code generator. Create clean, well-commented, and functional code based on user requirements. Include explanations and best practices.'
          },
          {
            role: 'user',
            content: `Generate code for: ${prompt}`
          }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 2048,
        temperature: 0.7,
      });

      return {
        code: response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens,
        model: response.model
      };
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      return this.getMockResponse('code_generate', prompt);
    }
  }

  getMockResponse(tool, input) {
    const responses = {
      code_explain: `This code appears to be ${input.includes("function") ? "a JavaScript function" : "a code snippet"} that ${input.includes("async") ? "performs asynchronous operations" : "executes synchronously"}. It ${input.includes("return") ? "returns a value" : "performs operations"} and follows ${input.includes("const") || input.includes("let") ? "modern ES6+ syntax" : "traditional JavaScript patterns"}.`,
      
      project_suggest: `Based on your description, I suggest building a ${input.includes("web") ? "web application" : "software project"} using ${input.includes("React") || input.includes("JavaScript") ? "React.js with Node.js backend" : "a modern tech stack"}. Consider implementing features like user authentication, data management, and responsive design.`,
      
      resume_review: `Your resume shows ${input.includes("experience") ? "good work experience" : "potential for growth"}. Consider highlighting ${input.includes("skills") ? "your technical skills more prominently" : "specific achievements and quantifiable results"}. The format ${input.includes("organized") ? "appears well-organized" : "could benefit from better structure"}.`,
      
      code_generate: `// Generated code based on your request
function ${input.includes("function") ? "yourFunction" : "generatedFunction"}() {
  // Implementation based on: ${input}
  console.log("Code generated successfully!");
  return "This is a mock generated code response";
}`,

      bug_fix: `// Fixed Code - Common issues addressed:
// 1. Missing semicolons
// 2. Variable scope issues  
// 3. Async/await handling
// 4. Error handling

${input.includes("function") ? "function fixedFunction() {" : "// Fixed code:"}
  // Bug fix applied based on: ${input.split(' | ')[1] || 'general debugging'}
  console.log("Bug has been identified and fixed!");
  return "Fixed code with proper error handling";
${input.includes("function") ? "}" : ""}`,

      algorithm_help: `Algorithm Analysis for: ${input}

1. **Problem Breakdown:**
   - This appears to be a ${input.includes("sort") ? "sorting" : input.includes("search") ? "searching" : "computational"} problem
   - Key considerations: efficiency, edge cases, data structure choice

2. **Recommended Approach:**
   - Use ${input.includes("array") ? "array manipulation" : "optimal data structures"}
   - Time Complexity: O(n log n) typical case
   - Space Complexity: O(1) to O(n) depending on approach

3. **Sample Implementation:**
\`\`\`javascript
function solveProblem(input) {
  // Algorithm implementation here
  return result;
}
\`\`\`

4. **Alternative Approaches:**
   - Consider dynamic programming if optimization is needed
   - Use hash maps for faster lookups`
    };

    return {
      explanation: responses[tool] || "AI processing completed. Please provide more specific information for detailed analysis.",
      tokensUsed: Math.floor(input.length / 4),
      model: 'mock-model'
    };
  }

  isConfigured() {
    return this.client !== null;
  }
}

module.exports = new AIService();
