const mongoose = require("mongoose");

const postLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    likeType: {
      type: String,
      enum: ["like", "dislike", "love", "laugh", "angry", "sad"],
      default: "like",
    },
    // For analytics
    metadata: {
      ipAddress: String,
      userAgent: String,
      source: {
        type: String,
        enum: ["web", "mobile", "api"],
        default: "web",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure one reaction per user per post
postLikeSchema.index({ user: 1, post: 1 }, { unique: true });
postLikeSchema.index({ post: 1, likeType: 1 });
postLikeSchema.index({ user: 1 });
postLikeSchema.index({ createdAt: -1 });

// Post-save middleware to update post like count
postLikeSchema.post("save", async function () {
  const Post = mongoose.model("Post");
  const likeCount = await mongoose.model("PostLike").countDocuments({
    post: this.post,
  });
  await Post.findByIdAndUpdate(this.post, { likes: likeCount });
});

// Post-remove middleware to update post like count
postLikeSchema.post("remove", async function () {
  const Post = mongoose.model("Post");
  const likeCount = await mongoose.model("PostLike").countDocuments({
    post: this.post,
  });
  await Post.findByIdAndUpdate(this.post, { likes: likeCount });
});

module.exports = mongoose.model("PostLike", postLikeSchema);
