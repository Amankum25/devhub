const express = require("express");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { requireAdmin } = require("../middleware/auth");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Snippet = require("../models/Snippet");
const ChatMessage = require("../models/ChatMessage");
const AIInteraction = require("../models/AIInteraction");

const router = express.Router();

// All routes require admin privileges
router.use(requireAdmin);

// Dashboard statistics
router.get(
  "/dashboard",
  catchAsync(async (req, res) => {
    // Get basic counts using MongoDB
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalSnippets,
      totalMessages,
      totalAIInteractions
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Post.countDocuments({ status: 'published' }),
      Comment.countDocuments({ status: 'approved' }),
      Snippet.countDocuments({ visibility: 'public' }),
      ChatMessage.countDocuments({ "metadata.deleted": { $ne: true } }),
      AIInteraction.countDocuments()
    ]);

    const stats = {
      totalUsers,
      totalPosts,
      totalComments,
      totalSnippets,
      totalMessages,
      totalAIInteractions
    };

    // Get recent activity
    const recentUsers = await User.find({ isActive: true })
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPosts = await Post.find({ status: 'published' })
      .populate('author', 'firstName lastName username')
      .select('title createdAt author')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get growth metrics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newUsers, newPosts] = await Promise.all([
      User.countDocuments({ 
        createdAt: { $gte: thirtyDaysAgo },
        isActive: true
      }),
      Post.countDocuments({ 
        createdAt: { $gte: thirtyDaysAgo },
        status: 'published'
      })
    ]);

    const growth = {
      newUsers,
      newPosts
    };

    // Get top contributors using MongoDB aggregation
    const topContributors = await User.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "author",
          as: "posts",
          pipeline: [
            { $match: { status: "published" } }
          ]
        }
      },
      {
        $addFields: {
          postCount: { $size: "$posts" },
          totalViews: { $sum: "$posts.views" },
          totalLikes: { $sum: "$posts.likes" }
        }
      },
      {
        $match: { postCount: { $gt: 0 } }
      },
      {
        $sort: { postCount: -1, totalLikes: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          username: 1,
          avatar: 1,
          postCount: 1,
          totalViews: 1,
          totalLikes: 1
        }
      }
    ]);

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
    const skip = (page - 1) * limit;

    // Build MongoDB query
    const query = {};

    if (status !== "all") {
      query.isActive = status === "active";
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    let sortField = {};
    switch (sort) {
      case "name":
        sortField = { firstName: 1, lastName: 1 };
        break;
      case "email":
        sortField = { email: 1 };
        break;
      case "lastLogin":
        sortField = { lastLoginAt: -1 };
        break;
      default:
        sortField = { createdAt: -1 };
    }

    const users = await User.find(query)
      .select("firstName lastName email username avatar isAdmin isActive emailVerified lastLoginAt createdAt")
      .sort(sortField)
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments(query);
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

    // Build MongoDB query
    const query = {};

    if (status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Get posts with pagination
    const skip = (page - 1) * limit;
    const posts = await Post.find(query)
      .populate("author", "firstName lastName username avatar")
      .select("title excerpt status views likes createdAt publishedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get comment counts for posts
    const postIds = posts.map(post => post._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } }
    ]);

    // Add comment counts to posts
    const postsWithComments = posts.map(post => ({
      ...post,
      commentCount: commentCounts.find(c => c._id.toString() === post._id.toString())?.count || 0,
    }));

    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        posts: postsWithComments,
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

    // Build MongoDB query
    const query = {};

    if (type !== "all") {
      query.tool = type;
    }

    // Get AI interactions as logs
    const skip = (page - 1) * limit;
    const logs = await AIInteraction.find(query)
      .populate("user", "firstName lastName username")
      .select("tool status tokensUsed processingTime createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AIInteraction.countDocuments(query);
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

    if (userId === req.user.id.toString()) {
      throw new AppError(
        "Cannot modify your own account status",
        400,
        "CANNOT_MODIFY_SELF",
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Build update object
    const updates = {};

    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    if (isAdmin !== undefined) {
      updates.isAdmin = isAdmin;
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError("No updates provided", 400, "NO_UPDATES");
    }

    updates.updatedAt = new Date();

    // Update user
    await User.findByIdAndUpdate(userId, updates);

    // If deactivating user, invalidate their sessions
    if (isActive === false) {
      const UserSession = require("../models/UserSession");
      await UserSession.updateMany(
        { user: userId },
        { isActive: false }
      );
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

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    // Update post
    await Post.findByIdAndUpdate(postId, {
      status,
      updatedAt: new Date(),
    });

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
    // Get database stats using MongoDB
    const dbStats = {
      totalUsers: await User.countDocuments(),
      totalPosts: await Post.countDocuments(),
      totalComments: await Comment.countDocuments(),
      totalSnippets: await Snippet.countDocuments(),
      totalMessages: await ChatMessage.countDocuments(),
      totalAIInteractions: await AIInteraction.countDocuments(),
      activeSessions: await require("../models/UserSession").countDocuments({ isActive: true }),
    };

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
