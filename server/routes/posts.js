const express = require("express");
const { body, query, param } = require("express-validator");
const database = require("../config/database");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { optionalAuth, authenticateToken } = require("../middleware/auth");
const { validationRules } = require("../middleware/validation");

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
    const offset = (page - 1) * limit;

    const db = database.getDb();

    // Build search conditions
    let conditions = ["p.status = ?"];
    let params = ["published"];

    if (search) {
      conditions.push(
        "(p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)",
      );
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (tag) {
      conditions.push("p.tags LIKE ?");
      params.push(`%"${tag}"%`);
    }

    if (author) {
      conditions.push("u.username = ?");
      params.push(author);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Build sort clause
    let sortClause = "";
    switch (sort) {
      case "popular":
        sortClause = "ORDER BY p.likes DESC, p.views DESC";
        break;
      case "views":
        sortClause = "ORDER BY p.views DESC";
        break;
      case "oldest":
        sortClause = "ORDER BY p.publishedAt ASC";
        break;
      case "recent":
      default:
        sortClause = "ORDER BY p.publishedAt DESC";
        break;
    }

    // Get posts
    const posts = await db.all(
      `
    SELECT 
      p.id, p.title, p.excerpt, p.slug, p.featuredImage, p.tags, p.readTime,
      p.views, p.likes, p.publishedAt, p.createdAt,
      u.firstName, u.lastName, u.username, u.avatar,
      COUNT(c.id) as commentCount
    FROM posts p
    JOIN users u ON p.userId = u.id
    LEFT JOIN comments c ON p.id = c.postId AND c.status = 'approved'
    ${whereClause}
    GROUP BY p.id
    ${sortClause}
    LIMIT ? OFFSET ?
  `,
      [...params, limit, offset],
    );

    // Parse JSON fields
    posts.forEach((post) => {
      post.tags = post.tags ? JSON.parse(post.tags) : [];
    });

    // Get total count
    const countResult = await db.get(
      `
    SELECT COUNT(DISTINCT p.id) as total 
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

// Get featured posts
router.get(
  "/featured",
  optionalAuth,
  catchAsync(async (req, res) => {
    const db = database.getDb();

    const posts = await db.all(`
    SELECT 
      p.id, p.title, p.excerpt, p.slug, p.featuredImage, p.tags, p.readTime,
      p.views, p.likes, p.publishedAt,
      u.firstName, u.lastName, u.username, u.avatar
    FROM posts p
    JOIN users u ON p.userId = u.id
    WHERE p.status = 'published' AND p.featuredImage IS NOT NULL
    ORDER BY p.likes DESC, p.views DESC
    LIMIT 5
  `);

    posts.forEach((post) => {
      post.tags = post.tags ? JSON.parse(post.tags) : [];
    });

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
    const db = database.getDb();

    // Check if identifier is numeric (ID) or string (slug)
    const isId = /^\d+$/.test(identifier);
    const query = isId ? "p.id = ?" : "p.slug = ?";

    const post = await db.get(
      `
    SELECT 
      p.*, 
      u.firstName, u.lastName, u.username, u.avatar, u.bio,
      COUNT(c.id) as commentCount
    FROM posts p
    JOIN users u ON p.userId = u.id
    LEFT JOIN comments c ON p.id = c.postId AND c.status = 'approved'
    WHERE ${query} AND p.status = 'published'
    GROUP BY p.id
  `,
      [identifier],
    );

    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    // Parse JSON fields
    post.tags = post.tags ? JSON.parse(post.tags) : [];

    // Increment view count
    await db.run("UPDATE posts SET views = views + 1 WHERE id = ?", [post.id]);
    post.views += 1;

    // Check if user has liked this post
    let hasLiked = false;
    if (req.user) {
      const likeRecord = await db.get(
        "SELECT 1 FROM post_likes WHERE postId = ? AND userId = ?",
        [post.id, req.user.id],
      );
      hasLiked = !!likeRecord;
    }

    res.json({
      success: true,
      data: {
        post: {
          ...post,
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
    const db = database.getDb();

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
      const existingPost = await db.get("SELECT id FROM posts WHERE slug = ?", [
        finalSlug,
      ]);
      if (!existingPost) break;

      slugCounter++;
      finalSlug = `${baseSlug}-${slugCounter}`;
    }

    // Create post
    const result = await db.run(
      `
    INSERT INTO posts (
      userId, title, content, excerpt, slug, status, visibility, 
      featuredImage, tags, readTime, publishedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
      [
        req.user.id,
        title,
        content,
        excerpt || content.substring(0, 200) + "...",
        finalSlug,
        status || "draft",
        visibility || "public",
        featuredImage,
        JSON.stringify(tags || []),
        readTime || Math.ceil(content.split(" ").length / 200),
        status === "published" ? new Date().toISOString() : null,
      ],
    );

    const post = await db.get(
      `
    SELECT 
      p.*, 
      u.firstName, u.lastName, u.username, u.avatar
    FROM posts p
    JOIN users u ON p.userId = u.id
    WHERE p.id = ?
  `,
      [result.lastID],
    );

    post.tags = post.tags ? JSON.parse(post.tags) : [];

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
    const db = database.getDb();

    // Check if post exists and user owns it
    const existingPost = await db.get("SELECT * FROM posts WHERE id = ?", [
      postId,
    ]);

    if (!existingPost) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    if (existingPost.userId !== req.user.id && !req.user.isAdmin) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }

    // Check slug uniqueness if changed
    let finalSlug = slug || existingPost.slug;
    if (slug && slug !== existingPost.slug) {
      const slugExists = await db.get(
        "SELECT id FROM posts WHERE slug = ? AND id != ?",
        [slug, postId],
      );
      if (slugExists) {
        throw new AppError("Slug already exists", 409, "SLUG_EXISTS");
      }
    }

    // Update post
    await db.run(
      `
    UPDATE posts SET 
      title = ?, content = ?, excerpt = ?, slug = ?, status = ?, 
      visibility = ?, featuredImage = ?, tags = ?, readTime = ?,
      publishedAt = CASE 
        WHEN status = 'published' AND publishedAt IS NULL THEN datetime('now')
        WHEN status != 'published' THEN NULL
        ELSE publishedAt
      END,
      updatedAt = datetime('now')
    WHERE id = ?
  `,
      [
        title || existingPost.title,
        content || existingPost.content,
        excerpt || existingPost.excerpt,
        finalSlug,
        status || existingPost.status,
        visibility || existingPost.visibility,
        featuredImage !== undefined
          ? featuredImage
          : existingPost.featuredImage,
        JSON.stringify(
          tags || (existingPost.tags ? JSON.parse(existingPost.tags) : []),
        ),
        readTime || existingPost.readTime,
        postId,
      ],
    );

    // Get updated post
    const post = await db.get(
      `
    SELECT 
      p.*, 
      u.firstName, u.lastName, u.username, u.avatar
    FROM posts p
    JOIN users u ON p.userId = u.id
    WHERE p.id = ?
  `,
      [postId],
    );

    post.tags = post.tags ? JSON.parse(post.tags) : [];

    res.json({
      success: true,
      message: "Post updated successfully",
      data: { post },
    });
  }),
);

