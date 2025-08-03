const express = require("express");
const database = require("../config/database");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const {
  optionalAuth,
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");
const { validationRules } = require("../middleware/validation");

const router = express.Router();

// Get comments for a post
router.get(
  "/post/:postId",
  optionalAuth,
  validationRules.withPostId,
  catchAsync(async (req, res) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || "newest";
    const offset = (page - 1) * limit;

    const db = database.getDb();

    // Check if post exists
    const post = await db.get(
      'SELECT id FROM posts WHERE id = ? AND status = "published"',
      [postId],
    );
    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    // Build sort clause
    let sortClause = "";
    switch (sort) {
      case "oldest":
        sortClause = "ORDER BY c.createdAt ASC";
        break;
      case "likes":
        sortClause = "ORDER BY c.likes DESC, c.createdAt DESC";
        break;
      case "newest":
      default:
        sortClause = "ORDER BY c.createdAt DESC";
        break;
    }

    // Get root level comments (no parent)
    const comments = await db.all(
      `
    SELECT 
      c.id, c.content, c.likes, c.createdAt, c.updatedAt,
      u.firstName, u.lastName, u.username, u.avatar
    FROM comments c
    JOIN users u ON c.userId = u.id
    WHERE c.postId = ? AND c.parentId IS NULL AND c.status = 'approved'
    ${sortClause}
    LIMIT ? OFFSET ?
  `,
      [postId, limit, offset],
    );

    // Get replies for each comment
    for (let comment of comments) {
      const replies = await db.all(
        `
      SELECT 
        c.id, c.content, c.likes, c.createdAt, c.updatedAt,
        u.firstName, u.lastName, u.username, u.avatar
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.postId = ? AND c.parentId = ? AND c.status = 'approved'
      ORDER BY c.createdAt ASC
      LIMIT 10
    `,
        [postId, comment.id],
      );

      comment.replies = replies;
      comment.replyCount = replies.length;
    }

    // Get total count
    const countResult = await db.get(
      'SELECT COUNT(*) as total FROM comments WHERE postId = ? AND parentId IS NULL AND status = "approved"',
      [postId],
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        comments,
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

// Create new comment
router.post(
  "/",
  authenticateToken,
  validationRules.createComment,
  catchAsync(async (req, res) => {
    const { postId, content, parentId } = req.body;
    const db = database.getDb();

    // Check if post exists
    const post = await db.get(
      'SELECT id FROM posts WHERE id = ? AND status = "published"',
      [postId],
    );
    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    // Check if parent comment exists (if replying to a comment)
    if (parentId) {
      const parentComment = await db.get(
        'SELECT id FROM comments WHERE id = ? AND postId = ? AND status = "approved"',
        [parentId, postId],
      );
      if (!parentComment) {
        throw new AppError(
          "Parent comment not found",
          404,
          "PARENT_COMMENT_NOT_FOUND",
        );
      }
    }

    // Create comment
    const result = await db.run(
      `
    INSERT INTO comments (postId, userId, parentId, content, status)
    VALUES (?, ?, ?, ?, ?)
  `,
      [postId, req.user.id, parentId || null, content, "approved"],
    );

    // Get the created comment with user info
    const comment = await db.get(
      `
    SELECT 
      c.id, c.content, c.likes, c.createdAt, c.updatedAt,
      u.firstName, u.lastName, u.username, u.avatar
    FROM comments c
    JOIN users u ON c.userId = u.id
    WHERE c.id = ?
  `,
      [result.lastID],
    );

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: { comment },
    });
  }),
);

// Update comment
router.put(
  "/:commentId",
  authenticateToken,
  validationRules.updateComment,
  catchAsync(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const db = database.getDb();

    // Check if comment exists and user owns it
    const comment = await db.get("SELECT * FROM comments WHERE id = ?", [
      commentId,
    ]);

    if (!comment) {
      throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
    }

    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }

    // Update comment
    await db.run(
      `
    UPDATE comments 
    SET content = ?, updatedAt = datetime('now')
    WHERE id = ?
  `,
      [content, commentId],
    );

    // Get updated comment
    const updatedComment = await db.get(
      `
    SELECT 
      c.id, c.content, c.likes, c.createdAt, c.updatedAt,
      u.firstName, u.lastName, u.username, u.avatar
    FROM comments c
    JOIN users u ON c.userId = u.id
    WHERE c.id = ?
  `,
      [commentId],
    );

    res.json({
      success: true,
      message: "Comment updated successfully",
      data: { comment: updatedComment },
    });
  }),
);

