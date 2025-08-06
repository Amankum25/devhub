

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
      return { success: true, data: explanation };
    } catch (error) {
      console.log('Gemini API unavailable, using mock response:', error.message);
      // Fallback to detailed mock response when API is unavailable
      const mockExplanation = this.generateDetailedCodeExplanation(code, language);
      return { success: true, data: mockExplanation };
    }
  }

  // Enhanced mock response generator for better user experience
  generateDetailedCodeExplanation(code, language) {
    const codeLines = code.split('\n').filter(line => line.trim());
    const functions = this.extractFunctions(code, language);
    const variables = this.extractVariables(code, language);
    const purpose = this.analyzeCodePurpose(code, language);
    
    return `# 🤖 Code Explanation (API Fallback Mode)

*Note: The Gemini AI service is currently experiencing high traffic. This is a detailed fallback analysis.*

## 📋 **Overview**
This ${language} code ${purpose}. The code consists of ${codeLines.length} lines and includes ${functions.length > 0 ? `${functions.length} function(s)` : 'procedural logic'}.

## 🔍 **Detailed Analysis**

### **Main Purpose:**
${this.getDetailedPurpose(code, language)}

### **Code Structure:**
${functions.length > 0 ? `
**Functions Identified:**
${functions.map(func => `- \`${func}\`: ${this.describeFunctionPurpose(func, code)}`).join('\n')}
` : ''}

${variables.length > 0 ? `
**Key Variables:**
${variables.map(variable => `- \`${variable}\`: ${this.describeVariable(variable, code)}`).join('\n')}
` : ''}

### **Line-by-Line Breakdown:**
${this.generateLineByLineAnalysis(code, language)}

## ✅ **Best Practices & Observations**
${this.analyzeBestPractices(code, language)}

## 🚀 **Potential Improvements**
${this.suggestImprovements(code, language)}

## 🎯 **Learning Points**
${this.generateLearningPoints(code, language)}

---
*💡 Tip: For more detailed AI-powered analysis, try again when the Gemini service is available, or check your API quota.*`;
  }

  analyzeCodePurpose(code, language) {
    if (code.includes('fibonacci')) return 'implements the Fibonacci sequence calculation';
    if (code.includes('factorial')) return 'calculates factorial values';
    if (code.includes('sort') || code.includes('Sort')) return 'implements a sorting algorithm';
    if (code.includes('search') || code.includes('find')) return 'implements a search functionality';
    if (code.includes('class') && code.includes('constructor')) return 'defines a class with constructor';
    if (code.includes('async') || code.includes('await')) return 'handles asynchronous operations';
    if (code.includes('fetch') || code.includes('axios')) return 'makes API requests';
    if (code.includes('useState') || code.includes('useEffect')) return 'is a React component with hooks';
    if (code.includes('function') || code.includes('def')) return 'contains function definitions';
    return 'performs computational logic';
  }

  getDetailedPurpose(code, language) {
    if (code.includes('fibonacci')) {
      return 'This code implements the Fibonacci sequence, a mathematical series where each number is the sum of the two preceding ones. It demonstrates recursive programming concepts.';
    }
    if (code.includes('factorial')) {
      return 'This code calculates factorial values (n!), which is the product of all positive integers less than or equal to n.';
    }
    if (code.includes('React') || code.includes('useState')) {
      return 'This appears to be a React component that manages state and renders UI elements based on user interactions.';
    }
    return `This ${language} code snippet demonstrates fundamental programming concepts and appears to be well-structured for its intended purpose.`;
  }

  extractFunctions(code, language) {
    const functions = [];
    const functionRegexes = {
      javascript: /function\s+(\w+)/g,
      python: /def\s+(\w+)/g,
      java: /(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\(/g,
      default: /function\s+(\w+)|def\s+(\w+)/g
    };
    
    const regex = functionRegexes[language] || functionRegexes.default;
    let match;
    while ((match = regex.exec(code)) !== null) {
      functions.push(match[1] || match[2]);
    }
    return functions;
  }

  extractVariables(code, language) {
    const variables = [];
    const lines = code.split('\n');
    
    lines.forEach(line => {
      // Simple variable extraction - can be enhanced
      if (language === 'javascript') {
        const jsVarMatch = line.match(/(?:let|const|var)\s+(\w+)/);
        if (jsVarMatch) variables.push(jsVarMatch[1]);
      } else if (language === 'python') {
        const pyVarMatch = line.match(/^(\w+)\s*=/);
        if (pyVarMatch) variables.push(pyVarMatch[1]);
      }
    });
    
    return [...new Set(variables)]; // Remove duplicates
  }

  describeFunctionPurpose(funcName, code) {
    if (funcName.toLowerCase().includes('fibonacci')) return 'Calculates Fibonacci numbers recursively';
    if (funcName.toLowerCase().includes('factorial')) return 'Computes factorial values';
    if (funcName.toLowerCase().includes('sort')) return 'Sorts data elements';
    if (funcName.toLowerCase().includes('search')) return 'Searches for specific values';
    if (funcName.toLowerCase().includes('calculate')) return 'Performs mathematical calculations';
    return 'Handles specific logic operations';
  }

  describeVariable(variable, code) {
    if (variable === 'n' && code.includes('fibonacci')) return 'Input parameter for Fibonacci calculation';
    if (variable === 'result') return 'Stores the computed result';
    if (variable === 'data') return 'Contains the input data to process';
    if (variable === 'index' || variable === 'i') return 'Loop counter variable';
    return 'Used for data storage and manipulation';
  }

  generateLineByLineAnalysis(code, language) {
    const lines = code.split('\n').filter(line => line.trim());
    if (lines.length > 10) {
      return `The code contains ${lines.length} lines. Key sections include:\n- Initial setup and variable declarations\n- Main logic implementation\n- Return statements and output handling`;
    }
    
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      let explanation = `**Line ${index + 1}**: \`${trimmed}\`\n`;
      
      if (trimmed.includes('function') || trimmed.includes('def')) {
        explanation += '  - Defines a new function with parameters\n';
      } else if (trimmed.includes('return')) {
        explanation += '  - Returns the computed result\n';
      } else if (trimmed.includes('if')) {
        explanation += '  - Conditional logic to handle different cases\n';
      } else if (trimmed.includes('for') || trimmed.includes('while')) {
        explanation += '  - Loop structure for iteration\n';
      } else if (trimmed.includes('console.log') || trimmed.includes('print')) {
        explanation += '  - Outputs result to console\n';
      } else {
        explanation += '  - Executes core logic operation\n';
      }
      
      return explanation;
    }).join('');
  }

  analyzeBestPractices(code, language) {
    const practices = [];
    
    if (code.includes('const') || code.includes('let')) {
      practices.push('• Uses modern variable declarations (const/let)');
    }
    if (code.includes('function')) {
      practices.push('• Code is organized into functions for reusability');
    }
    if (code.includes('//') || code.includes('#')) {
      practices.push('• Includes comments for code documentation');
    }
    if (!code.includes('var ')) {
      practices.push('• Avoids deprecated var declarations');
    }
    if (code.split('\n').every(line => line.length < 100)) {
      practices.push('• Maintains reasonable line lengths');
    }
    
    if (practices.length === 0) {
      practices.push('• Code structure follows basic conventions');
      practices.push('• Logic flow is clear and understandable');
    }
    
    return practices.join('\n');
  }

  suggestImprovements(code, language) {
    const suggestions = [];
    
    if (!code.includes('try') && !code.includes('catch')) {
      suggestions.push('• Consider adding error handling with try-catch blocks');
    }
    if (!code.includes('//') && !code.includes('#') && !code.includes('/*')) {
      suggestions.push('• Add comments to explain complex logic');
    }
    if (code.includes('var ')) {
      suggestions.push('• Replace var with const or let for better scoping');
    }
    if (language === 'javascript' && !code.includes('===')) {
      suggestions.push('• Use strict equality (===) instead of loose equality (==)');
    }
    if (code.includes('console.log') && !code.includes('development')) {
      suggestions.push('• Remove console.log statements in production code');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('• Code looks well-structured for its current purpose');
      suggestions.push('• Consider adding input validation for robustness');
      suggestions.push('• Think about performance optimization for large datasets');
    }
    
    return suggestions.join('\n');
  }

  generateLearningPoints(code, language) {
    const points = [];
    
    if (code.includes('fibonacci')) {
      points.push('• **Recursion**: This demonstrates recursive function calls');
      points.push('• **Mathematical sequences**: Understanding number patterns');
      points.push('• **Base cases**: Important for preventing infinite recursion');
    } else if (code.includes('function')) {
      points.push('• **Function declarations**: How to define reusable code blocks');
      points.push('• **Parameter passing**: Sending data to functions');
      points.push('• **Return values**: Getting results from functions');
    } else {
      points.push(`• **${language} syntax**: Understanding language-specific conventions`);
      points.push('• **Control flow**: How programs execute step by step');
      points.push('• **Problem solving**: Breaking down complex tasks');
    }
    
    return points.join('\n');
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

    try {
      const review = await this.makeRequest(userId, prompt);
      return { success: true, data: review };
    } catch (error) {
      return { success: false, message: 'Failed to review resume: ' + error.message };
    }
  }

  // Bug Fixer prompts
  async fixBugs(userId, code, language, errorMessage = '') {
    const prompt = `You are an expert debugger and code fixer. Analyze the provided code and provide a comprehensive analysis.

Please follow this EXACT format in your response:

## ANALYSIS
[Provide a brief overview of what you found in the code]

## ISSUES FOUND
[List specific bugs, errors, or problems found in the code]
- Issue 1: Description
- Issue 2: Description

## FIXED CODE
\`\`\`${language}
[Provide the complete corrected code here]
\`\`\`

## IMPROVEMENTS MADE
[Explain exactly what changes were made and why]
1. Fixed [specific issue]: [explanation]
2. Improved [specific aspect]: [explanation]
3. Added [enhancement]: [explanation]

## SUGGESTIONS
[Additional recommendations for better code quality]
- Suggestion 1
- Suggestion 2

Please analyze and fix issues in this ${language} code${errorMessage ? `\nKnown Error: ${errorMessage}` : ''}:

\`\`\`${language}
${code}
\`\`\``;

    try {
      const response = await this.makeRequest(userId, prompt);
      
      // Parse the structured response
      const sections = this.parseFixBugsResponse(response, code, language);
      
      return { 
        success: true, 
        analysis: sections.analysis,
        fixedCode: sections.fixedCode,
        improvements: sections.improvements,
        suggestions: sections.suggestions,
        issues: sections.issues,
        data: response // Keep original for fallback
      };
    } catch (error) {
      console.error('Bug fix error:', error);
      return { 
        success: false, 
        message: 'Failed to fix bugs: ' + error.message,
        analysis: 'Error occurred while analyzing the code.',
        fixedCode: code, // Return original code as fallback
        improvements: ['Unable to analyze due to error: ' + error.message],
        suggestions: ['Please check your code syntax and try again'],
        issues: [{ type: 'error', message: error.message, line: 0 }]
      };
    }
  }

  // Helper method to parse fix bugs response
  parseFixBugsResponse(response, originalCode, language) {
    try {
      const text = typeof response === 'string' ? response : response.data || JSON.stringify(response);
      
      let analysis = '';
      let fixedCode = originalCode;
      let improvements = [];
      let suggestions = [];
      let issues = [];

      // Split into sections
      const sections = text.split(/##\s*/);
      
      for (let section of sections) {
        const lines = section.trim().split('\n');
        const header = lines[0].toLowerCase();
        const content = lines.slice(1).join('\n').trim();
        
        if (header.includes('analysis')) {
          analysis = content;
        } else if (header.includes('issues found')) {
          // Extract issues
          const issueLines = content.split('\n').filter(line => line.trim().startsWith('-'));
          issues = issueLines.map(line => ({
            type: 'error',
            message: line.replace(/^-\s*/, '').trim(),
            line: 0
          }));
        } else if (header.includes('fixed code')) {
          // Extract code from code blocks
          const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
          if (codeMatch) {
            fixedCode = codeMatch[1].trim();
          } else {
            // If no code blocks, try to extract code after the header
            const codeLines = content.split('\n').filter(line => !line.includes('```'));
            if (codeLines.length > 0) {
              fixedCode = codeLines.join('\n').trim();
            }
          }
        } else if (header.includes('improvements made')) {
          // Extract numbered improvements
          const improvementLines = content.split('\n').filter(line => 
            line.trim().match(/^\d+\./) || line.trim().startsWith('-')
          );
          improvements = improvementLines.map(line => 
            line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim()
          );
        } else if (header.includes('suggestions')) {
          // Extract suggestions
          const suggestionLines = content.split('\n').filter(line => 
            line.trim().startsWith('-') || line.trim().match(/^\d+\./)
          );
          suggestions = suggestionLines.map(line => 
            line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim()
          );
        }
      }

      // Fallback parsing if sections not found
      if (!analysis && !fixedCode && improvements.length === 0) {
        analysis = text.substring(0, 200) + '...';
        
        // Try to find any code blocks
        const codeBlocks = text.match(/```[\w]*\n([\s\S]*?)```/g);
        if (codeBlocks && codeBlocks.length > 0) {
          const lastCodeBlock = codeBlocks[codeBlocks.length - 1];
          const codeMatch = lastCodeBlock.match(/```[\w]*\n([\s\S]*?)```/);
          if (codeMatch) {
            fixedCode = codeMatch[1].trim();
          }
        }
        
        improvements = ['Code has been analyzed and improvements have been suggested'];
        suggestions = ['Review the analysis for detailed recommendations'];
      }

      return {
        analysis: analysis || 'Code analysis completed',
        fixedCode: fixedCode || originalCode,
        improvements: improvements.length > 0 ? improvements : ['No specific improvements identified'],
        suggestions: suggestions.length > 0 ? suggestions : ['Code appears to be functioning correctly'],
        issues: issues.length > 0 ? issues : []
      };
      
    } catch (error) {
      console.error('Error parsing fix bugs response:', error);
      return {
        analysis: 'Error parsing analysis results',
        fixedCode: originalCode,
        improvements: ['Unable to parse improvements'],
        suggestions: ['Please try again with a different code sample'],
        issues: [{ type: 'error', message: 'Parsing error occurred', line: 0 }]
      };
    }
  }

  // Project Suggestions prompts
  async suggestProjects(userId, skills, experience, interests = '') {
    const prompt = `You are a senior software engineer, technical lead, and career mentor with 10+ years of experience. Based on the user's skills and experience, provide COMPREHENSIVE project suggestions that will significantly advance their career.

Please provide your response in this EXACT format:

## 🚀 PERSONALIZED PROJECT ROADMAP

### 📊 SKILL ANALYSIS
Based on your skills (${skills}) and experience level (${experience}), here's my assessment:
[Provide detailed analysis of current skill level and growth areas]

### 💡 PROJECT SUGGESTIONS

#### PROJECT 1: [Beginner-Friendly] [Project Name]
**🎯 Description:** [Detailed project description with real-world context]
**💻 Technologies:** [Complete tech stack with specific versions]
**⏱️ Timeline:** [Realistic timeframe: X weeks/months]
**🎓 Learning Objectives:**
- [Specific skill 1 you'll learn]
- [Specific skill 2 you'll learn]
- [Specific skill 3 you'll learn]
**📁 Implementation Plan:**
1. [Step 1: Setup and planning]
2. [Step 2: Core development]
3. [Step 3: Testing and deployment]
**🌟 Portfolio Impact:** [How this project enhances your portfolio]
**💼 Career Value:** [How this helps in job interviews]

#### PROJECT 2: [Intermediate] [Project Name]
**🎯 Description:** [Detailed project description]
**💻 Technologies:** [Complete tech stack]
**⏱️ Timeline:** [Realistic timeframe]
**🎓 Learning Objectives:**
- [Advanced skill development]
- [Industry best practices]
- [System design concepts]
**📁 Implementation Plan:**
1. [Detailed step-by-step breakdown]
2. [Architecture planning]
3. [Development phases]
4. [Testing and optimization]
**🌟 Portfolio Impact:** [Professional-level project showcase]
**💼 Career Value:** [Advanced concepts for senior roles]

#### PROJECT 3: [Advanced] [Project Name]
**🎯 Description:** [Complex, real-world project]
**💻 Technologies:** [Enterprise-level tech stack]
**⏱️ Timeline:** [Long-term project timeline]
**🎓 Learning Objectives:**
- [Expert-level skills]
- [Scalability and performance]
- [DevOps and deployment]
**📁 Implementation Plan:**
1. [System architecture design]
2. [Microservices development]
3. [Database optimization]
4. [CI/CD pipeline setup]
5. [Production deployment]
**🌟 Portfolio Impact:** [Enterprise-ready showcase]
**💼 Career Value:** [Senior/Lead developer qualifications]

### 🔄 PROGRESSIVE LEARNING PATH
[Explain how these projects build upon each other]

### 📚 ADDITIONAL RESOURCES
**Learning Materials:**
- [Specific courses/tutorials]
- [Documentation links]
- [Community resources]

**Tools & Setup:**
- [Development environment setup]
- [Required tools and versions]
- [Helpful extensions/plugins]

### 🎯 SUCCESS METRICS
[How to measure progress and completion]

My skills: ${skills}
Experience level: ${experience}${interests ? `\nInterests: ${interests}` : ''}

Please provide detailed, actionable project suggestions that will significantly advance my programming career.`;

    try {
      const suggestions = await this.makeRequest(userId, prompt);
      return { success: true, data: suggestions };
    } catch (error) {
      console.error('Project suggestion error:', error);
      return { 
        success: false, 
        message: 'Failed to suggest projects: ' + error.message,
        data: this.generateMockProjectSuggestions(skills, experience, interests)
      };
    }
  }

  // Enhanced mock project suggestions
  generateMockProjectSuggestions(skills, experience, interests) {
    return `# 🚀 PERSONALIZED PROJECT ROADMAP (Fallback Mode)

## 📊 SKILL ANALYSIS
Based on your skills (${skills}) and experience level (${experience}), you're ready for projects that will challenge and grow your abilities.

## 💡 PROJECT SUGGESTIONS

### PROJECT 1: [Beginner-Friendly] Personal Portfolio Website
**🎯 Description:** Build a responsive portfolio website showcasing your projects and skills
**💻 Technologies:** HTML5, CSS3, JavaScript, React/Vue.js, GitHub Pages
**⏱️ Timeline:** 2-3 weeks
**🎓 Learning Objectives:**
- Modern CSS techniques (Grid, Flexbox)
- Responsive design principles
- JavaScript DOM manipulation
- Version control with Git
**📁 Implementation Plan:**
1. Design mockups and wireframes
2. Set up project structure and Git repository
3. Build responsive layouts with CSS Grid/Flexbox
4. Add interactive JavaScript features
5. Deploy to GitHub Pages
**🌟 Portfolio Impact:** Professional online presence
**💼 Career Value:** Essential for job applications

### PROJECT 2: [Intermediate] Task Management Application
**🎯 Description:** Full-stack task management app with user authentication
**💻 Technologies:** React.js, Node.js, Express, MongoDB, JWT authentication
**⏱️ Timeline:** 4-6 weeks
**🎓 Learning Objectives:**
- RESTful API development
- Database design and operations
- User authentication and authorization
- State management in React
**📁 Implementation Plan:**
1. Design database schema and API endpoints
2. Build Express.js backend with MongoDB
3. Implement JWT authentication
4. Create React frontend with routing
5. Add CRUD operations and state management
**🌟 Portfolio Impact:** Demonstrates full-stack capabilities
**💼 Career Value:** Shows understanding of complete web applications

### PROJECT 3: [Advanced] Real-time Chat Application
**🎯 Description:** Scalable chat app with real-time messaging and file sharing
**💻 Technologies:** React, Node.js, Socket.io, Redis, PostgreSQL, Docker
**⏱️ Timeline:** 8-12 weeks
**🎓 Learning Objectives:**
- Real-time communication with WebSockets
- Microservices architecture
- Caching strategies with Redis
- Container deployment with Docker
**📁 Implementation Plan:**
1. Design system architecture and database schema
2. Build real-time messaging with Socket.io
3. Implement file upload and sharing
4. Add Redis for caching and session management
5. Containerize with Docker and deploy
**🌟 Portfolio Impact:** Enterprise-level application showcase
**💼 Career Value:** Advanced concepts for senior developer roles

## 🔄 PROGRESSIVE LEARNING PATH
These projects are designed to progressively build your skills from fundamental web development to advanced system architecture.

## 📚 ADDITIONAL RESOURCES
**Learning Materials:**
- MDN Web Docs for JavaScript fundamentals
- React official documentation
- Node.js best practices guide

**Tools & Setup:**
- VS Code with recommended extensions
- Node.js (latest LTS version)
- MongoDB Atlas for cloud database

## 🎯 SUCCESS METRICS
- Complete all planned features
- Deploy to production environment
- Document code and create README files
- Get feedback from other developers

---
*Note: This is a comprehensive fallback response. For personalized AI-generated suggestions, ensure API access is available.*`;
  }

  // Code Generator prompts
  async generateCode(userId, description, language, framework = '') {
    const prompt = `You are an expert senior software engineer with 15+ years of experience. Generate COMPLETE, PRODUCTION-READY code based on the user's requirements.

Please provide your response in this EXACT format:

## 🏗️ COMPLETE CODE IMPLEMENTATION

### 📋 PROJECT OVERVIEW
**Description:** [Brief summary of what this code does]
**Language:** ${language}${framework ? `\n**Framework:** ${framework}` : ''}
**Complexity:** [Beginner/Intermediate/Advanced]

### 📁 PROJECT STRUCTURE
\`\`\`
[Show complete file/folder structure]
project/
├── src/
│   ├── components/
│   ├── utils/
│   └── index.js
├── package.json
└── README.md
\`\`\`

### 💻 COMPLETE CODE

#### Main Implementation
\`\`\`${language}
[Provide COMPLETE, functional code with proper structure]
[Include all necessary imports, functions, classes]
[Add comprehensive error handling]
[Include input validation]
[Add proper documentation/comments]
\`\`\`

#### Configuration Files
${framework === 'react' || framework === 'node' ? `
**package.json**
\`\`\`json
[Complete package.json with all dependencies]
\`\`\`
` : ''}

#### Additional Files (if needed)
[Any additional configuration or helper files]

### 🔧 SETUP INSTRUCTIONS
1. **Prerequisites:**
   - [List all required software/tools]
   - [Specify versions if important]

2. **Installation:**
   \`\`\`bash
   [Complete setup commands]
   \`\`\`

3. **Running the application:**
   \`\`\`bash
   [Commands to run the code]
   \`\`\`

### 🎯 FEATURES IMPLEMENTED
- [Feature 1 with description]
- [Feature 2 with description]
- [Feature 3 with description]

### 🧪 USAGE EXAMPLES
\`\`\`${language}
[Show how to use the code with real examples]
[Include different use cases]
[Show expected outputs]
\`\`\`

### 🔒 SECURITY CONSIDERATIONS
[List security best practices implemented]

### 🚀 PERFORMANCE OPTIMIZATIONS
[Explain any performance improvements included]

### 📈 SCALABILITY NOTES
[How the code can be scaled or extended]

### 🧪 TESTING APPROACH
[Suggest testing strategies and provide test examples]

### 🔄 FUTURE ENHANCEMENTS
[Suggestions for extending the functionality]

Generate ${language}${framework ? ` (${framework})` : ''} code for: ${description}

Requirements:
- Complete, functional code that runs without modifications
- Include all necessary dependencies and imports
- Add comprehensive error handling
- Follow best practices and modern conventions
- Include setup and usage instructions
- Add meaningful comments explaining key logic`;

    try {
      const code = await this.makeRequest(userId, prompt);
      return { success: true, data: code };
    } catch (error) {
      console.error('Code generation error:', error);
      return { 
        success: false, 
        message: 'Failed to generate code: ' + error.message,
        data: this.generateMockCode(description, language, framework)
      };
    }
  }

  // Enhanced mock code generator
  generateMockCode(description, language, framework) {
    return `# 🏗️ COMPLETE CODE IMPLEMENTATION (Fallback Mode)

## 📋 PROJECT OVERVIEW
**Description:** ${description}
**Language:** ${language}${framework ? `\n**Framework:** ${framework}` : ''}
**Complexity:** Intermediate

## 📁 PROJECT STRUCTURE
\`\`\`
project/
├── src/
│   ├── index.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'java'}
│   ├── utils/
│   └── config/
├── ${language === 'javascript' ? 'package.json' : language === 'python' ? 'requirements.txt' : 'pom.xml'}
└── README.md
\`\`\`

## 💻 COMPLETE CODE

### Main Implementation
\`\`\`${language}
${this.generateSampleCode(description, language, framework)}
\`\`\`

${language === 'javascript' || framework === 'node' || framework === 'react' ? `
### Configuration Files
**package.json**
\`\`\`json
{
  "name": "generated-project",
  "version": "1.0.0",
  "description": "${description}",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    ${framework === 'react' ? '"react": "^18.0.0",\n    "react-dom": "^18.0.0",' : ''}
    ${framework === 'express' ? '"express": "^4.18.0",\n    "cors": "^2.8.5",' : ''}
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.0.0"
  }
}
\`\`\`
` : ''}