// Like/unlike post
router.post(
  "/:postId/like",
  authenticateToken,
  validationRules.withPostId,
  catchAsync(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;
    const db = database.getDb();

    // Check if post exists
    const post = await db.get(
      'SELECT id FROM posts WHERE id = ? AND status = "published"',
      [postId],
    );
    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    // Check if already liked
    const existingLike = await db.get(
      "SELECT 1 FROM post_likes WHERE postId = ? AND userId = ?",
      [postId, userId],
    );

    if (existingLike) {
      // Unlike
      await db.run("DELETE FROM post_likes WHERE postId = ? AND userId = ?", [
        postId,
        userId,
      ]);
      await db.run("UPDATE posts SET likes = likes - 1 WHERE id = ?", [postId]);

      res.json({
        success: true,
        message: "Post unliked",
        data: { hasLiked: false },
      });
    } else {
      // Like
      await db.run("INSERT INTO post_likes (postId, userId) VALUES (?, ?)", [
        postId,
        userId,
      ]);
      await db.run("UPDATE posts SET likes = likes + 1 WHERE id = ?", [postId]);

      res.json({
        success: true,
        message: "Post liked",
        data: { hasLiked: true },
      });
    }
  }),
);

// Delete post
router.delete(
  "/:postId",
  authenticateToken,
  validationRules.withPostId,
  catchAsync(async (req, res) => {
    const { postId } = req.params;
    const db = database.getDb();

    // Check if post exists and user owns it
    const post = await db.get("SELECT userId FROM posts WHERE id = ?", [
      postId,
    ]);

    if (!post) {
      throw new AppError("Post not found", 404, "POST_NOT_FOUND");
    }

    if (post.userId !== req.user.id && !req.user.isAdmin) {
      throw new AppError("Access denied", 403, "ACCESS_DENIED");
    }

    // Delete post (cascade will handle related records)
    await db.run("DELETE FROM posts WHERE id = ?", [postId]);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  }),
);

// Get popular tags
router.get(
  "/tags/popular",
  catchAsync(async (req, res) => {
    const db = database.getDb();

    // This is a simplified approach - in a real app you'd have a proper tags table
    const posts = await db.all(`
    SELECT tags FROM posts WHERE status = 'published' AND tags IS NOT NULL
  `);

    const tagCounts = {};
    posts.forEach((post) => {
      if (post.tags) {
        const tags = JSON.parse(post.tags);
        tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    res.json({
      success: true,
      data: { tags: popularTags },
    });
  }),
);

module.exports = router;
