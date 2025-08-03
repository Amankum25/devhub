const express = require("express");
const database = require("../config/database");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { validationRules } = require("../middleware/validation");

const router = express.Router();

// Mock AI interaction endpoint
router.post(
  "/interact",
  validationRules.aiInteraction,
  catchAsync(async (req, res) => {
    const { tool, input } = req.body;
    const db = database.getDb();

    // Simulate processing time
    const processingStart = Date.now();

    // Mock AI responses based on tool
    let output = "";
    switch (tool) {
      case "code_explain":
        output = `This code appears to be ${input.includes("function") ? "a JavaScript function" : "a code snippet"} that ${input.includes("async") ? "performs asynchronous operations" : "executes synchronously"}. It ${input.includes("return") ? "returns a value" : "performs operations"} and follows ${input.includes("const") || input.includes("let") ? "modern ES6+ syntax" : "traditional JavaScript patterns"}.`;
        break;
      case "project_suggest":
        output = `Based on your description, I suggest building a ${input.includes("web") ? "web application" : "software project"} using ${input.includes("React") || input.includes("JavaScript") ? "React.js with Node.js backend" : "a modern tech stack"}. Consider implementing features like user authentication, data management, and responsive design.`;
        break;
      case "resume_review":
        output = `Your resume shows ${input.includes("experience") ? "good work experience" : "potential for growth"}. Consider highlighting ${input.includes("skills") ? "your technical skills more prominently" : "specific achievements and quantifiable results"}. The format ${input.includes("organized") ? "appears well-organized" : "could benefit from better structure"}.`;
        break;
      default:
        output =
          "AI processing completed. Please provide more specific information for detailed analysis.";
    }

    const processingTime = Date.now() - processingStart;

    // Save interaction to database
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
        Math.floor(input.length / 4),
        processingTime,
      ],
    );

    res.json({
      success: true,
      data: {
        id: result.lastID,
        tool,
        input,
        output,
        processingTime,
        tokensUsed: Math.floor(input.length / 4),
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
