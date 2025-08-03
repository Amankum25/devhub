const express = require("express");
const database = require("../config/database");
const aiService = require("../services/aiService");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { validationRules } = require("../middleware/validation");

const router = express.Router();

// AI interaction endpoint
router.post(
  "/interact",
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

    // Save interaction to database (Note: This is using SQLite syntax, but you're using MongoDB)
    // TODO: Update this to use MongoDB instead of SQLite
    /*
    const result = await db.run(
      `
    INSERT INTO ai_interactions (userId, tool, input, output, status, tokensUsed, processingTime)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
      [
        req.user.id,
        tool,
        input,
        output,
        "completed",
        tokensUsed,
        processingTime,
      ],
    );
    */

    res.json({
      success: true,
      data: {
        // id: result.lastID,
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
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const tool = req.query.tool || "";
    const offset = (page - 1) * limit;

    const db = database.getDb();

    let conditions = ["userId = ?"];
    let params = [req.user.id];

    if (tool) {
      conditions.push("tool = ?");
      params.push(tool);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const interactions = await db.all(
      `
    SELECT id, tool, input, output, status, tokensUsed, processingTime, createdAt
    FROM ai_interactions
    ${whereClause}
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `,
      [...params, limit, offset],
    );

    const countResult = await db.get(
      `
    SELECT COUNT(*) as total FROM ai_interactions ${whereClause}
  `,
      params,
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        interactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }),
);

// Get AI usage statistics
router.get(
  "/stats",
  catchAsync(async (req, res) => {
    const db = database.getDb();

    const userStats = await db.get(
      `
    SELECT 
      COUNT(*) as totalInteractions,
      SUM(tokensUsed) as totalTokens,
      COUNT(CASE WHEN createdAt > datetime('now', '-24 hours') THEN 1 END) as last24h,
      COUNT(CASE WHEN createdAt > datetime('now', '-7 days') THEN 1 END) as last7days
    FROM ai_interactions
    WHERE userId = ?
  `,
      [req.user.id],
    );

    const toolUsage = await db.all(
      `
    SELECT 
      tool,
      COUNT(*) as count,
      AVG(processingTime) as avgProcessingTime
    FROM ai_interactions
    WHERE userId = ?
    GROUP BY tool
    ORDER BY count DESC
  `,
      [req.user.id],
    );

    res.json({
      success: true,
      data: {
        userStats,
        toolUsage,
      },
    });
  }),
);

module.exports = router;