## 🔧 SETUP INSTRUCTIONS
1. **Prerequisites:**
   - ${language === 'javascript' ? 'Node.js 16+ and npm' : language === 'python' ? 'Python 3.8+' : 'Java 11+ and Maven'}

2. **Installation:**
   \`\`\`bash
   ${language === 'javascript' ? 'npm install' : language === 'python' ? 'pip install -r requirements.txt' : 'mvn install'}
   \`\`\`

3. **Running the application:**
   \`\`\`bash
   ${language === 'javascript' ? 'npm start' : language === 'python' ? 'python src/main.py' : 'java -jar target/app.jar'}
   \`\`\`

## 🎯 FEATURES IMPLEMENTED
- Core functionality for ${description}
- Error handling and input validation
- Modular code structure
- Configuration management
- Logging and debugging support

## 🧪 USAGE EXAMPLES
\`\`\`${language}
${this.generateUsageExample(description, language)}
\`\`\`

## 🔒 SECURITY CONSIDERATIONS
- Input validation to prevent injection attacks
- Error handling without exposing sensitive information
- Secure configuration management

## 🚀 PERFORMANCE OPTIMIZATIONS
- Efficient algorithms and data structures
- Lazy loading where applicable
- Memory usage optimization

## 📈 SCALABILITY NOTES
- Modular architecture for easy extension
- Configuration-driven behavior
- Separation of concerns

## 🧪 TESTING APPROACH
- Unit tests for core functions
- Integration tests for main workflows
- Error case testing

## 🔄 FUTURE ENHANCEMENTS
- Add caching mechanism
- Implement rate limiting
- Add monitoring and metrics
- Enhance error reporting

---
*Note: This is a comprehensive fallback implementation. For AI-generated custom code, ensure API access is available.*`;
  }

  generateSampleCode(description, language, framework) {
    if (language === 'javascript') {
      if (framework === 'react') {
        return `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call for ${description}
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (item) => {
    // Handle user interaction
    console.log('Processing:', item);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="App">
      <h1>${description}</h1>
      <div className="content">
        {data.map(item => (
          <div key={item.id} className="item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <button onClick={() => handleAction(item)}>
              Process
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;`;
      } else {
        return `// ${description} - Complete Implementation
const fs = require('fs');
const path = require('path');

class MainApplication {
  constructor() {
    this.config = this.loadConfig();
    this.data = [];
    this.init();
  }

  init() {
    console.log('Initializing application...');
    this.setupErrorHandling();
    this.loadData();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'config.json');
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      return this.getDefaultConfig();
    } catch (error) {
      console.error('Config loading error:', error.message);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      version: '1.0.0',
      environment: 'development',
      logging: true
    };
  }

  setupErrorHandling() {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  async loadData() {
    try {
      // Implementation for ${description}
      this.data = await this.fetchData();
      this.log('Data loaded successfully');
    } catch (error) {
      this.log('Error loading data: ' + error.message, 'error');
    }
  }

  async fetchData() {
    // Simulate data fetching
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Item 1', status: 'active' },
          { id: 2, name: 'Item 2', status: 'pending' },
          { id: 3, name: 'Item 3', status: 'completed' }
        ]);
      }, 100);
    });
  }

  processItem(item) {
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid item provided');
    }

    this.log(\`Processing item: \${item.name}\`);
    
    // Main processing logic
    return {
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    };
  }

  log(message, level = 'info') {
    if (this.config.logging) {
      const timestamp = new Date().toISOString();
      console.log(\`[\${timestamp}] [\${level.toUpperCase()}] \${message}\`);
    }
  }

  async run() {
    try {
      this.log('Starting application');
      
      for (const item of this.data) {
        const result = this.processItem(item);
        this.log(\`Processed: \${result.name}\`);
      }
      
      this.log('Application completed successfully');
    } catch (error) {
      this.log('Application error: ' + error.message, 'error');
      throw error;
    }
  }
}

// Initialize and run the application
const app = new MainApplication();
app.run().catch(console.error);

module.exports = MainApplication;`;
      }
    } else if (language === 'python') {
      return `"""
${description} - Complete Python Implementation
Author: AI Code Generator
Version: 1.0.0
"""

import logging
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MainApplication:
    """
    Main application class for ${description}
    """
    
    def __init__(self):
        """Initialize the application"""
        self.config = self._load_config()
        self.data = []
        logger.info("Application initialized")
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file or return defaults"""
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'config.json')
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    return json.load(f)
            return self._get_default_config()
        except Exception as e:
            logger.error(f"Config loading error: {e}")
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Return default configuration"""
        return {
            'version': '1.0.0',
            'environment': 'development',
            'logging': True,
            'max_items': 100
        }
    
    async def load_data(self) -> None:
        """Load data for processing"""
        try:
            self.data = await self._fetch_data()
            logger.info(f"Loaded {len(self.data)} items")
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    async def _fetch_data(self) -> List[Dict[str, Any]]:
        """Simulate data fetching"""
        # Simulate async operation
        await asyncio.sleep(0.1)
        
        return [
            {'id': 1, 'name': 'Item 1', 'status': 'active'},
            {'id': 2, 'name': 'Item 2', 'status': 'pending'},
            {'id': 3, 'name': 'Item 3', 'status': 'completed'}
        ]
    
    def process_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single item
        
        Args:
            item: Item to process
            
        Returns:
            Processed item with additional metadata
            
        Raises:
            ValueError: If item is invalid
        """
        if not isinstance(item, dict) or 'id' not in item:
            raise ValueError("Invalid item provided")
        
        logger.info(f"Processing item: {item.get('name', 'Unknown')}")
        
        # Main processing logic
        processed_item = {
            **item,
            'processed': True,
            'timestamp': datetime.now().isoformat(),
            'processor_version': self.config['version']
        }
        
        return processed_item
    
    def validate_item(self, item: Dict[str, Any]) -> bool:
        """Validate item before processing"""
        required_fields = ['id', 'name']
        return all(field in item for field in required_fields)
    
    async def run(self) -> List[Dict[str, Any]]:
        """
        Run the main application logic
        
        Returns:
            List of processed items
        """
        try:
            logger.info("Starting application")
            
            await self.load_data()
            
            processed_items = []
            for item in self.data:
                if self.validate_item(item):
                    result = self.process_item(item)
                    processed_items.append(result)
                else:
                    logger.warning(f"Skipping invalid item: {item}")
            
            logger.info(f"Application completed. Processed {len(processed_items)} items")
            return processed_items
            
        except Exception as e:
            logger.error(f"Application error: {e}")
            raise

# Main execution
async def main():
    """Main entry point"""
    app = MainApplication()
    try:
        results = await app.run()
        print(f"Successfully processed {len(results)} items")
        return results
    except Exception as e:
        print(f"Application failed: {e}")
        return []

if __name__ == "__main__":
    asyncio.run(main())`;
    }
    
    return `// Sample implementation for ${description}
// This is a basic template that can be customized further

public class MainApplication {
    private String description = "${description}";
    
    public static void main(String[] args) {
        MainApplication app = new MainApplication();
        app.run();
    }
    
    public void run() {
        System.out.println("Running: " + description);
        // Add your implementation here
    }
}`;
  }

  generateUsageExample(description, language) {
    if (language === 'javascript') {
      return `// Usage example for ${description}
const app = new MainApplication();

// Run the application
app.run()
  .then(() => console.log('Success!'))
  .catch(err => console.error('Error:', err));

// Process individual items
const item = { id: 1, name: 'Test Item' };
const result = app.processItem(item);
console.log('Processed:', result);`;
    } else if (language === 'python') {
      return `# Usage example for ${description}
import asyncio

async def example_usage():
    app = MainApplication()
    
    # Run the full application
    results = await app.run()
    print(f"Processed {len(results)} items")
    
    # Process individual item
    item = {'id': 1, 'name': 'Test Item'}
    result = app.process_item(item)
    print(f"Individual result: {result}")

# Run the example
asyncio.run(example_usage())`;
    }
    
    return `// Usage example
MainApplication app = new MainApplication();
app.run();`;
  }

  // Algorithm Helper prompts
  async explainAlgorithm(userId, algorithmName, problemType = '', context = '') {
    const additionalContext = problemType || context ? 
      `\n\nADDITIONAL CONTEXT:\n- Problem Type: ${problemType || 'Not specified'}\n- Context: ${context || 'Not specified'}\n\nPlease tailor your explanation to this specific context.` : '';
    
    const prompt = `You are a world-renowned computer science professor and algorithm expert with deep expertise in computational theory. Provide a COMPREHENSIVE explanation of algorithms that students and professionals can understand and implement.${additionalContext}

Please provide your response in this EXACT format:

## 🧠 COMPLETE ALGORITHM GUIDE: ${algorithmName}

### 📖 ALGORITHM OVERVIEW
**Definition:** [Clear, concise definition of the algorithm]
**Purpose:** [What problem does this algorithm solve?]
**Category:** [Type of algorithm - sorting, searching, graph, etc.]
**Difficulty Level:** [Beginner/Intermediate/Advanced]

### 🎯 PROBLEM STATEMENT
[Detailed explanation of the problem this algorithm addresses]
[Real-world scenarios where this algorithm is used]

### 🔍 HOW IT WORKS

#### Step-by-Step Process:
1. **Step 1:** [Detailed explanation of first step]
2. **Step 2:** [Detailed explanation of second step]
3. **Step 3:** [Continue with all steps...]
[Provide complete breakdown of the algorithm's logic]

#### Visual Description:
[Describe how the algorithm would look if visualized]
[Explain the flow of data and operations]

### ⚡ COMPLEXITY ANALYSIS

#### Time Complexity:
- **Best Case:** O(?) - [Explanation of when this occurs]
- **Average Case:** O(?) - [Typical performance]
- **Worst Case:** O(?) - [Worst scenario explanation]

#### Space Complexity:
- **Memory Usage:** O(?) - [Memory requirements explanation]
- **Auxiliary Space:** [Additional space needed]

### 💻 COMPLETE IMPLEMENTATIONS

#### JavaScript Implementation:
\`\`\`javascript
/**
 * ${algorithmName} Implementation
 * Time Complexity: O(?) | Space Complexity: O(?)
 */

[Complete, optimized JavaScript implementation with comments]
[Include helper functions if needed]
[Add input validation and error handling]

// Usage example:
[Show how to use the implementation]
\`\`\`

#### Python Implementation:
\`\`\`python
"""
${algorithmName} Implementation
Time Complexity: O(?) | Space Complexity: O(?)
"""

[Complete, optimized Python implementation with type hints]
[Include docstrings and error handling]

# Usage example:
[Show how to use the implementation]
\`\`\`

#### Java Implementation:
\`\`\`java
/**
 * ${algorithmName} Implementation
 * Time Complexity: O(?) | Space Complexity: O(?)
 */

[Complete, optimized Java implementation]
[Include proper class structure and error handling]

// Usage example:
[Show how to use the implementation]
\`\`\`

### 🌍 REAL-WORLD APPLICATIONS
1. **Application 1:** [Specific industry/use case]
2. **Application 2:** [Another practical example]
3. **Application 3:** [Additional use case]

### 🔧 OPTIMIZATION TECHNIQUES
[List various optimization strategies]
[Explain trade-offs between time and space]
[Mention advanced variations]

### 📊 COMPARISON WITH ALTERNATIVES
| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|------------------|----------|
| ${algorithmName} | O(?) | O(?) | [Use cases] |
| Alternative 1 | O(?) | O(?) | [Use cases] |
| Alternative 2 | O(?) | O(?) | [Use cases] |

### 🧪 TESTING & EXAMPLES

#### Test Cases:
\`\`\`
Input: [Example input 1]
Output: [Expected output 1]
Explanation: [Why this output?]

Input: [Example input 2]  
Output: [Expected output 2]
Explanation: [Why this output?]

Edge Cases:
- [Edge case 1]
- [Edge case 2]
- [Edge case 3]
\`\`\`

### 💡 INTERVIEW TIPS
[Common interview questions about this algorithm]
[Key points to remember during coding interviews]
[Variations commonly asked]

### 📚 FURTHER LEARNING
**Prerequisites:**
- [Required knowledge]
- [Mathematical concepts]

**Advanced Topics:**
- [Related algorithms]
- [Advanced variations]
- [Research papers/resources]

### 🏆 PRACTICE PROBLEMS
1. **Easy:** [Problem description with link if available]
2. **Medium:** [Problem description]
3. **Hard:** [Problem description]

Please explain the ${algorithmName} algorithm with complete educational depth and practical examples.`;

    try {
      const explanation = await this.makeRequest(userId, prompt);
      return { success: true, data: explanation };
    } catch (error) {
      console.error('Algorithm explanation error:', error);
      return { 
        success: false, 
        message: 'Failed to explain algorithm: ' + error.message,
        data: this.generateMockAlgorithmExplanation(algorithmName)
      };
    }
  }

  // Enhanced mock algorithm explanation
  generateMockAlgorithmExplanation(algorithmName) {
    return `# 🧠 COMPLETE ALGORITHM GUIDE: ${algorithmName} (Fallback Mode)

## 📖 ALGORITHM OVERVIEW
**Definition:** ${algorithmName} is a fundamental algorithm used in computer science
**Purpose:** Solves computational problems efficiently
**Category:** Core algorithm
**Difficulty Level:** Intermediate

## 🎯 PROBLEM STATEMENT
The ${algorithmName} algorithm addresses the need to process data in an optimal way, providing a systematic approach to problem-solving that is both efficient and reliable.

## 🔍 HOW IT WORKS

### Step-by-Step Process:
1. **Initialization:** Set up initial variables and data structures
2. **Processing:** Apply the core algorithm logic iteratively
3. **Optimization:** Refine the solution based on conditions
4. **Termination:** Return the final result when conditions are met

### Visual Description:
The algorithm works by systematically processing input data through a series of logical steps, maintaining state information throughout the process, and producing optimal results.

## ⚡ COMPLEXITY ANALYSIS

### Time Complexity:
- **Best Case:** O(n) - When input is already optimized
- **Average Case:** O(n log n) - Typical performance scenario
- **Worst Case:** O(n²) - When input requires maximum processing

### Space Complexity:
- **Memory Usage:** O(n) - Linear space requirement
- **Auxiliary Space:** O(log n) - Additional space for processing

## 💻 COMPLETE IMPLEMENTATIONS

### JavaScript Implementation:
\`\`\`javascript
/**
 * ${algorithmName} Implementation
 * Time Complexity: O(n log n) | Space Complexity: O(n)
 */

function ${algorithmName.toLowerCase().replace(/\s+/g, '')}(arr) {
    // Input validation
    if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error('Invalid input: Expected non-empty array');
    }
    
    // Algorithm implementation
    const result = [];
    const n = arr.length;
    
    // Main algorithm logic
    for (let i = 0; i < n; i++) {
        // Process each element
        const processed = processElement(arr[i], i);
        result.push(processed);
    }
    
    return result;
}

function processElement(element, index) {
    // Helper function for processing individual elements
    return {
        value: element,
        index: index,
        processed: true
    };
}

// Usage example:
const input = [3, 1, 4, 1, 5, 9, 2, 6];
const output = ${algorithmName.toLowerCase().replace(/\s+/g, '')}(input);
console.log('Result:', output);
\`\`\`

### Python Implementation:
\`\`\`python
"""
${algorithmName} Implementation
Time Complexity: O(n log n) | Space Complexity: O(n)
"""

from typing import List, Any

def ${algorithmName.toLowerCase().replace(/\s+/g, '_')}(arr: List[Any]) -> List[Any]:
    """
    Implement ${algorithmName} algorithm
    
    Args:
        arr: Input array to process
        
    Returns:
        Processed array
        
    Raises:
        ValueError: If input is invalid
    """
    # Input validation
    if not isinstance(arr, list) or len(arr) == 0:
        raise ValueError("Invalid input: Expected non-empty list")
    
    # Algorithm implementation
    result = []
    n = len(arr)
    
    # Main algorithm logic
    for i in range(n):
        processed = _process_element(arr[i], i)
        result.append(processed)
    
    return result

def _process_element(element: Any, index: int) -> dict:
    """Helper function for processing individual elements"""
    return {
        'value': element,
        'index': index,
        'processed': True
    }

# Usage example:
if __name__ == "__main__":
    input_data = [3, 1, 4, 1, 5, 9, 2, 6]
    output = ${algorithmName.toLowerCase().replace(/\s+/g, '_')}(input_data)
    print(f"Result: {output}")
\`\`\`

### Java Implementation:
\`\`\`java
/**
 * ${algorithmName} Implementation
 * Time Complexity: O(n log n) | Space Complexity: O(n)
 */

import java.util.*;

public class ${algorithmName.replace(/\s+/g, '')}Algorithm {
    
    public static List<Map<String, Object>> ${algorithmName.toLowerCase().replace(/\s+/g, '')}(int[] arr) {
        // Input validation
        if (arr == null || arr.length == 0) {
            throw new IllegalArgumentException("Invalid input: Expected non-empty array");
        }
        
        // Algorithm implementation
        List<Map<String, Object>> result = new ArrayList<>();
        int n = arr.length;
        
        // Main algorithm logic
        for (int i = 0; i < n; i++) {
            Map<String, Object> processed = processElement(arr[i], i);
            result.add(processed);
        }
        
        return result;
    }
    
    private static Map<String, Object> processElement(int element, int index) {
        Map<String, Object> result = new HashMap<>();
        result.put("value", element);
        result.put("index", index);
        result.put("processed", true);
        return result;
    }
    
    // Usage example:
    public static void main(String[] args) {
        int[] input = {3, 1, 4, 1, 5, 9, 2, 6};
        List<Map<String, Object>> output = ${algorithmName.toLowerCase().replace(/\s+/g, '')}(input);
        System.out.println("Result: " + output);
    }
}
\`\`\`

## 🌍 REAL-WORLD APPLICATIONS
1. **Data Processing:** Used in big data analytics and ETL pipelines
2. **Search Engines:** Core component in indexing and ranking algorithms
3. **Machine Learning:** Feature processing and optimization

## 🔧 OPTIMIZATION TECHNIQUES
- Use appropriate data structures for specific use cases
- Implement memoization for repeated calculations
- Consider parallel processing for large datasets
- Apply early termination conditions when possible

## 📊 COMPARISON WITH ALTERNATIVES
| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|------------------|----------|
| ${algorithmName} | O(n log n) | O(n) | General purpose |
| Alternative A | O(n²) | O(1) | Small datasets |
| Alternative B | O(n) | O(n²) | Memory-rich environments |

## 🧪 TESTING & EXAMPLES

### Test Cases:
\`\`\`
Input: [1, 2, 3, 4, 5]
Output: [{value: 1, index: 0, processed: true}, ...]
Explanation: Each element is processed with its index

Input: []
Output: Error - Invalid input
Explanation: Empty arrays are not allowed

Edge Cases:
- Single element array
- Array with duplicate values
- Very large arrays
\`\`\`

## 💡 INTERVIEW TIPS
- Understand the time and space complexity trade-offs
- Be able to explain the algorithm step-by-step
- Know when to use this algorithm vs alternatives
- Practice implementing without looking at references

## 📚 FURTHER LEARNING
**Prerequisites:**
- Basic data structures (arrays, lists)
- Big O notation understanding
- Basic programming concepts

**Advanced Topics:**
- Parallel implementations
- Optimization techniques
- Related algorithms and variations

## 🏆 PRACTICE PROBLEMS
1. **Easy:** Implement basic version with error handling
2. **Medium:** Optimize for specific data patterns
3. **Hard:** Adapt algorithm for streaming data

---
*Note: This is a comprehensive fallback explanation. For detailed AI-generated algorithm analysis, ensure API access is available.*`;
  }

  // Custom tool execution
  async executeCustomTool(userId, toolConfig, userInput) {
    try {
      const config = JSON.parse(toolConfig);
      const systemPrompt = config.systemPrompt || 'You are a helpful AI assistant.';
      const userPrompt = config.userPrompt || userInput;

      const prompt = `${systemPrompt}

${userPrompt.replace('{{input}}', userInput)}`;

      const result = await this.makeRequest(userId, prompt, config.options || {});
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: 'Failed to execute custom tool: ' + error.message };
    }
  }
}

module.exports = new GeminiService();
