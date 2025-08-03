const express = require("express");
const { body, validationResult, query } = require("express-validator");
const database = require("../config/database");
const {
  AppError,
  catchAsync,
  createValidationError,
} = require("../middleware/errorHandler");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Helper function to check validation results
const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    throw createValidationError("Validation failed", errorMessages);
  }
};

// Get user profile by ID or username
router.get(
  "/:identifier",
  catchAsync(async (req, res) => {
    const { identifier } = req.params;
    const db = database.getDb();

    // Check if identifier is numeric (ID) or string (username)
    const isId = /^\d+$/.test(identifier);
    const query = isId ? "id = ?" : "username = ?";

    const user = await db.get(
      `
    SELECT 
      id, email, firstName, lastName, username, avatar, bio, location, website,
      company, position, github, linkedin, twitter, skills, isAdmin, emailVerified,
      lastLoginAt, createdAt
    FROM users 
    WHERE ${query} AND isActive = 1
  `,
      [identifier],
    );

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Parse JSON fields
    user.skills = user.skills ? JSON.parse(user.skills) : [];

    // Get user stats
    const stats = await db.get(
      `
    SELECT 
      (SELECT COUNT(*) FROM posts WHERE userId = ? AND status = 'published') as posts,
      (SELECT COUNT(*) FROM user_follows WHERE followingId = ?) as followers,
      (SELECT COUNT(*) FROM user_follows WHERE followerId = ?) as following,
      (SELECT COUNT(*) FROM snippets WHERE userId = ? AND isPublic = 1) as snippets,
      (SELECT COALESCE(SUM(views), 0) FROM posts WHERE userId = ?) as totalViews,
      (SELECT COALESCE(SUM(likes), 0) FROM posts WHERE userId = ?) as totalLikes
  `,
      [user.id, user.id, user.id, user.id, user.id, user.id],
    );

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user && req.user.id !== user.id) {
      const followRecord = await db.get(
        "SELECT 1 FROM user_follows WHERE followerId = ? AND followingId = ?",
        [req.user.id, user.id],
      );
      isFollowing = !!followRecord;
    }

    // Hide email if not own profile or admin
    if (req.user?.id !== user.id && !req.user?.isAdmin) {
      delete user.email;
      delete user.lastLoginAt;
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          stats,
          isFollowing,
        },
      },
    });
  }),
);

// Get all users (with pagination and search)
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search term too long"),
    query("sort")
      .optional()
      .isIn(["name", "created", "posts", "followers"])
      .withMessage("Invalid sort option"),
  ],
  catchAsync(async (req, res) => {
    checkValidation(req);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const sort = req.query.sort || "created";
    const offset = (page - 1) * limit;

    const db = database.getDb();

    // Build search condition
    let searchCondition = "";
    let searchParams = [];

    if (search) {
      searchCondition = `AND (firstName LIKE ? OR lastName LIKE ? OR username LIKE ? OR email LIKE ?)`;
      const searchTerm = `%${search}%`;
      searchParams = [searchTerm, searchTerm, searchTerm, searchTerm];
    }

    // Build sort condition
    let sortCondition = "";
    switch (sort) {
      case "name":
        sortCondition = "ORDER BY firstName, lastName";
        break;
      case "created":
        sortCondition = "ORDER BY createdAt DESC";
        break;
      case "posts":
        sortCondition = "ORDER BY postCount DESC";
        break;
      case "followers":
        sortCondition = "ORDER BY followerCount DESC";
        break;
    }

    // Get users with stats
    const users = await db.all(
      `
    SELECT 
      u.id, u.firstName, u.lastName, u.username, u.avatar, u.bio, u.location,
      u.company, u.position, u.createdAt,
      COALESCE(pc.postCount, 0) as postCount,
      COALESCE(fc.followerCount, 0) as followerCount,
      COALESCE(sc.snippetCount, 0) as snippetCount
    FROM users u
    LEFT JOIN (
      SELECT userId, COUNT(*) as postCount 
      FROM posts 
      WHERE status = 'published' 
      GROUP BY userId
    ) pc ON u.id = pc.userId
    LEFT JOIN (
      SELECT followingId, COUNT(*) as followerCount 
      FROM user_follows 
      GROUP BY followingId
    ) fc ON u.id = fc.followingId
    LEFT JOIN (
      SELECT userId, COUNT(*) as snippetCount 
      FROM snippets 
      WHERE isPublic = 1 
      GROUP BY userId
    ) sc ON u.id = sc.userId
    WHERE u.isActive = 1 ${searchCondition}
    ${sortCondition}
    LIMIT ? OFFSET ?
  `,
      [...searchParams, limit, offset],
    );

    // Get total count
    const countResult = await db.get(
      `
    SELECT COUNT(*) as total 
    FROM users 
    WHERE isActive = 1 ${searchCondition}
  `,
      searchParams,
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      },
    });
  }),
);

