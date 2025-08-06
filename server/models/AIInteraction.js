const mongoose = require("mongoose");

const aiInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Request details
    request: {
      type: {
        type: String,
        enum: [
          "code_generation",
          "code_explanation",
          "bug_fixing",
          "code_review",
          "algorithm_help",
          "project_suggestion",
          "resume_review",
          "general_chat",
          "other",
        ],
        required: true,
      },
      input: {
        type: String,
        required: true,
      },
      language: String,
      framework: String,
      context: String,
      files: [
        {
          filename: String,
          content: String,
          language: String,
        },
      ],
    },
    // Response details
    response: {
      output: {
        type: String,
        required: true,
      },
      suggestions: [String],
      codeSnippets: [
        {
          language: String,
          code: String,
          filename: String,
          description: String,
        },
      ],
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    // Interaction metadata
    metadata: {
      model: {
        type: String,
        default: "gpt-3.5-turbo",
      },
      tokenUsage: {
        prompt: Number,
        completion: Number,
        total: Number,
      },
      processingTime: {
        type: Number, // milliseconds
        default: 0,
      },
      cost: {
        type: Number, // in dollars
        default: 0,
      },
    },
    // User feedback
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      helpful: Boolean,
      comment: String,
      submittedAt: Date,
    },
    // Session information
    session: {
      sessionId: String,
      conversationId: String,
      messageIndex: {
        type: Number,
        default: 0,
      },
      isFollowUp: {
        type: Boolean,
        default: false,
      },
      parentInteraction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AIInteraction",
      },
    },
    // Analytics and tracking
    analytics: {
      ipAddress: String,
      userAgent: String,
      source: {
        type: String,
        enum: ["web", "mobile", "api", "extension"],
        default: "web",
      },
      referrer: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
    // Status and flags
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "timeout"],
      default: "completed",
    },
    flags: {
      isBookmarked: {
        type: Boolean,
        default: false,
      },
      isShared: {
        type: Boolean,
        default: false,
      },
      isReported: {
        type: Boolean,
        default: false,
      },
      containsSensitiveData: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
aiInteractionSchema.index({ user: 1, createdAt: -1 });
aiInteractionSchema.index({ "request.type": 1 });
aiInteractionSchema.index({ "session.sessionId": 1 });
aiInteractionSchema.index({ "session.conversationId": 1 });
aiInteractionSchema.index({ status: 1 });
aiInteractionSchema.index({ createdAt: -1 });
aiInteractionSchema.index({ "feedback.rating": 1 });
aiInteractionSchema.index({ "metadata.model": 1 });

// Text index for searching interactions
aiInteractionSchema.index({
  "request.input": "text",
  "response.output": "text",
});

// Virtual for follow-up interactions
aiInteractionSchema.virtual("followUps", {
  ref: "AIInteraction",
  localField: "_id",
  foreignField: "session.parentInteraction",
});

// Static method to get user statistics
aiInteractionSchema.statics.getUserStats = function (userId, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);

  return this.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalInteractions: { $sum: 1 },
        totalTokens: { $sum: "$metadata.tokenUsage.total" },
        totalCost: { $sum: "$metadata.cost" },
        avgProcessingTime: { $avg: "$metadata.processingTime" },
        typeBreakdown: {
          $push: "$request.type",
        },
        avgRating: { $avg: "$feedback.rating" },
      },
    },
    {
      $project: {
        _id: 0,
        totalInteractions: 1,
        totalTokens: 1,
        totalCost: 1,
        avgProcessingTime: 1,
        avgRating: 1,
        typeBreakdown: {
          $reduce: {
            input: "$typeBreakdown",
            initialValue: {},
            in: {
              $mergeObjects: [
                "$$value",
                {
                  $arrayToObject: [
                    [
                      {
                        k: "$$this",
                        v: {
                          $add: [
                            { $ifNull: [{ $getField: "$$this" }, 0] },
                            1,
                          ],
                        },
                      },
                    ],
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ]);
};

// Static method to get popular interaction types
aiInteractionSchema.statics.getPopularTypes = function (limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: "$request.type",
        count: { $sum: 1 },
        avgRating: { $avg: "$feedback.rating" },
        avgProcessingTime: { $avg: "$metadata.processingTime" },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
  ]);
};

// Instance method to add feedback
aiInteractionSchema.methods.addFeedback = function (rating, helpful, comment) {
  this.feedback = {
    rating,
    helpful,
    comment,
    submittedAt: new Date(),
  };
  return this.save();
};

// Instance method to bookmark interaction
aiInteractionSchema.methods.bookmark = function () {
  this.flags.isBookmarked = true;
  return this.save();
};

module.exports = mongoose.model("AIInteraction", aiInteractionSchema);