// Like/unlike comment
router.post(
  "/:commentId/like",
  authenticateToken,
  validationRules.withCommentId,
  catchAsync(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    const db = database.getDb();

    // Check if comment exists
    const comment = await db.get(
      'SELECT id FROM comments WHERE id = ? AND status = "approved"',
      [commentId],
    );
    if (!comment) {
      throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
    }

    // For simplicity, we'll just increment/decrement the likes count
    // In a real app, you'd want a separate comment_likes table
    const currentLikes = await db.get(
      "SELECT likes FROM comments WHERE id = ?",
      [commentId],
    );

    // Toggle like (simplified - assumes user hasn't liked before)
    await db.run("UPDATE comments SET likes = likes + 1 WHERE id = ?", [
      commentId,
    ]);

    res.json({
      success: true,
      message: "Comment liked",
      data: { likes: currentLikes.likes + 1 },
    });
  }),
);

// Delete comment
router.delete(
  "/:commentId",
  authenticateToken,
  validationRules.withCommentId,
  catchAsync(async (req, res) => {
    const { commentId } = req.params;
    const db = database.getDb();

    // Check if comment exists and user owns it
    const comment = await db.get("SELECT userId FROM comments WHERE id = ?", [
      commentId,
    ]);

    if (!comment) {
      throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
    }

    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }

    // Delete comment (cascade will handle replies)
    await db.run("DELETE FROM comments WHERE id = ?", [commentId]);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  }),
);

// Admin: Get all comments
router.get(
  "/admin/all",
  requireAdmin,
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
      conditions.push("c.status = ?");
      params.push(status);
    }

    if (search) {
      conditions.push(
        "(c.content LIKE ? OR u.firstName LIKE ? OR u.lastName LIKE ?)",
      );
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get comments
    const comments = await db.all(
      `
    SELECT 
      c.id, c.content, c.status, c.likes, c.createdAt,
      c.postId, p.title as postTitle,
      u.firstName, u.lastName, u.username, u.avatar
    FROM comments c
    JOIN users u ON c.userId = u.id
    JOIN posts p ON c.postId = p.id
    ${whereClause}
    ORDER BY c.createdAt DESC
    LIMIT ? OFFSET ?
  `,
      [...params, limit, offset],
    );

    // Get total count
    const countResult = await db.get(
      `
    SELECT COUNT(*) as total 
    FROM comments c
    JOIN users u ON c.userId = u.id
    JOIN posts p ON c.postId = p.id
    ${whereClause}
  `,
      params,
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        comments,
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

// Admin: Update comment status
router.patch(
  "/admin/:commentId/status",
  requireAdmin,
  catchAsync(async (req, res) => {
    const { commentId } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      throw new AppError("Invalid status", 400, "INVALID_STATUS");
    }

    const db = database.getDb();

    // Check if comment exists
    const comment = await db.get("SELECT id FROM comments WHERE id = ?", [
      commentId,
    ]);
    if (!comment) {
      throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
    }

    // Update status
    await db.run(
      'UPDATE comments SET status = ?, updatedAt = datetime("now") WHERE id = ?',
      [status, commentId],
    );

    res.json({
      success: true,
      message: "Comment status updated successfully",
    });
  }),
);

module.exports = router;
