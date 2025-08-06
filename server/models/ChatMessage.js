const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    // For file/image messages
    attachments: [
      {
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        url: String,
      },
    ],
    // For replies and threads
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatMessage",
      default: null,
    },
    // Message status
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "deleted"],
      default: "sent",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        content: String,
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Reactions/emojis
    reactions: [
      {
        emoji: String,
        users: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    // Metadata
    metadata: {
      ipAddress: String,
      userAgent: String,
      edited: {
        type: Boolean,
        default: false,
      },
      deleted: {
        type: Boolean,
        default: false,
      },
      deletedAt: Date,
      deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
chatMessageSchema.index({ chatRoom: 1, createdAt: -1 });
chatMessageSchema.index({ author: 1 });
chatMessageSchema.index({ replyTo: 1 });
chatMessageSchema.index({ status: 1 });
chatMessageSchema.index({ createdAt: -1 });

// Virtual for replies
chatMessageSchema.virtual("replies", {
  ref: "ChatMessage",
  localField: "_id",
  foreignField: "replyTo",
});

// Pre-save middleware to track edits
chatMessageSchema.pre("save", function (next) {
  if (this.isModified("content") && !this.isNew) {
    this.isEdited = true;
    this.metadata.edited = true;
    this.editHistory.push({
      content: this.content,
      editedAt: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
