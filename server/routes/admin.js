const express = require("express");
const database = require("../config/database");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// All routes require admin privileges
router.use(requireAdmin);

// Dashboard statistics
router.get(
  "/dashboard",
  catchAsync(async (req, res) => {
    const db = database.getDb();

    // Get basic counts
    const stats = await db.get(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE isActive = 1) as totalUsers,
      (SELECT COUNT(*) FROM posts WHERE status = 'published') as totalPosts,
      (SELECT COUNT(*) FROM comments WHERE status = 'approved') as totalComments,
      (SELECT COUNT(*) FROM snippets WHERE isPublic = 1) as totalSnippets,
      (SELECT COUNT(*) FROM chat_messages WHERE deletedAt IS NULL) as totalMessages,
      (SELECT COUNT(*) FROM ai_interactions) as totalAIInteractions
  `);

    // Get recent activity
    const recentUsers = await db.all(`
    SELECT id, firstName, lastName, email, createdAt
    FROM users 
    WHERE isActive = 1
    ORDER BY createdAt DESC 
    LIMIT 5
  `);

    const recentPosts = await db.all(`
    SELECT 
      p.id, p.title, p.createdAt,
      u.firstName, u.lastName, u.username
    FROM posts p
    JOIN users u ON p.userId = u.id
    WHERE p.status = 'published'
    ORDER BY p.createdAt DESC 
    LIMIT 5
  `);

    // Get growth metrics (last 30 days)
    const growth = await db.get(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE createdAt > datetime('now', '-30 days')) as newUsers30d,
      (SELECT COUNT(*) FROM posts WHERE createdAt > datetime('now', '-30 days')) as newPosts30d,
      (SELECT COUNT(*) FROM comments WHERE createdAt > datetime('now', '-30 days')) as newComments30d
  `);

    // Get top contributors
    const topContributors = await db.all(`
    SELECT 
      u.id, u.firstName, u.lastName, u.username, u.avatar,
      COUNT(p.id) as postCount,
      COALESCE(SUM(p.views), 0) as totalViews,
      COALESCE(SUM(p.likes), 0) as totalLikes
    FROM users u
    LEFT JOIN posts p ON u.id = p.userId AND p.status = 'published'
    WHERE u.isActive = 1
    GROUP BY u.id
    HAVING postCount > 0
    ORDER BY postCount DESC, totalLikes DESC
    LIMIT 5
  `);

    res.json({
      success: true,
      data: {
        stats,
        recentUsers,
        recentPosts,
        growth,
        topContributors,
      },
    });
  }),
);