// Follow/unfollow user
router.post(
  "/:userId/follow",
  [
    body("action")
      .isIn(["follow", "unfollow"])
      .withMessage("Action must be follow or unfollow"),
  ],
  catchAsync(async (req, res) => {
    checkValidation(req);

    const { userId } = req.params;
    const { action } = req.body;
    const followerId = req.user.id;

    if (parseInt(userId) === followerId) {
      throw new AppError(
        "You cannot follow yourself",
        400,
        "CANNOT_FOLLOW_SELF",
      );
    }

    const db = database.getDb();

    // Check if target user exists
    const targetUser = await db.get(
      "SELECT id, firstName, lastName FROM users WHERE id = ? AND isActive = 1",
      [userId],
    );

    if (!targetUser) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (action === "follow") {
      // Check if already following
      const existingFollow = await db.get(
        "SELECT 1 FROM user_follows WHERE followerId = ? AND followingId = ?",
        [followerId, userId],
      );

      if (existingFollow) {
        throw new AppError(
          "Already following this user",
          409,
          "ALREADY_FOLLOWING",
        );
      }

      // Create follow relationship
      await db.run(
        "INSERT INTO user_follows (followerId, followingId) VALUES (?, ?)",
        [followerId, userId],
      );

      res.json({
        success: true,
        message: `You are now following ${targetUser.firstName} ${targetUser.lastName}`,
        data: { isFollowing: true },
      });
    } else {
      // Remove follow relationship
      const result = await db.run(
        "DELETE FROM user_follows WHERE followerId = ? AND followingId = ?",
        [followerId, userId],
      );

      if (result.changes === 0) {
        throw new AppError(
          "You are not following this user",
          404,
          "NOT_FOLLOWING",
        );
      }

      res.json({
        success: true,
        message: `You unfollowed ${targetUser.firstName} ${targetUser.lastName}`,
        data: { isFollowing: false },
      });
    }
  }),
);

