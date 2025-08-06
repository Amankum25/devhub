const express = require("express");
const Snippet = require("../models/Snippet");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { optionalAuth, authenticateToken } = require("../middleware/auth");
const { validationRules } = require("../middleware/validation");

const router = express.Router();

// Get all public snippets
router.get(
  "/",
  optionalAuth,
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const language = req.query.language || "";
    const tag = req.query.tag || "";
    const sort = req.query.sort || "recent";
    const skip = (page - 1) * limit;

    // Build query
    const query = { visibility: "public" };

    if (search) {
      query.$text = { $search: search };
    }

    if (language) {
      query.language = language;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Build sort
    let sortOptions = {};
    switch (sort) {
      case "popular":
        sortOptions = { "stats.likes": -1, "stats.views": -1 };
        break;
      case "views":
        sortOptions = { "stats.views": -1 };
        break;
      case "forks":
        sortOptions = { "stats.forks": -1 };
        break;
      case "recent":
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Get snippets with pagination
    const snippets = await Snippet.find(query)
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .populate("author", "firstName lastName username avatar")
      .lean();

    // Get total count for pagination
    const total = await Snippet.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Format response to match expected structure
    const formattedSnippets = snippets.map(snippet => ({
      id: snippet._id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      views: snippet.stats.views,
      likes: snippet.stats.likes,
      forks: snippet.stats.forks,
      createdAt: snippet.createdAt,
      firstName: snippet.author?.firstName,
      lastName: snippet.author?.lastName,
      username: snippet.author?.username,
      avatar: snippet.author?.avatar,
    }));

    res.json({
      success: true,
      data: {
        snippets: formattedSnippets,
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

// Get single snippet
router.get(
  "/:snippetId",
  optionalAuth,
  validationRules.withSnippetId,
  catchAsync(async (req, res) => {
    const { snippetId } = req.params;

    // Build query - public snippets or owned by user
    const query = {
      _id: snippetId,
      $or: [
        { visibility: "public" },
        { author: req.user?.id }
      ]
    };

    const snippet = await Snippet.findOne(query)
      .populate("author", "firstName lastName username avatar bio")
      .lean();

    if (!snippet) {
      throw new AppError("Snippet not found", 404, "SNIPPET_NOT_FOUND");
    }

    // Increment view count
    await Snippet.findByIdAndUpdate(snippetId, {
      $inc: { "stats.views": 1 }
    });

    // Format response
    const formattedSnippet = {
      id: snippet._id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      views: snippet.stats.views + 1, // Include the increment
      likes: snippet.stats.likes,
      forks: snippet.stats.forks,
      createdAt: snippet.createdAt,
      firstName: snippet.author?.firstName,
      lastName: snippet.author?.lastName,
      username: snippet.author?.username,
      avatar: snippet.author?.avatar,
      bio: snippet.author?.bio,
    };

    res.json({
      success: true,
      data: { snippet: formattedSnippet },
    });
  }),
);

// Create new snippet
router.post(
  "/",
  authenticateToken,
  validationRules.createSnippet,
  catchAsync(async (req, res) => {
    const { title, description, code, language, tags, isPublic } = req.body;

    // Create snippet
    const snippetData = {
      title,
      description,
      code,
      language: language.toLowerCase(),
      author: req.user.id,
      tags: tags || [],
      visibility: isPublic !== false ? "public" : "private",
    };

    const snippet = new Snippet(snippetData);
    await snippet.save();

    // Populate author details for response
    await snippet.populate("author", "firstName lastName username avatar");

    // Format response
    const formattedSnippet = {
      id: snippet._id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      views: snippet.stats.views,
      likes: snippet.stats.likes,
      forks: snippet.stats.forks,
      createdAt: snippet.createdAt,
      firstName: snippet.author?.firstName,
      lastName: snippet.author?.lastName,
      username: snippet.author?.username,
      avatar: snippet.author?.avatar,
    };

    res.status(201).json({
      success: true,
      message: "Snippet created successfully",
      data: { snippet: formattedSnippet },
    });
  }),
);

// Update snippet
router.put(
  "/:snippetId",
  authenticateToken,
  validationRules.updateSnippet,
  catchAsync(async (req, res) => {
    const { snippetId } = req.params;
    const { title, description, code, language, tags, isPublic } = req.body;

    // Check if snippet exists and user owns it
    const existingSnippet = await Snippet.findById(snippetId);

    if (!existingSnippet) {
      throw new AppError("Snippet not found", 404, "SNIPPET_NOT_FOUND");
    }

    if (existingSnippet.author.toString() !== req.user.id) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }

    // Update snippet
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (code !== undefined) updateData.code = code;
    if (language !== undefined) updateData.language = language.toLowerCase();
    if (tags !== undefined) updateData.tags = tags;
    if (isPublic !== undefined) updateData.visibility = isPublic ? "public" : "private";

    const snippet = await Snippet.findByIdAndUpdate(
      snippetId,
      updateData,
      { new: true }
    ).populate("author", "firstName lastName username avatar");

    // Format response
    const formattedSnippet = {
      id: snippet._id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      views: snippet.stats.views,
      likes: snippet.stats.likes,
      forks: snippet.stats.forks,
      createdAt: snippet.createdAt,
      firstName: snippet.author?.firstName,
      lastName: snippet.author?.lastName,
      username: snippet.author?.username,
      avatar: snippet.author?.avatar,
    };

    res.json({
      success: true,
      message: "Snippet updated successfully",
      data: { snippet: formattedSnippet },
    });
  }),
);

// Delete snippet
router.delete(
  "/:snippetId",
  authenticateToken,
  validationRules.withSnippetId,
  catchAsync(async (req, res) => {
    const { snippetId } = req.params;

    // Check if snippet exists and user owns it
    const snippet = await Snippet.findById(snippetId);

    if (!snippet) {
      throw new AppError("Snippet not found", 404, "SNIPPET_NOT_FOUND");
    }

    if (snippet.author.toString() !== req.user.id && !req.user.isAdmin) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }

    // Delete snippet
    await Snippet.findByIdAndDelete(snippetId);

    res.json({
      success: true,
      message: "Snippet deleted successfully",
    });
  }),
);

// Get popular languages
router.get(
  "/languages/popular",
  catchAsync(async (req, res) => {
    const languages = await Snippet.aggregate([
      { $match: { visibility: "public" } },
      { $group: { _id: "$language", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { language: "$_id", count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      data: { languages },
    });
  }),
);

// Get user's snippets
router.get(
  "/user/:userId",
  optionalAuth,
  catchAsync(async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if user exists
    const User = require("../models/User");
    const user = await User.findById(userId).select("_id");
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Get public snippets (or user's own snippets if viewing own profile)
    const isOwnProfile = req.user && req.user.id === userId;
    const query = { author: userId };
    
    if (!isOwnProfile) {
      query.visibility = "public";
    }

    const snippets = await Snippet.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count
    const total = await Snippet.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Format snippets
    const formattedSnippets = snippets.map(snippet => ({
      id: snippet._id,
      title: snippet.title,
      description: snippet.description,
      language: snippet.language,
      tags: snippet.tags,
      views: snippet.stats.views,
      likes: snippet.stats.likes,
      forks: snippet.stats.forks,
      isPublic: snippet.visibility === "public",
      createdAt: snippet.createdAt,
    }));

    res.json({
      success: true,
      data: {
        snippets: formattedSnippets,
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

module.exports = router;
