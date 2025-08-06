const express = require("express");
const database = require("../config/database");
const aiService = require("../services/aiService");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { validationRules } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");
const AIInteraction = require("../models/AIInteraction");
const CustomAITool = require("../models/CustomAITool");

const router = express.Router();

// Custom Tools Routes
router.get("/custom-tools", authenticateToken, catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const tools = await CustomAITool.findByUser(userId);
  
  res.json({ 
    success: true, 
    tools: tools.map(tool => ({
      id: tool._id,
      name: tool.name,
      description: tool.description,
      type: tool.type,
      config: tool.config,
      status: tool.status,
      createdAt: tool.createdAt,
      lastChecked: tool.lastChecked,
      usageCount: tool.usageCount
    }))
  });
}));

router.post("/custom-tools", authenticateToken, catchAsync(async (req, res) => {
  const { name, description, type, config } = req.body;
  const userId = req.user.id;
  
  if (!name || !description || !type) {
    throw new AppError("Name, description, and type are required", 400);
  }
  
  // Validate JSON config if provided
  let parsedConfig = {};
  if (config) {
    try {
      parsedConfig = typeof config === 'string' ? JSON.parse(config) : config;
    } catch (error) {
      throw new AppError("Invalid JSON configuration", 400);
    }
  }
  
  const customTool = new CustomAITool({
    userId,
    name: name.trim(),
    description: description.trim(),
    type,
    config: parsedConfig,
    status: 'active'
  });
  
  await customTool.save();
  
  res.json({ 
    success: true, 
    message: 'Custom tool created successfully',
    toolId: customTool._id,
    tool: {
      id: customTool._id,
      name: customTool.name,
      description: customTool.description,
      type: customTool.type,
      config: customTool.config,
      status: customTool.status,
      createdAt: customTool.createdAt
    }
  });
}));

router.get("/custom-tools/:id/status", authenticateToken, catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const tool = await CustomAITool.findOne({ _id: id, userId });
  
  if (!tool) {
    throw new AppError("Tool not found", 404);
  }
  
  // Update last checked timestamp
  tool.lastChecked = new Date();
  await tool.save();
  
  res.json({ 
    success: true, 
    status: tool.status,
    name: tool.name,
    lastChecked: tool.lastChecked
  });
}));

router.delete("/custom-tools/:id", authenticateToken, catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const result = await CustomAITool.findOneAndDelete({ _id: id, userId });
  
  if (!result) {
    throw new AppError("Tool not found or access denied", 404);
  }
  
  res.json({ success: true, message: 'Tool deleted successfully' });
}));

// AI interaction endpoint
router.post(
  "/interact",
  authenticateToken,
  validationRules.aiInteraction,
  catchAsync(async (req, res) => {
    const { tool, input } = req.body;
    
    // Simulate processing time
    const processingStart = Date.now();

    let aiResult;
    let output = "";
    let tokensUsed = 0;
    let model = "";

    // Use real AI service based on tool
    try {
      switch (tool) {
        case "code_explain":
          aiResult = await aiService.explainCode(input);
          output = aiResult.explanation || aiResult;
          break;
        case "project_suggest":
          aiResult = await aiService.suggestProject(input);
          output = aiResult.suggestion || aiResult;
          break;
        case "resume_review":
          aiResult = await aiService.reviewResume(input);
          output = aiResult.review || aiResult;
          break;
        case "code_generate":
          aiResult = await aiService.generateCode(input);
          output = aiResult.code || aiResult;
          break;
        case "bug_fix":
          // Expecting input format: "code|bugDescription" 
          const [code, bugDesc] = input.split('|SEPARATOR|');
          aiResult = await aiService.fixBug(code || input, bugDesc || '');
          output = aiResult.fixedCode || aiResult;
          break;
        case "algorithm_help":
          aiResult = await aiService.helpWithAlgorithm(input);
          output = aiResult.solution || aiResult;
          break;
        default:
          output = "AI processing completed. Please provide more specific information for detailed analysis.";
      }

      // Extract tokens and model info if available
      if (typeof aiResult === 'object') {
        tokensUsed = aiResult.tokensUsed || Math.floor(input.length / 4);
        model = aiResult.model || 'unknown';
      } else {
        tokensUsed = Math.floor(input.length / 4);
        model = 'mock-model';
      }

    } catch (error) {
      console.error('AI processing error:', error);
      output = "Sorry, there was an error processing your request. Please try again.";
      tokensUsed = Math.floor(input.length / 4);
      model = 'error';
    }

    const processingTime = Date.now() - processingStart;

    // Save interaction to MongoDB
    const interaction = new AIInteraction({
      user: req.user.userId,
      request: {
        type: tool,
        input: input,
      },
      response: {
        output: output,
        confidence: 85, // Default confidence
      },
      metadata: {
        model: model,
        tokenUsage: {
          total: tokensUsed,
        },
        processingTime: processingTime,
      },
      status: "completed",
    });

    await interaction.save();

    res.json({
      success: true,
      data: {
        id: interaction._id,
        tool,
        input,
        output,
        processingTime,
        tokensUsed,
        model,
        timestamp: new Date().toISOString(),
      },
    });
  }),
);

// AI service status endpoint
router.get(
  "/status",
  catchAsync(async (req, res) => {
    res.json({
      success: true,
      data: {
        aiConfigured: aiService.isConfigured(),
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 2048,
        availableTools: [
          'code_explain',
          'project_suggest', 
          'resume_review',
          'code_generate',
          'bug_fix',
          'algorithm_help'
        ],
        message: aiService.isConfigured() 
          ? 'AI service is configured and ready'
          : 'AI service is using mock responses. Configure OPENAI_API_KEY to enable real AI.'
      },
    });
  }),
);

// Get user's AI interaction history
router.get(
  "/history",
  authenticateToken,
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const tool = req.query.tool || "";
    const skip = (page - 1) * limit;

    // Build query
    const query = { user: req.user.userId };
    if (tool) {
      query["request.type"] = tool;
    }

    const interactions = await AIInteraction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select("request response metadata status createdAt");

    const total = await AIInteraction.countDocuments(query);

    res.json({
      success: true,
      data: {
        interactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }),
);

// Get AI usage statistics
router.get(
  "/stats",
  authenticateToken,
  catchAsync(async (req, res) => {
    const userStats = await AIInteraction.aggregate([
      {
        $match: { user: req.user.userId }
      },
      {
        $group: {
          _id: null,
          totalInteractions: { $sum: 1 },
          totalTokens: { $sum: "$metadata.tokenUsage.total" },
          last24h: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", new Date(Date.now() - 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          },
          last7days: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const toolUsage = await AIInteraction.aggregate([
      {
        $match: { user: req.user.userId }
      },
      {
        $group: {
          _id: "$request.type",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const stats = userStats[0] || {
      totalInteractions: 0,
      totalTokens: 0,
      last24h: 0,
      last7days: 0
    };

    res.json({
      success: true,
      data: {
        stats,
        toolUsage,
      },
    });
  }),
);

module.exports = router;