// User management
router.get(
  "/users",
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const sort = req.query.sort || "created";
    const offset = (page - 1) * limit;

    const db = database.getDb();

    // Build conditions
    let conditions = [];
    let params = [];

    if (status !== "all") {
      conditions.push("u.isActive = ?");
      params.push(status === "active" ? 1 : 0);
    }

    if (search) {
      conditions.push(
        "(u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ? OR u.username LIKE ?)",
      );
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Build sort
    let sortClause = "";
    switch (sort) {
      case "name":
        sortClause = "ORDER BY u.firstName, u.lastName";
        break;
      case "email":
        sortClause = "ORDER BY u.email";
        break;
      case "login":
        sortClause = "ORDER BY u.lastLoginAt DESC NULLS LAST";
        break;
      case "created":
      default:
        sortClause = "ORDER BY u.createdAt DESC";
        break;
    }

    // Get users with stats
    const users = await db.all(
      `
    SELECT 
      u.id, u.email, u.firstName, u.lastName, u.username, u.avatar,
      u.isAdmin, u.isActive, u.emailVerified, u.lastLoginAt, u.createdAt,
      COALESCE(pc.postCount, 0) as postCount,
      COALESCE(cc.commentCount, 0) as commentCount,
      COALESCE(sc.snippetCount, 0) as snippetCount
    FROM users u
    LEFT JOIN (
      SELECT userId, COUNT(*) as postCount FROM posts GROUP BY userId
    ) pc ON u.id = pc.userId
    LEFT JOIN (
      SELECT userId, COUNT(*) as commentCount FROM comments GROUP BY userId
    ) cc ON u.id = cc.userId
    LEFT JOIN (
      SELECT userId, COUNT(*) as snippetCount FROM snippets GROUP BY userId
    ) sc ON u.id = sc.userId
    ${whereClause}
    ${sortClause}
    LIMIT ? OFFSET ?
  `,
      [...params, limit, offset],
    );

    // Get total count
    const countResult = await db.get(
      `
    SELECT COUNT(*) as total FROM users u ${whereClause}
  `,
      params,
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
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

// Posts management
router.get(
  "/posts",
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "all";
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const db = database.getDb();

    // Build conditions
    let conditions = [];
    let params = [];

    if (status !== "all") {
      conditions.push("p.status = ?");
      params.push(status);
    }

    if (search) {
      conditions.push(
        "(p.title LIKE ? OR p.content LIKE ? OR u.firstName LIKE ? OR u.lastName LIKE ?)",
      );
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get posts
    const posts = await db.all(
      `
    SELECT 
      p.id, p.title, p.excerpt, p.status, p.views, p.likes, p.createdAt, p.publishedAt,
      u.firstName, u.lastName, u.username, u.avatar,
      COUNT(c.id) as commentCount
    FROM posts p
    JOIN users u ON p.userId = u.id
    LEFT JOIN comments c ON p.id = c.postId
    ${whereClause}
    GROUP BY p.id
    ORDER BY p.createdAt DESC
    LIMIT ? OFFSET ?
  `,
      [...params, limit, offset],
    );

    // Get total count
    const countResult = await db.get(
      `
    SELECT COUNT(*) as total 
    FROM posts p
    JOIN users u ON p.userId = u.id
    ${whereClause}
  `,
      params,
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        posts,
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

// System logs and monitoring
router.get(
  "/logs",
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const type = req.query.type || "all";
    const offset = (page - 1) * limit;

    const db = database.getDb();

    // Get recent AI interactions as logs
    let conditions = [];
    let params = [];

    if (type !== "all") {
      conditions.push("ai.tool = ?");
      params.push(type);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const logs = await db.all(
      `
    SELECT 
      ai.id, ai.tool, ai.status, ai.tokensUsed, ai.processingTime, ai.createdAt,
      u.firstName, u.lastName, u.username
    FROM ai_interactions ai
    JOIN users u ON ai.userId = u.id
    ${whereClause}
    ORDER BY ai.createdAt DESC
    LIMIT ? OFFSET ?
  `,
      [...params, limit, offset],
    );

    // Get total count
    const countResult = await db.get(
      `
    SELECT COUNT(*) as total 
    FROM ai_interactions ai
    JOIN users u ON ai.userId = u.id
    ${whereClause}
  `,
      params,
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        logs,
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

// Update user status
router.patch(
  "/users/:userId/status",
  catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { isActive, isAdmin } = req.body;

    if (parseInt(userId) === req.user.id) {
      throw new AppError(
        "Cannot modify your own account status",
        400,
        "CANNOT_MODIFY_SELF",
      );
    }

    const db = database.getDb();

    // Check if user exists
    const user = await db.get("SELECT id FROM users WHERE id = ?", [userId]);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Build update query
    const updates = [];
    const values = [];

    if (isActive !== undefined) {
      updates.push("isActive = ?");
      values.push(isActive);
    }

    if (isAdmin !== undefined) {
      updates.push("isAdmin = ?");
      values.push(isAdmin);
    }

    if (updates.length === 0) {
      throw new AppError("No updates provided", 400, "NO_UPDATES");
    }

    updates.push('updatedAt = datetime("now")');
    values.push(userId);

    await db.run(
      `
    UPDATE users SET ${updates.join(", ")} WHERE id = ?
  `,
      values,
    );

    // If deactivating user, invalidate their sessions
    if (isActive === false) {
      await db.run("UPDATE user_sessions SET isActive = 0 WHERE userId = ?", [
        userId,
      ]);
    }

    res.json({
      success: true,
      message: "User status updated successfully",
    });
  }),
);

// Update post status
router.patch(
  "/posts/:postId/status",
  catchAsync(async (req, res) => {
    const { postId } = req.params;
    const { status } = req.body;

    if (!["draft", "published", "archived"].includes(status)) {
      throw new AppError("Invalid status", 400, "INVALID_STATUS");
    }

    const db = database.getDb();

    // Check if post exists
    const post = await db.get("SELECT id FROM posts WHERE id = ?", [postId]);
    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    await db.run(
      'UPDATE posts SET status = ?, updatedAt = datetime("now") WHERE id = ?',
      [status, postId],
    );

    res.json({
      success: true,
      message: "Post status updated successfully",
    });
  }),
);

// Get system information
router.get(
  "/system",
  catchAsync(async (req, res) => {
    const db = database.getDb();

    // Get database info
    const dbStats = await db.get(`
    SELECT 
      (SELECT COUNT(*) FROM users) as totalUsers,
      (SELECT COUNT(*) FROM posts) as totalPosts,
      (SELECT COUNT(*) FROM comments) as totalComments,
      (SELECT COUNT(*) FROM snippets) as totalSnippets,
      (SELECT COUNT(*) FROM chat_messages) as totalMessages,
      (SELECT COUNT(*) FROM ai_interactions) as totalAIInteractions,
      (SELECT COUNT(*) FROM user_sessions WHERE isActive = 1) as activeSessions
  `);

    // System info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
    };

    res.json({
      success: true,
      data: {
        database: dbStats,
        system: systemInfo,
      },
    });
  }),
);

module.exports = router;
