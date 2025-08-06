const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      lowercase: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Categorization
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 30,
      },
    ],
    category: {
      type: String,
      enum: [
        "function",
        "class",
        "component",
        "hook",
        "utility",
        "algorithm",
        "pattern",
        "snippet",
        "template",
        "config",
        "other",
      ],
      default: "snippet",
    },
    // Visibility and access
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    // Engagement metrics
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      copies: {
        type: Number,
        default: 0,
      },
      forks: {
        type: Number,
        default: 0,
      },
    },
    // Version control
    version: {
      type: String,
      default: "1.0.0",
    },
    // Fork information
    forkedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Snippet",
      default: null,
    },
    isForked: {
      type: Boolean,
      default: false,
    },
    // Additional metadata
    metadata: {
      fileExtension: String,
      estimatedLines: Number,
      complexity: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
      framework: String, // React, Vue, Angular, etc.
      useCase: String,
      dependencies: [String],
    },
    // SEO and search
    searchTerms: [String], // For better searchability
    
    // Code quality metrics
    quality: {
      hasComments: {
        type: Boolean,
        default: false,
      },
      hasTests: {
        type: Boolean,
        default: false,
      },
      isValidated: {
        type: Boolean,
        default: false,
      },
      validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      validatedAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
snippetSchema.index({ author: 1 });
snippetSchema.index({ language: 1 });
snippetSchema.index({ category: 1 });
snippetSchema.index({ visibility: 1 });
snippetSchema.index({ tags: 1 });
snippetSchema.index({ "stats.views": -1 });
snippetSchema.index({ "stats.likes": -1 });
snippetSchema.index({ createdAt: -1 });
snippetSchema.index({ forkedFrom: 1 });

// Text index for search
snippetSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  searchTerms: "text",
});

// Virtual for fork count
snippetSchema.virtual("forkCount", {
  ref: "Snippet",
  localField: "_id",
  foreignField: "forkedFrom",
  count: true,
});

// Pre-save middleware
snippetSchema.pre("save", function (next) {
  // Auto-generate search terms
  const terms = [];
  if (this.title) terms.push(...this.title.toLowerCase().split(" "));
  if (this.description) terms.push(...this.description.toLowerCase().split(" "));
  if (this.language) terms.push(this.language);
  if (this.category) terms.push(this.category);
  
  this.searchTerms = [...new Set(terms.filter(term => term.length > 2))];
  
  // Estimate lines of code
  if (this.code) {
    this.metadata.estimatedLines = this.code.split("\n").length;
    this.quality.hasComments = /\/\*|\*\/|\/\/|#/.test(this.code);
  }
  
  next();
});

// Static method to get popular snippets
snippetSchema.statics.getPopular = function (limit = 10) {
  return this.find({ visibility: "public" })
    .sort({ "stats.likes": -1, "stats.views": -1 })
    .limit(limit)
    .populate("author", "username firstName lastName avatar");
};

// Static method to search snippets
snippetSchema.statics.search = function (query, options = {}) {
  const {
    language,
    category,
    tags,
    author,
    limit = 20,
    skip = 0,
    sortBy = "createdAt",
    sortOrder = -1,
  } = options;

  const searchQuery = { visibility: "public" };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  if (language) {
    searchQuery.language = language;
  }

  if (category) {
    searchQuery.category = category;
  }

  if (tags && tags.length > 0) {
    searchQuery.tags = { $in: tags };
  }

  if (author) {
    searchQuery.author = author;
  }

  return this.find(searchQuery)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip)
    .populate("author", "username firstName lastName avatar");
};

// Instance method to increment view count
snippetSchema.methods.incrementViews = function () {
  this.stats.views += 1;
  return this.save();
};

// Instance method to create a fork
snippetSchema.methods.createFork = function (userId, modifications = {}) {
  const forkData = {
    title: modifications.title || `${this.title} (Fork)`,
    description: modifications.description || this.description,
    code: modifications.code || this.code,
    language: this.language,
    author: userId,
    tags: modifications.tags || this.tags,
    category: this.category,
    forkedFrom: this._id,
    isForked: true,
    visibility: "public",
  };

  const Snippet = this.constructor;
  return new Snippet(forkData).save();
};

module.exports = mongoose.model("Snippet", snippetSchema);
