const { body, param, query, validationResult } = require("express-validator");
const { AppError } = require("./errorHandler");

// Helper function to check validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    throw new AppError(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      errorMessages,
    );
  }
  next();
};

// Common validation rules
const commonValidations = {
  // User validations
  email: body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  password: body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),

  name: (field) =>
    body(field)
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage(`${field} is required and must be less than 50 characters`),

  username: body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username must be 3-30 characters and contain only letters, numbers, and underscores",
    ),

  // Post validations
  postTitle: body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title is required and must be less than 200 characters"),

  postContent: body("content")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Content is required"),

  postSlug: body("slug")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug must be 3-100 characters and contain only lowercase letters, numbers, and hyphens",
    ),

  postStatus: body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be draft, published, or archived"),

  postVisibility: body("visibility")
    .optional()
    .isIn(["public", "private", "unlisted"])
    .withMessage("Visibility must be public, private, or unlisted"),

  tags: body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      tags.forEach((tag) => {
        if (typeof tag !== "string" || tag.length > 30) {
          throw new Error(
            "Each tag must be a string with maximum 30 characters",
          );
        }
      });
      return true;
    }),

  // Comment validations
  commentContent: body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage(
      "Comment content is required and must be less than 1000 characters",
    ),

  // Snippet validations
  snippetTitle: body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Snippet title is required and must be less than 100 characters",
    ),

  snippetCode: body("code")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Snippet code is required"),

  snippetLanguage: body("language")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Programming language is required"),

  // AI interaction validations
  aiInput: body("input")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("AI input is required and must be less than 5000 characters"),

  aiTool: body("tool")
    .isIn([
      "code_explain",
      "project_suggest",
      "resume_review",
      "code_generate",
      "debug_help",
    ])
    .withMessage("Invalid AI tool specified"),

  // Chat validations
  chatMessage: body("message")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message is required and must be less than 2000 characters"),

  chatRoomName: body("name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Room name is required and must be less than 50 characters"),

  // Pagination validations
  pagination: {
    page: query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    limit: query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    search: query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search term must be less than 100 characters"),
  },

  // Parameter validations
  userId: param("userId")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),

  postId: param("postId")
    .isInt({ min: 1 })
    .withMessage("Post ID must be a positive integer"),

  commentId: param("commentId")
    .isInt({ min: 1 })
    .withMessage("Comment ID must be a positive integer"),

  snippetId: param("snippetId")
    .isInt({ min: 1 })
    .withMessage("Snippet ID must be a positive integer"),

  roomId: param("roomId")
    .isInt({ min: 1 })
    .withMessage("Room ID must be a positive integer"),

  // File upload validations
  fileUpload: body("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("File is required");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new Error("Only JPEG, PNG, GIF, and WebP images are allowed");
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    return true;
  }),
};

// Validation rule sets for different endpoints
const validationRules = {
  // Auth validations
  register: [
    commonValidations.email,
    commonValidations.password,
    commonValidations.name("firstName"),
    commonValidations.name("lastName"),
    commonValidations.username,
    validateRequest,
  ],

  login: [
    commonValidations.email,
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
  ],

  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    commonValidations.password.withMessage(
      "New password must be at least 6 characters long and contain uppercase, lowercase, and number",
    ),
    validateRequest,
  ],

  // Post validations
  createPost: [
    commonValidations.postTitle,
    commonValidations.postContent,
    commonValidations.postSlug,
    commonValidations.postStatus,
    commonValidations.postVisibility,
    commonValidations.tags,
    validateRequest,
  ],

  updatePost: [
    commonValidations.postId,
    commonValidations.postTitle,
    commonValidations.postContent,
    commonValidations.postSlug,
    commonValidations.postStatus,
    commonValidations.postVisibility,
    commonValidations.tags,
    validateRequest,
  ],

  // Comment validations
  createComment: [
    commonValidations.postId,
    commonValidations.commentContent,
    param("parentId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Parent comment ID must be a positive integer"),
    validateRequest,
  ],

  updateComment: [
    commonValidations.commentId,
    commonValidations.commentContent,
    validateRequest,
  ],

  // Snippet validations
  createSnippet: [
    commonValidations.snippetTitle,
    commonValidations.snippetCode,
    commonValidations.snippetLanguage,
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    commonValidations.tags,
    body("isPublic")
      .optional()
      .isBoolean()
      .withMessage("isPublic must be a boolean"),
    validateRequest,
  ],

  updateSnippet: [
    commonValidations.snippetId,
    commonValidations.snippetTitle,
    commonValidations.snippetCode,
    commonValidations.snippetLanguage,
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    commonValidations.tags,
    body("isPublic")
      .optional()
      .isBoolean()
      .withMessage("isPublic must be a boolean"),
    validateRequest,
  ],

  // AI interaction validations
  aiInteraction: [
    commonValidations.aiInput,
    commonValidations.aiTool,
    validateRequest,
  ],

  // Chat validations
  sendMessage: [
    commonValidations.roomId,
    commonValidations.chatMessage,
    validateRequest,
  ],

  createRoom: [
    commonValidations.chatRoomName,
    body("description")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Description must be less than 200 characters"),
    body("type")
      .optional()
      .isIn(["public", "private"])
      .withMessage("Room type must be public or private"),
    validateRequest,
  ],

  // User validations
  updateProfile: [
    commonValidations.name("firstName").optional(),
    commonValidations.name("lastName").optional(),
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Bio must be less than 500 characters"),
    body("location")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location must be less than 100 characters"),
    body("website")
      .optional()
      .isURL()
      .withMessage("Website must be a valid URL"),
    body("company")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Company must be less than 100 characters"),
    body("position")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Position must be less than 100 characters"),
    body("skills").optional().isArray().withMessage("Skills must be an array"),
    validateRequest,
  ],

  followUser: [
    commonValidations.userId,
    body("action")
      .isIn(["follow", "unfollow"])
      .withMessage("Action must be follow or unfollow"),
    validateRequest,
  ],

  // Pagination validations
  paginated: [
    commonValidations.pagination.page,
    commonValidations.pagination.limit,
    commonValidations.pagination.search,
    validateRequest,
  ],

  // ID parameter validations
  withUserId: [commonValidations.userId, validateRequest],
  withPostId: [commonValidations.postId, validateRequest],
  withCommentId: [commonValidations.commentId, validateRequest],
  withSnippetId: [commonValidations.snippetId, validateRequest],
  withRoomId: [commonValidations.roomId, validateRequest],
};

// Sanitization helpers
const sanitizers = {
  // Remove HTML tags and encode special characters
  sanitizeContent: (content) => {
    return content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/[<>&"']/g, (match) => {
        const htmlEntities = {
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&#x27;",
        };
        return htmlEntities[match];
      });
  },

  // Sanitize and normalize tags
  sanitizeTags: (tags) => {
    if (!Array.isArray(tags)) return [];

    return tags
      .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
      .map((tag) =>
        tag
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, ""),
      )
      .filter((tag) => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags
  },

  // Generate slug from title
  generateSlug: (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  },
};

module.exports = {
  validateRequest,
  validationRules,
  commonValidations,
  sanitizers,
};
