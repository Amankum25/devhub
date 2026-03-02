const Groq = require('groq-sdk');

// Lazy-initialize the Groq client so missing API key doesn't crash at startup
let _groq = null;
function getGroqClient(apiKey) {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not configured');
  return new Groq({ apiKey: key });
}

class GroqService {
  constructor() {
    this.userApiKeys = new Map();
    this.defaultApiKey = process.env.GROQ_API_KEY || '';
    this.defaultModel = 'llama-3.3-70b-versatile'; // Fast and high quality
  }

  setUserApiKey(userId, apiKey) {
    this.userApiKeys.set(userId, apiKey);
  }

  removeUserApiKey(userId) {
    this.userApiKeys.delete(userId);
  }

  getUserApiKey(userId) {
    const userKey = this.userApiKeys.get(userId);
    if (userKey) {
      return userKey;
    }
    return this.defaultApiKey;
  }

  async makeRequest(userId, messages, options = {}) {
    try {
      const apiKey = this.getUserApiKey(userId);
      const client = new Groq({ apiKey });
      
      const completion = await client.chat.completions.create({
        model: options.model || this.defaultModel,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        top_p: options.topP || 1,
        stream: false
      });
      
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API Error:', error.message);
      throw new Error(error.message || 'Groq API request failed');
    }
  }

  // Code Explainer
  async explainCode(userId, code, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert code explainer. Provide comprehensive, clear explanations in markdown format.'
      },
      {
        role: 'user',
        content: `Analyze this ${language} code and provide:
1. Overall purpose and functionality
2. Line-by-line breakdown of complex parts
3. Best practices and potential improvements
4. Any potential issues or optimizations

Code:
\`\`\`${language}
${code}
\`\`\``
      }
    ];

    try {
      const explanation = await this.makeRequest(userId, messages);
      return { success: true, data: explanation };
    } catch (error) {
      console.error('Code explanation error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Resume Reviewer
  async reviewResume(userId, resumeText) {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert career counselor and resume reviewer with years of experience in tech recruiting.'
      },
      {
        role: 'user',
        content: `Review this resume and provide:
1. Overall assessment and score (out of 10)
2. Strengths and weaknesses
3. Specific improvement suggestions
4. ATS (Applicant Tracking System) optimization tips
5. Missing key elements

Resume:
${resumeText}`
      }
    ];

    try {
      const review = await this.makeRequest(userId, messages);
      return { success: true, data: review };
    } catch (error) {
      console.error('Resume review error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Bug Fixer
  async fixBugs(userId, code, language, errorMessage = '') {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert debugger and code fixer. Provide working solutions with clear explanations.'
      },
      {
        role: 'user',
        content: `Fix the bugs in this ${language} code${errorMessage ? ` (Error: ${errorMessage})` : ''}.

Provide:
1. Identified issues
2. Fixed code
3. Explanation of fixes
4. Prevention tips

Code:
\`\`\`${language}
${code}
\`\`\``
      }
    ];

    try {
      const fix = await this.makeRequest(userId, messages);
      return { success: true, data: fix };
    } catch (error) {
      console.error('Bug fixing error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Project Suggester
  async suggestProjects(userId, skills, experience, interests = '') {
    const messages = [
      {
        role: 'system',
        content: 'You are a project advisor who suggests creative, practical project ideas for developers.'
      },
      {
        role: 'user',
        content: `Suggest 5-7 project ideas based on:
- Skills: ${skills}
- Experience Level: ${experience}
${interests ? `- Interests: ${interests}` : ''}

For each project provide:
1. Project name and brief description
2. Key features to implement
3. Technologies to use
4. Estimated difficulty and time
5. Learning outcomes`
      }
    ];

    try {
      const suggestions = await this.makeRequest(userId, messages);
      return { success: true, data: suggestions };
    } catch (error) {
      console.error('Project suggestion error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Code Generator
  async generateCode(userId, description, language, framework = '') {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert code generator. Write clean, well-documented, production-ready code.'
      },
      {
        role: 'user',
        content: `Generate ${language} code${framework ? ` using ${framework}` : ''} for:

${description}

Provide:
1. Complete working code
2. Documentation/comments
3. Usage examples
4. Dependencies needed`
      }
    ];

    try {
      const generatedCode = await this.makeRequest(userId, messages, { maxTokens: 6000 });
      return { success: true, data: generatedCode };
    } catch (error) {
      console.error('Code generation error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Algorithm Explainer
  async explainAlgorithm(userId, algorithmName, problemType = '', context = '') {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert computer science educator specializing in algorithms and data structures.'
      },
      {
        role: 'user',
        content: `Explain the "${algorithmName}" algorithm${problemType ? ` for ${problemType} problems` : ''}${context ? `. Context: ${context}` : ''}.

Include:
1. How the algorithm works
2. Step-by-step breakdown
3. Time and space complexity
4. When to use it
5. Code example
6. Common variations`
      }
    ];

    try {
      const explanation = await this.makeRequest(userId, messages);
      return { success: true, data: explanation };
    } catch (error) {
      console.error('Algorithm explanation error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Custom Tool Executor
  async executeCustomTool(userId, toolConfig, userInput) {
    const messages = [
      {
        role: 'system',
        content: toolConfig.systemPrompt || 'You are a helpful AI assistant.'
      },
      {
        role: 'user',
        content: toolConfig.userPrompt.replace('{{input}}', userInput)
      }
    ];

    try {
      const result = await this.makeRequest(userId, messages, {
        temperature: toolConfig.temperature || 0.7,
        maxTokens: toolConfig.maxTokens || 4000
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('Custom tool execution error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Health check
  async checkHealth() {
    try {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "OK"' }
      ];
      await this.makeRequest('health-check', messages);
      return { status: 'ok', service: 'groq' };
    } catch (error) {
      return { status: 'error', service: 'groq', error: error.message };
    }
  }
}

module.exports = new GroqService();
