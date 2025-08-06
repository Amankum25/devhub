const express = require('express');
const router = express.Router();
const deepseekService = require('../services/deepseekService');
const { authenticateToken } = require('../middleware/auth');
const AIInteraction = require('../models/AIInteraction');
const User = require('../models/User');

// Check API key status
router.get('/check-api-key', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ hasApiKey: !!user.deepseekApiKey });
  } catch (error) {
    console.error('Error checking API key status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set user's DeepSeek API key
router.post('/set-api-key', authenticateToken, async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }

    // Store the API key in the database
    await User.findByIdAndUpdate(req.user.id, { deepseekApiKey: apiKey });
    
    // Also store it in the service for immediate use
    deepseekService.setUserApiKey(req.user.id, apiKey);

    res.json({
      success: true,
      message: 'DeepSeek API key configured successfully'
    });
  } catch (error) {
    console.error('Error setting API key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set API key'
    });
  }
});

// Remove API key
router.delete('/remove-api-key', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $unset: { deepseekApiKey: 1 } });
    deepseekService.removeUserApiKey(req.user.id);
    res.json({ success: true, message: 'API key removed successfully' });
  } catch (error) {
    console.error('Error removing API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Code Explainer
router.post('/code-explain', authenticateToken, async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    const result = await deepseekService.explainCode(req.user.id, code, language);

    // Save interaction
    await AIInteraction.create({
      userId: req.user.id,
      tool: 'Code Explainer',
      input: { code, language },
      output: result.choices[0].message.content,
      tokens: result.usage
    });

    res.json({
      success: true,
      data: {
        explanation: result.choices[0].message.content,
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Code explain error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to explain code'
    });
  }
});

// Resume Review
router.post('/resume-review', authenticateToken, async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required'
      });
    }

    const result = await deepseekService.reviewResume(req.user.id, resumeText);

    // Save interaction
    await AIInteraction.create({
      userId: req.user.id,
      tool: 'Resume Review',
      input: { resumeText: resumeText.substring(0, 500) + '...' }, // Truncate for storage
      output: result.choices[0].message.content,
      tokens: result.usage
    });

    res.json({
      success: true,
      data: {
        review: result.choices[0].message.content,
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Resume review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to review resume'
    });
  }
});

// Bug Fixer
router.post('/bug-fix', authenticateToken, async (req, res) => {
  try {
    const { code, language = 'javascript', errorMessage = '' } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    const result = await deepseekService.fixBugs(req.user.id, code, language, errorMessage);

    // Save interaction
    await AIInteraction.create({
      userId: req.user.id,
      tool: 'Bug Fixer',
      input: { code, language, errorMessage },
      output: result.choices[0].message.content,
      tokens: result.usage
    });

    res.json({
      success: true,
      data: {
        solution: result.choices[0].message.content,
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Bug fix error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fix bugs'
    });
  }
});

// Project Suggestions
router.post('/project-suggest', authenticateToken, async (req, res) => {
  try {
    const { skills, experience, interests = '' } = req.body;

    if (!skills || !experience) {
      return res.status(400).json({
        success: false,
        message: 'Skills and experience level are required'
      });
    }

    const result = await deepseekService.suggestProjects(req.user.id, skills, experience, interests);

    // Save interaction
    await AIInteraction.create({
      userId: req.user.id,
      tool: 'Project Suggestions',
      input: { skills, experience, interests },
      output: result.choices[0].message.content,
      tokens: result.usage
    });

    res.json({
      success: true,
      data: {
        suggestions: result.choices[0].message.content,
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Project suggest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to suggest projects'
    });
  }
});

// Code Generator
router.post('/code-generate', authenticateToken, async (req, res) => {
  try {
    const { description, language = 'javascript', framework = '' } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const result = await deepseekService.generateCode(req.user.id, description, language, framework);

    // Save interaction
    await AIInteraction.create({
      userId: req.user.id,
      tool: 'Code Generator',
      input: { description, language, framework },
      output: result.choices[0].message.content,
      tokens: result.usage
    });

    res.json({
      success: true,
      data: {
        code: result.choices[0].message.content,
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Code generate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate code'
    });
  }
});

// Algorithm Helper
router.post('/algorithm-helper', authenticateToken, async (req, res) => {
  try {
    const { algorithmName, includeImplementation = false } = req.body;

    if (!algorithmName) {
      return res.status(400).json({
        success: false,
        message: 'Algorithm name is required'
      });
    }

    const result = await deepseekService.explainAlgorithm(req.user.id, algorithmName, includeImplementation);

    // Save interaction
    await AIInteraction.create({
      userId: req.user.id,
      tool: 'Algorithm Helper',
      input: { algorithmName, includeImplementation },
      output: result.choices[0].message.content,
      tokens: result.usage
    });

    res.json({
      success: true,
      data: {
        explanation: result.choices[0].message.content,
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Algorithm helper error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to explain algorithm'
    });
  }
});

// Execute Custom Tool
router.post('/custom-tool/:toolId/execute', authenticateToken, async (req, res) => {
  try {
    const { toolId } = req.params;
    const { input } = req.body;

    // Get custom tool configuration from database
    const CustomTool = require('../models/CustomAITool');
    const tool = await CustomTool.findOne({ _id: toolId, userId: req.user.id });

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Custom tool not found'
      });
    }

    const result = await deepseekService.executeCustomTool(req.user.id, tool.config, input);

    // Save interaction
    await AIInteraction.create({
      userId: req.user.id,
      tool: `Custom: ${tool.name}`,
      input: { toolId, input },
      output: result.choices[0].message.content,
      tokens: result.usage
    });

    res.json({
      success: true,
      data: {
        result: result.choices[0].message.content,
        usage: result.usage
      }
    });
  } catch (error) {
    console.error('Custom tool execution error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to execute custom tool'
    });
  }
});

// Get recent interactions
router.get('/recent-interactions', authenticateToken, async (req, res) => {
  try {
    const interactions = await AIInteraction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('tool input.description createdAt')
      .lean();

    const formattedInteractions = interactions.map(interaction => ({
      id: interaction._id,
      tool: interaction.tool,
      text: interaction.input?.description || 
            interaction.input?.code?.substring(0, 50) + '...' ||
            interaction.input?.algorithmName ||
            'AI interaction',
      timestamp: interaction.createdAt
    }));

    res.json({
      success: true,
      data: {
        interactions: formattedInteractions
      }
    });
  } catch (error) {
    console.error('Error fetching recent interactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent interactions'
    });
  }
});

// Get user's API key status
router.get('/api-key-status', authenticateToken, async (req, res) => {
  try {
    const hasApiKey = deepseekService.getUserApiKey(req.user.id) !== undefined;
    
    res.json({
      success: true,
      data: {
        hasApiKey,
        configured: hasApiKey
      }
    });
  } catch (error) {
    console.error('Error checking API key status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check API key status'
    });
  }
});

module.exports = router;
