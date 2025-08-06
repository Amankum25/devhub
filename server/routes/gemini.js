const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check authentication for most routes
const authMiddleware = (req, res, next) => {
  // Skip auth for certain routes if needed
  if (req.path === '/health') {
    return next();
  }
  return authenticateToken(req, res, next);
};

// Health check for Gemini service
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'gemini',
    timestamp: new Date().toISOString()
  });
});

// Explain code endpoint
router.post('/explain-code', authMiddleware, async (req, res) => {
  try {
    const { code, language } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await geminiService.explainCode(userId, code, language);
    
    console.log('Sending response:', {
      success: result.success,
      hasData: !!result.data,
      dataLength: result.data ? result.data.length : 0
    });
    
    res.json(result);
  } catch (error) {
    console.error('Code explanation error:', error);
    res.status(500).json({ error: 'Failed to explain code' });
  }
});

// Review resume endpoint
router.post('/review-resume', authMiddleware, async (req, res) => {
  try {
    const { resumeText } = req.body;
    const userId = req.user.id;

    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const result = await geminiService.reviewResume(userId, resumeText);
    res.json(result);
  } catch (error) {
    console.error('Resume review error:', error);
    res.status(500).json({ error: 'Failed to review resume' });
  }
});

// Fix bugs endpoint
router.post('/fix-bugs', authMiddleware, async (req, res) => {
  try {
    const { code, language, errorMessage } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await geminiService.fixBugs(userId, code, language, errorMessage);
    res.json(result);
  } catch (error) {
    console.error('Bug fixing error:', error);
    res.status(500).json({ error: 'Failed to fix bugs' });
  }
});

// Suggest projects endpoint
router.post('/suggest-projects', async (req, res) => {
  try {
    const { skills, experience, interests } = req.body;
    const userId = 'test-user'; // Temporary for testing

    console.log('Project suggestion request:', { skills, experience, interests, userId });

    if (!skills) {
      return res.status(400).json({ error: 'Skills are required' });
    }

    const result = await geminiService.suggestProjects(userId, skills, experience, interests);
    console.log('Project suggestion result:', { success: result.success, hasData: !!result.data, dataLength: result.data ? result.data.length : 0 });
    res.json(result);
  } catch (error) {
    console.error('Project suggestion error:', error);
    res.status(500).json({ error: 'Failed to suggest projects' });
  }
});

// Generate code endpoint
router.post('/generate-code', async (req, res) => {
  try {
    const { description, language, framework } = req.body;
    const userId = 'test-user'; // Temporary for testing

    console.log('Code generation request:', { description, language, framework, userId });

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const result = await geminiService.generateCode(userId, description, language, framework);
    console.log('Code generation result:', { success: result.success, hasData: !!result.data, dataLength: result.data ? result.data.length : 0 });
    res.json(result);
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

// Explain algorithm endpoint
router.post('/explain-algorithm', async (req, res) => {
  try {
    const { algorithmName, problemType, context } = req.body;
    const userId = 'test-user'; // Temporary for testing

    console.log('Algorithm explanation request:', { algorithmName, problemType, context, userId });

    if (!algorithmName) {
      return res.status(400).json({ error: 'Algorithm name is required' });
    }

    const result = await geminiService.explainAlgorithm(userId, algorithmName, problemType, context);
    console.log('Algorithm explanation result:', { success: result.success, hasData: !!result.data, dataLength: result.data ? result.data.length : 0 });
    res.json(result);
  } catch (error) {
    console.error('Algorithm explanation error:', error);
    res.status(500).json({ error: 'Failed to explain algorithm' });
  }
});

// Execute custom tool endpoint
router.post('/custom-tool', authMiddleware, async (req, res) => {
  try {
    const { toolConfig, userInput } = req.body;
    const userId = req.user.id;

    if (!toolConfig || !userInput) {
      return res.status(400).json({ error: 'Tool configuration and user input are required' });
    }

    const result = await geminiService.executeCustomTool(userId, toolConfig, userInput);
    res.json(result);
  } catch (error) {
    console.error('Custom tool execution error:', error);
    res.status(500).json({ error: 'Failed to execute custom tool' });
  }
});

// Set user API key endpoint
router.post('/set-api-key', authMiddleware, async (req, res) => {
  try {
    const { apiKey } = req.body;
    const userId = req.user.id;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    geminiService.setUserApiKey(userId, apiKey);
    res.json({ success: true, message: 'API key set successfully' });
  } catch (error) {
    console.error('API key setting error:', error);
    res.status(500).json({ error: 'Failed to set API key' });
  }
});

// Remove user API key endpoint
router.delete('/api-key', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    geminiService.removeUserApiKey(userId);
    res.json({ success: true, message: 'API key removed successfully' });
  } catch (error) {
    console.error('API key removal error:', error);
    res.status(500).json({ error: 'Failed to remove API key' });
  }
});

module.exports = router;