// Get user's followers
router.get(
  "/:userId/followers",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  catchAsync(async (req, res) => {
    checkValidation(req);

    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const db = database.getDb();

    // Check if user exists
    const user = await db.get(
      "SELECT id FROM users WHERE id = ? AND isActive = 1",
      [userId],
    );
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Get followers
    const followers = await db.all(
      `
    SELECT 
      u.id, u.firstName, u.lastName, u.username, u.avatar, u.bio,
      uf.createdAt as followedAt
    FROM user_follows uf
    JOIN users u ON uf.followerId = u.id
    WHERE uf.followingId = ? AND u.isActive = 1
    ORDER BY uf.createdAt DESC
    LIMIT ? OFFSET ?
  `,
      [userId, limit, offset],
    );

    // Get total count
    const countResult = await db.get(
      "SELECT COUNT(*) as total FROM user_follows uf JOIN users u ON uf.followerId = u.id WHERE uf.followingId = ? AND u.isActive = 1",
      [userId],
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        followers,
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

// Get user's following
router.get(
  "/:userId/following",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  catchAsync(async (req, res) => {
    checkValidation(req);

    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const db = database.getDb();

    // Check if user exists
    const user = await db.get(
      "SELECT id FROM users WHERE id = ? AND isActive = 1",
      [userId],
    );
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Get following
    const following = await db.all(
      `
    SELECT 
      u.id, u.firstName, u.lastName, u.username, u.avatar, u.bio,
      uf.createdAt as followedAt
    FROM user_follows uf
    JOIN users u ON uf.followingId = u.id
    WHERE uf.followerId = ? AND u.isActive = 1
    ORDER BY uf.createdAt DESC
    LIMIT ? OFFSET ?
  `,
      [userId, limit, offset],
    );

    // Get total count
    const countResult = await db.get(
      "SELECT COUNT(*) as total FROM user_follows uf JOIN users u ON uf.followingId = u.id WHERE uf.followerId = ? AND u.isActive = 1",
      [userId],
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        following,
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

// Get user's posts
router.get(
  "/:userId/posts",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["published", "draft", "archived"])
      .withMessage("Invalid status"),
  ],
  catchAsync(async (req, res) => {
    checkValidation(req);

    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "published";
    const offset = (page - 1) * limit;

    const db = database.getDb();

    // Check if user exists
    const user = await db.get(
      "SELECT id FROM users WHERE id = ? AND isActive = 1",
      [userId],
    );
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Only show drafts to the author or admin
    if (
      status !== "published" &&
      req.user?.id !== parseInt(userId) &&
      !req.user?.isAdmin
    ) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }

    // Get posts
    const posts = await db.all(
      `
    SELECT 
      p.id, p.title, p.excerpt, p.slug, p.featuredImage, p.tags, p.readTime,
      p.views, p.likes, p.publishedAt, p.createdAt, p.updatedAt,
      u.firstName, u.lastName, u.username, u.avatar
    FROM posts p
    JOIN users u ON p.userId = u.id
    WHERE p.userId = ? AND p.status = ?
    ORDER BY p.publishedAt DESC, p.createdAt DESC
    LIMIT ? OFFSET ?
  `,
      [userId, status, limit, offset],
    );

    // Parse JSON fields
    posts.forEach((post) => {
      post.tags = post.tags ? JSON.parse(post.tags) : [];
    });

    // Get total count
    const countResult = await db.get(
      "SELECT COUNT(*) as total FROM posts WHERE userId = ? AND status = ?",
      [userId, status],
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

// Admin: Get all users with admin features
router.get(
  "/admin/all",
  requireAdmin,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search term too long"),
    query("status")
      .optional()
      .isIn(["active", "inactive", "all"])
      .withMessage("Invalid status"),
    query("sort")
      .optional()
      .isIn(["name", "email", "created", "login"])
      .withMessage("Invalid sort option"),
  ],
  catchAsync(async (req, res) => {
    checkValidation(req);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const status = req.query.status || "active";
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
        "(u.firstName LIKE ? OR u.lastName LIKE ? OR u.username LIKE ? OR u.email LIKE ?)",
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
      case "created":
        sortClause = "ORDER BY u.createdAt DESC";
        break;
      case "login":
        sortClause = "ORDER BY u.lastLoginAt DESC NULLS LAST";
        break;
    }

    // Get users
    const users = await db.all(
      `
    SELECT 
      u.id, u.email, u.firstName, u.lastName, u.username, u.avatar, u.bio,
      u.isAdmin, u.isActive, u.emailVerified, u.lastLoginAt, u.createdAt,
      COALESCE(pc.postCount, 0) as postCount,
      COALESCE(cc.commentCount, 0) as commentCount,
      COALESCE(sc.snippetCount, 0) as snippetCount
    FROM users u
    LEFT JOIN (
      SELECT userId, COUNT(*) as postCount 
      FROM posts 
      GROUP BY userId
    ) pc ON u.id = pc.userId
    LEFT JOIN (
      SELECT userId, COUNT(*) as commentCount 
      FROM comments 
      GROUP BY userId
    ) cc ON u.id = cc.userId
    LEFT JOIN (
      SELECT userId, COUNT(*) as snippetCount 
      FROM snippets 
      GROUP BY userId
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

// Admin: Update user status
router.patch(
  "/admin/:userId/status",
  requireAdmin,
  [
    body("isActive").isBoolean().withMessage("isActive must be a boolean"),
    body("isAdmin")
      .optional()
      .isBoolean()
      .withMessage("isAdmin must be a boolean"),
  ],
  catchAsync(async (req, res) => {
    checkValidation(req);

    const { userId } = req.params;
    const { isActive, isAdmin } = req.body;

    // Prevent admin from deactivating themselves
    if (parseInt(userId) === req.user.id && isActive === false) {
      throw new AppError(
        "You cannot deactivate your own account",
        400,
        "CANNOT_DEACTIVATE_SELF",
      );
    }

    const db = database.getDb();

    // Check if user exists
    const user = await db.get("SELECT id, isAdmin FROM users WHERE id = ?", [
      userId,
    ]);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Build update query
    const updates = ["isActive = ?"];
    const values = [isActive];

    if (isAdmin !== undefined) {
      updates.push("isAdmin = ?");
      values.push(isAdmin);
    }

    updates.push('updatedAt = datetime("now")');
    values.push(userId);

    await db.run(
      `
    UPDATE users SET ${updates.join(", ")} WHERE id = ?
  `,
      values,
    );

    // If deactivating user, invalidate all their sessions
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

module.exports = router;
