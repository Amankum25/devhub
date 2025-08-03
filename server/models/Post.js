const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 500
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  featuredImage: {
    type: String
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 30
  }],
  readTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // SEO fields
  seo: {
    metaTitle: {
      type: String,
      maxlength: 60
    },
    metaDescription: {
      type: String,
      maxlength: 160
    },
    keywords: [{
      type: String,
      maxlength: 50
    }]
  },
  // Content structure
  sections: [{
    type: {
      type: String,
      enum: ['text', 'code', 'image', 'video', 'quote'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    language: String, // For code sections
    caption: String, // For images/videos
    order: {
      type: Number,
      required: true
    }
  }],
  // Engagement metrics
  engagement: {
    commentsCount: {
      type: Number,
      default: 0
    },
    sharesCount: {
      type: Number,
      default: 0
    },
    bookmarksCount: {
      type: Number,
      default: 0
    }
  },
  // Analytics
  analytics: {
    uniqueViews: {
      type: Number,
      default: 0
    },
    avgReadTime: {
      type: Number,
      default: 0
    },
    bounceRate: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
postSchema.index({ slug: 1 });
postSchema.index({ author: 1 });
postSchema.index({ status: 1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ views: -1 });
postSchema.index({ likes: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

// Compound indexes
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ author: 1, status: 1 });
postSchema.index({ tags: 1, status: 1 });

// Virtual for URL
postSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Virtual for reading time in minutes
postSchema.virtual('readTimeMinutes').get(function() {
  return Math.ceil(this.readTime / 60);
});

// Virtual for formatted publish date
postSchema.virtual('formattedPublishDate').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Pre-save middleware to generate slug
postSchema.pre('save', async function(next) {
  if (this.isModified('title') || this.isNew) {
    let baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingPost = await this.constructor.findOne({ 
        slug: slug, 
        _id: { $ne: this._id } 
      });
      
      if (!existingPost) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  next();
});

// Pre-save middleware to generate excerpt
postSchema.pre('save', function(next) {
  if (!this.excerpt && this.content) {
    // Remove HTML tags and get first 200 characters
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }
  next();
});

// Pre-save middleware to calculate read time
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Average reading speed: 200 words per minute
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil((wordCount / 200) * 60); // in seconds
  }
  next();
});

// Pre-save middleware to set published date
postSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  } else if (this.status !== 'published') {
    this.publishedAt = null;
  }
  next();
});

// Instance method to increment views
postSchema.methods.incrementViews = function() {
  return this.updateOne({ $inc: { views: 1, 'analytics.uniqueViews': 1 } });
};

// Instance method to toggle like
postSchema.methods.toggleLike = async function(userId) {
  const Like = require('./Like');
  
  const existingLike = await Like.findOne({
    post: this._id,
    user: userId
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    await this.updateOne({ $inc: { likes: -1 } });
    return { liked: false, likes: this.likes - 1 };
  } else {
    await Like.create({ post: this._id, user: userId });
    await this.updateOne({ $inc: { likes: 1 } });
    return { liked: true, likes: this.likes + 1 };
  }
};

// Static method to get published posts
postSchema.statics.getPublished = function(options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = { publishedAt: -1 },
    author,
    tags,
    search
  } = options;

  let filter = { 
    status: 'published',
    visibility: 'public' 
  };

  if (author) {
    filter.author = author;
  }

  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }

  if (search) {
    filter.$text = { $search: search };
  }

  return this.find(filter)
    .populate('author', 'firstName lastName username avatar')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get popular posts
postSchema.statics.getPopular = function(timeframe = '7d', limit = 10) {
  const dateThreshold = new Date();
  
  switch (timeframe) {
    case '24h':
      dateThreshold.setDate(dateThreshold.getDate() - 1);
      break;
    case '7d':
      dateThreshold.setDate(dateThreshold.getDate() - 7);
      break;
    case '30d':
      dateThreshold.setDate(dateThreshold.getDate() - 30);
      break;
    default:
      dateThreshold.setDate(dateThreshold.getDate() - 7);
  }

  return this.find({
    status: 'published',
    visibility: 'public',
    publishedAt: { $gte: dateThreshold }
  })
  .populate('author', 'firstName lastName username avatar')
  .sort({ views: -1, likes: -1 })
  .limit(limit);
};

// Static method to get featured posts
postSchema.statics.getFeatured = function(limit = 5) {
  return this.find({
    status: 'published',
    visibility: 'public',
    featuredImage: { $exists: true, $ne: null }
  })
  .populate('author', 'firstName lastName username avatar')
  .sort({ likes: -1, views: -1 })
  .limit(limit);
};

// Static method to get posts by tag
postSchema.statics.getByTag = function(tag, options = {}) {
  const { page = 1, limit = 20 } = options;
  
  return this.find({
    status: 'published',
    visibility: 'public',
    tags: tag
  })
  .populate('author', 'firstName lastName username avatar')
  .sort({ publishedAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);
};

// Static method to get related posts
postSchema.statics.getRelated = function(postId, limit = 5) {
  return this.findById(postId)
    .then(post => {
      if (!post) return [];
      
      return this.find({
        _id: { $ne: postId },
        status: 'published',
        visibility: 'public',
        $or: [
          { tags: { $in: post.tags } },
          { author: post.author }
        ]
      })
      .populate('author', 'firstName lastName username avatar')
      .sort({ publishedAt: -1 })
      .limit(limit);
    });
};

// Static method to get stats
postSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        publishedPosts: {
          $sum: {
            $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
          }
        },
        draftPosts: {
          $sum: {
            $cond: [{ $eq: ['$status', 'draft'] }, 1, 0]
          }
        },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        avgReadTime: { $avg: '$readTime' }
      }
    }
  ]);

  return stats[0] || {
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    avgReadTime: 0
  };
};

module.exports = mongoose.model('Post', postSchema);
