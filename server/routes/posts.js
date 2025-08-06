const express = require("express");
const { body, query, param } = require("express-validator");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { optionalAuth, authenticateToken } = require("../middleware/auth");
const { validationRules } = require("../middleware/validation");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const PostLike = require("../models/PostLike");
const User = require("../models/User");

const router = express.Router();

// Get all posts (with pagination and filtering)
router.get(
  "/",
  optionalAuth,
  validationRules.paginated,
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const tag = req.query.tag || "";
    const author = req.query.author || "";
    const sort = req.query.sort || "recent";

    // Build query
    const query = { status: "published" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (author) {
      const authorUser = await User.findOne({ username: author });
      if (authorUser) {
        query.author = authorUser._id;
      } else {
        // No author found, return empty results
        return res.json({
          success: true,
          data: {
            posts: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      }
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case "popular":
        sortOption = { likes: -1, views: -1 };
        break;
      case "views":
        sortOption = { views: -1 };
        break;
      case "oldest":
        sortOption = { publishedAt: 1 };
        break;
      case "recent":
      default:
        sortOption = { publishedAt: -1 };
        break;
    }

    // Get posts with pagination
    const skip = (page - 1) * limit;
    const posts = await Post.find(query)
      .populate("author", "firstName lastName username avatar")
      .select("title excerpt slug featuredImage tags readTime views likes publishedAt createdAt")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get comment counts for posts
    const postIds = posts.map(post => post._id);
    const commentCounts = await Comment.aggregate([
      { 
        $match: { 
          post: { $in: postIds },
          status: "approved"
        } 
      },
      { $group: { _id: "$post", count: { $sum: 1 } } }
    ]);

    // Add comment counts to posts
    const postsWithComments = posts.map(post => ({
      ...post,
      commentCount: commentCounts.find(c => c._id.toString() === post._id.toString())?.count || 0,
    }));

    // Get total count
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

// Get featured posts
router.get(
  "/featured",
  optionalAuth,
  catchAsync(async (req, res) => {
    const posts = await Post.find({
      status: "published",
      featuredImage: { $exists: true, $ne: null }
    })
      .populate("author", "firstName lastName username avatar")
      .select("title excerpt slug featuredImage tags readTime views likes publishedAt")
      .sort({ likes: -1, views: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: { posts },
    });
  }),
);

// Get single post by slug or ID
router.get(
  "/:identifier",
  optionalAuth,
  catchAsync(async (req, res) => {
    const { identifier } = req.params;

    // Check if identifier is numeric (ID) or string (slug)
    const isId = /^[0-9a-fA-F]{24}$/.test(identifier); // MongoDB ObjectId pattern
    const query = isId ? { _id: identifier } : { slug: identifier };
    query.status = "published";

    const post = await Post.findOne(query)
      .populate("author", "firstName lastName username avatar bio")
      .lean();

    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    // Get comment count
    const commentCount = await Comment.countDocuments({
      post: post._id,
      status: "approved"
    });

    // Increment view count
    await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    post.views += 1;

    // Check if user has liked this post
    let hasLiked = false;
    if (req.user) {
      const likeRecord = await PostLike.findOne({
        post: post._id,
        user: req.user.userId
      });
      hasLiked = !!likeRecord;
    }

    res.json({
      success: true,
      data: {
        post: {
          ...post,
          commentCount,
          hasLiked,
        },
      },
    });
  }),
);

// Create new post
router.post(
  "/",
  authenticateToken,
  validationRules.createPost,
  catchAsync(async (req, res) => {
    const {
      title,
      content,
      excerpt,
      slug,
      status,
      visibility,
      featuredImage,
      tags,
      readTime,
    } = req.body;

    // Generate slug if not provided
    let finalSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // Ensure slug is unique
    let slugCounter = 0;
    let baseSlug = finalSlug;
    while (true) {
      const existingPost = await Post.findOne({ slug: finalSlug });
      if (!existingPost) break;

      slugCounter++;
      finalSlug = `${baseSlug}-${slugCounter}`;
    }

    // Create post
    const postData = {
      author: req.user.userId,
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + "...",
      slug: finalSlug,
      status: status || "published",
      visibility: visibility || "public",
      featuredImage,
      tags: tags || [],
      readTime: readTime || Math.ceil(content.split(" ").length / 200),
      publishedAt: status === "published" || !status ? new Date() : null,
    };

    const post = new Post(postData);
    await post.save();

    // Populate user data
    await post.populate('author', 'firstName lastName username avatar');

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: { post },
    });
  }),
);

// Update post
router.put(
  "/:postId",
  authenticateToken,
  validationRules.updatePost,
  catchAsync(async (req, res) => {
    const { postId } = req.params;
    const {
      title,
      content,
      excerpt,
      slug,
      status,
      visibility,
      featuredImage,
      tags,
      readTime,
    } = req.body;

    // Check if post exists and user owns it
    const existingPost = await Post.findById(postId);

    if (!existingPost) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    if (existingPost.author.toString() !== req.user.userId && !req.user.isAdmin) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }

    // Check slug uniqueness if changed
    let finalSlug = slug || existingPost.slug;
    if (slug && slug !== existingPost.slug) {
      const slugExists = await Post.findOne({ 
        slug: slug, 
        _id: { $ne: postId } 
      });
      if (slugExists) {
        throw new AppError("Slug already exists", 409, "SLUG_EXISTS");
      }
    }

    // Update post
    const updateData = {
      title: title || existingPost.title,
      content: content || existingPost.content,
      excerpt: excerpt || existingPost.excerpt,
      slug: finalSlug,
      status: status || existingPost.status,
      visibility: visibility || existingPost.visibility,
      featuredImage: featuredImage !== undefined ? featuredImage : existingPost.featuredImage,
      tags: tags || existingPost.tags,
      readTime: readTime || existingPost.readTime,
      updatedAt: new Date()
    };

    // Update publishedAt if status changes to published
    if (status === 'published' && !existingPost.publishedAt) {
      updateData.publishedAt = new Date();
    } else if (status && status !== 'published') {
      updateData.publishedAt = null;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updateData,
      { new: true }
    ).populate('author', 'firstName lastName username avatar');

    res.json({
      success: true,
      message: "Post updated successfully",
      data: { post: updatedPost },
    });
  }),
);

// Like/unlike post
router.post(
  "/:identifier/like",
  authenticateToken,
  catchAsync(async (req, res) => {
    const { identifier } = req.params;

    // Check if identifier is numeric (ID) or string (slug)
    const isId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isId ? { _id: identifier } : { slug: identifier };
    query.status = "published";

    const post = await Post.findOne(query);
    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    // Check if user already liked this post
    const existingLike = await PostLike.findOne({
      post: post._id,
      user: req.user.userId
    });

    if (existingLike) {
      // Unlike the post
      await PostLike.deleteOne({ _id: existingLike._id });
      await Post.findByIdAndUpdate(post._id, { $inc: { likes: -1 } });
      
      // Get updated post to return current like count
      const updatedPost = await Post.findById(post._id);
      
      res.json({
        success: true,
        message: "Post unliked",
        data: {
          liked: false,
          likesCount: Math.max(0, updatedPost.likes || 0)
        }
      });
    } else {
      // Like the post
      await PostLike.create({
        post: post._id,
        user: req.user.userId
      });
      await Post.findByIdAndUpdate(post._id, { $inc: { likes: 1 } });
      
      // Get updated post to return current like count
      const updatedPost = await Post.findById(post._id);
      
      res.json({
        success: true,
        message: "Post liked",
        data: {
          liked: true,
          likesCount: updatedPost.likes || 0
        }
      });
    }
  }),
);

// Delete post
router.delete(
  "/:postId",
  authenticateToken,
  catchAsync(async (req, res) => {
    const { postId } = req.params;

    // Check if post exists and user owns it
    const post = await Post.findById(postId);

    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    if (post.author.toString() !== req.user.userId && !req.user.isAdmin) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }

    // Delete related records first
    await PostLike.deleteMany({ post: postId });
    await Comment.deleteMany({ post: postId });
    
    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  }),
);



// Get comments for a post
router.get(
  "/:identifier/comments",
  optionalAuth,
  catchAsync(async (req, res) => {
    const { identifier } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || "newest";

    // Check if identifier is numeric (ID) or string (slug)
    const isId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isId ? { _id: identifier } : { slug: identifier };
    query.status = "published";

    const post = await Post.findOne(query);
    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "likes":
        sortOption = { likes: -1, createdAt: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Get comments with pagination
    const skip = (page - 1) * limit;
    const comments = await Comment.find({
      post: post._id,
      status: "approved"
    })
      .populate("author", "firstName lastName username avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Comment.countDocuments({
      post: post._id,
      status: "approved"
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  }),
);

// Add a comment to a post
router.post(
  "/:identifier/comments",
  authenticateToken,
  catchAsync(async (req, res) => {
    const { identifier } = req.params;
    const { content, parentId } = req.body;

    if (!content || content.trim().length === 0) {
      throw new AppError("Comment content is required", 400, "VALIDATION_ERROR");
    }

    // Check if identifier is numeric (ID) or string (slug)
    const isId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isId ? { _id: identifier } : { slug: identifier };
    query.status = "published";

    const post = await Post.findOne(query);
    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment || parentComment.post.toString() !== post._id.toString()) {
        throw new AppError("Parent comment not found", 404, "COMMENT_NOT_FOUND");
      }
    }

    // Create comment
    const comment = await Comment.create({
      post: post._id,
      author: req.user.userId,
      content: content.trim(),
      parentId: parentId || null,
      status: "approved" // Auto-approve for now
    });

    // Populate author info
    await comment.populate("author", "firstName lastName username avatar");

    res.status(201).json({
      success: true,
      data: { comment },
    });
  }),
);

// Get popular tags
router.get(
  "/tags/popular",
  catchAsync(async (req, res) => {
    // Use MongoDB aggregation to get popular tags
    const tagStats = await Post.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { tag: "$_id", count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      data: { tags: tagStats },
    });
  }),
);

module.exports = router;
