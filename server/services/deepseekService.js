

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure the Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyArsCF0hMBpdRHLGhx4ltw5Z6VgA7BbsXY');

class GeminiService {
  constructor() {
    this.userApiKeys = new Map();
    this.defaultApiKey = 'AIzaSyArsCF0hMBpdRHLGhx4ltw5Z6VgA7BbsXY';
    this.mockMode = false;
  }

  setUserApiKey(userId, apiKey) {
    this.userApiKeys.set(userId, apiKey);
  }

  removeUserApiKey(userId) {
    this.userApiKeys.delete(userId);
  }

  getUserApiKey(userId) {
    // First check if user has a specific API key
    const userKey = this.userApiKeys.get(userId);
    if (userKey) {
      return userKey;
    }
    
    // Fallback to default API key for testing
    return this.defaultApiKey;
  }

  async makeRequest(userId, prompt, options = {}) {
    try {
      const apiKey = this.getUserApiKey(userId);
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({ model: options.model || 'gemini-1.5-flash' });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      throw new Error(error.message || 'Gemini API request failed');
    }
  }

  // Code Explainer prompts
  async explainCode(userId, code, language = 'javascript') {
    // Mock mode for testing
    if (this.mockMode) {
      return { success: true, explanation: this.generateMockCodeExplanation(code, language) };
    }

    const prompt = `You are an expert code explainer. Analyze the provided ${language} code and provide a comprehensive explanation including:
1. Overall purpose and functionality
2. Line-by-line breakdown of complex parts
3. Best practices and potential improvements
4. Any potential issues or optimizations
Format your response in clear, structured markdown.

Please explain this ${language} code:

\`\`\`${language}
${code}
\`\`\``;

    try {
      const explanation = await this.makeRequest(userId, prompt);
      return { success: true, explanation };
    } catch (error) {
      return { success: false, message: 'Failed to explain code: ' + error.message };
    }
  }

  // Mock response generator for testing
  generateMockCodeExplanation(code, language) {
    return `# Code Explanation (Mock Mode)

## 📝 **What this code does:**
This ${language} code snippet appears to be ${this.guessCodePurpose(code, language)}.

## 🔍 **How it works:**
1. **Input Processing**: The code takes input and processes it
2. **Logic Execution**: Main logic is executed based on the input
3. **Output Generation**: Results are generated and returned

## ✅ **Best Practices Observed:**
- Clean and readable code structure
- Appropriate variable naming
- Logical flow

## 🚀 **Potential Improvements:**
- Consider adding error handling
- Add input validation
- Include documentation/comments
- Consider performance optimizations

## 🔧 **Code Quality:**
The code follows general ${language} conventions and appears functional.

---
*Note: This is a mock explanation for testing. Enable API credits for detailed AI analysis.*`;
  }

  guessCodePurpose(code, language) {
    if (code.includes('function') || code.includes('def')) return 'a function definition';
    if (code.includes('class')) return 'a class definition';
    if (code.includes('for') || code.includes('while')) return 'implementing a loop structure';
    if (code.includes('if')) return 'implementing conditional logic';
    if (code.includes('import') || code.includes('require')) return 'importing dependencies';
    return 'performing some computational task';
  }

  // Resume Review prompts
  async reviewResume(userId, resumeText) {
    const prompt = `You are an expert technical recruiter and career advisor. Review the provided resume and provide detailed feedback including:
1. Overall structure and formatting suggestions
2. Technical skills assessment
3. ATS optimization recommendations
4. Industry-specific improvements
5. Missing sections or information
6. Specific actionable improvements
Format your response in clear sections with bullet points.

Please review and provide feedback on this resume:

${resumeText}`;

    return await this.makeRequest(userId, prompt);
  }

  // Bug Fixer prompts
  async fixBugs(userId, code, language, errorMessage = '') {
    const prompt = `You are an expert debugger and code fixer. Analyze the provided code and:
1. Identify potential bugs and issues
2. Provide corrected code
3. Explain what was wrong and why
4. Suggest prevention strategies
5. Optimize the code if possible
Format your response with the fixed code in code blocks and explanations.

Please analyze and fix issues in this ${language} code${errorMessage ? `\nError message: ${errorMessage}` : ''}:

\`\`\`${language}
${code}
\`\`\``;

    return await this.makeRequest(userId, prompt);
  }

  // Project Suggestions prompts
  async suggestProjects(userId, skills, experience, interests = '') {
    const prompt = `You are a senior developer and mentor. Based on the user's skills and experience, suggest relevant projects that will help them grow. Provide:
1. 3-5 project ideas with varying difficulty levels
2. Specific technologies and tools to use
3. Learning objectives for each project
4. Estimated time to complete
5. How each project will improve their portfolio
Format as a structured list with clear project descriptions.

My skills: ${skills}
Experience level: ${experience}${interests ? `\nInterests: ${interests}` : ''}

Please suggest projects that would help me improve and build my portfolio.`;

    return await this.makeRequest(userId, prompt);
  }

  // Code Generator prompts
  async generateCode(userId, description, language, framework = '') {
    const prompt = `You are an expert code generator. Generate clean, production-ready code based on user requirements. Include:
1. Complete, functional code
2. Proper error handling
3. Comments explaining key parts
4. Best practices for the specified language/framework
5. Basic usage examples
Ensure the code follows modern conventions and is well-structured.

Generate ${language}${framework ? ` (${framework})` : ''} code for: ${description}`;

    return await this.makeRequest(userId, prompt);
  }

  // Algorithm Helper prompts
  async explainAlgorithm(userId, algorithmName, implementationRequest = false) {
    const prompt = `You are an expert computer science educator. Explain algorithms clearly and comprehensively. Provide:
1. Clear explanation of how the algorithm works
2. Step-by-step breakdown
3. Time and space complexity analysis
4. Real-world use cases
5. Implementation in multiple languages if requested
6. Visual description of the process
Make it educational and easy to understand.

Please explain the ${algorithmName} algorithm${implementationRequest ? ' and provide implementations in popular languages' : ''}.`;

    return await this.makeRequest(userId, prompt);
  }

  // Custom tool execution
  async executeCustomTool(userId, toolConfig, userInput) {
    try {
      const config = JSON.parse(toolConfig);
      const systemPrompt = config.systemPrompt || 'You are a helpful AI assistant.';
      const userPrompt = config.userPrompt || userInput;

      const prompt = `${systemPrompt}

${userPrompt.replace('{{input}}', userInput)}`;

      return await this.makeRequest(userId, prompt, config.options || {});
    } catch (error) {
      throw new Error('Invalid tool configuration: ' + error.message);
    }
  }
}

module.exports = new GeminiService();
