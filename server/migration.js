const mongoose = require("mongoose");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const bcrypt = require("bcrypt");

// Import MongoDB models
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const ChatRoom = require("./models/ChatRoom");
const ChatMessage = require("./models/ChatMessage");
const PostLike = require("./models/PostLike");
const UserFollow = require("./models/UserFollow");
const UserSession = require("./models/UserSession");
const Snippet = require("./models/Snippet");
const AIInteraction = require("./models/AIInteraction");
const OAuthProvider = require("./models/OAuthProvider");

class DataMigration {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/devhub";
    this.sqliteDb = null;
  }

  async connectMongoDB() {
    try {
      await mongoose.connect(this.mongoUri);
      console.log("✅ Connected to MongoDB");
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      throw error;
    }
  }

  async connectSQLite() {
    try {
      this.sqliteDb = await open({
        filename: "./data/devhub.db",
        driver: sqlite3.Database,
      });
      console.log("✅ Connected to SQLite");
    } catch (error) {
      console.error("❌ SQLite connection failed:", error);
      throw error;
    }
  }

  async migrateUsers() {
    console.log("🔄 Migrating users...");
    
    try {
      const users = await this.sqliteDb.all("SELECT * FROM users");
      
      for (const user of users) {
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
          continue;
        }

        const mongoUser = new User({
          email: user.email,
          password: user.password, // Already hashed
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          location: user.location,
          website: user.website,
          company: user.company,
          position: user.position,
          github: user.github,
          linkedin: user.linkedin,
          twitter: user.twitter,
          skills: user.skills ? JSON.parse(user.skills) : [],
          isAdmin: user.isAdmin === 1,
          isActive: user.isActive === 1,
          emailVerified: user.emailVerified === 1,
          googleId: user.googleId,
          picture: user.picture,
          authProvider: user.authProvider || 'local',
          verified: user.verified === 1,
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        });

        await mongoUser.save();
        console.log(`✅ Migrated user: ${user.email}`);
      }
    } catch (error) {
      console.error("❌ User migration failed:", error);
    }
  }

  async migratePosts() {
    console.log("🔄 Migrating posts...");
    
    try {
      const posts = await this.sqliteDb.all("SELECT * FROM posts");
      
      for (const post of posts) {
        // Find the MongoDB user by email/username
        const user = await User.findOne({
          $or: [
            { email: post.authorEmail },
            { username: post.authorUsername }
          ]
        });

        if (!user) {
          console.log(`⚠️  User not found for post ${post.id}, skipping...`);
          continue;
        }

        const mongoPost = new Post({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          slug: post.slug,
          status: post.status,
          visibility: post.visibility,
          featuredImage: post.featuredImage,
          tags: post.tags ? JSON.parse(post.tags) : [],
          readTime: post.readTime || 0,
          views: post.views || 0,
          likes: post.likes || 0,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
          author: user._id,
          createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
          updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
        });

        await mongoPost.save();
        console.log(`✅ Migrated post: ${post.title}`);
      }
    } catch (error) {
      console.error("❌ Post migration failed:", error);
    }
  }

  async migrateComments() {
    console.log("🔄 Migrating comments...");
    
    try {
      const comments = await this.sqliteDb.all("SELECT * FROM comments");
      
      for (const comment of comments) {
        // Find the MongoDB user and post
        const user = await User.findOne({
          $or: [
            { email: comment.authorEmail },
            { username: comment.authorUsername }
          ]
        });

        const post = await Post.findOne({ slug: comment.postSlug });

        if (!user || !post) {
          console.log(`⚠️  User or post not found for comment ${comment.id}, skipping...`);
          continue;
        }

        const mongoComment = new Comment({
          content: comment.content,
          author: user._id,
          post: post._id,
          parent: null, // Handle nested comments separately if needed
          status: comment.status || 'approved',
          likes: comment.likes || 0,
          createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
          updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : new Date(),
        });

        await mongoComment.save();
        console.log(`✅ Migrated comment: ${comment.id}`);
      }
    } catch (error) {
      console.error("❌ Comment migration failed:", error);
    }
  }

  async migrateChatRooms() {
    console.log("🔄 Migrating chat rooms...");
    
    try {
      const rooms = await this.sqliteDb.all("SELECT * FROM chat_rooms");
      
      for (const room of rooms) {
        // Find the creator user
        let creator = await User.findOne({
          $or: [
            { email: room.creatorEmail },
            { username: room.creatorUsername }
          ]
        });

        if (!creator) {
          console.log(`⚠️  Creator not found for room ${room.id}, using admin...`);
          const adminUser = await User.findOne({ isAdmin: true });
          if (!adminUser) continue;
          creator = adminUser;
        }

        const mongoChatRoom = new ChatRoom({
          name: room.name,
          description: room.description,
          type: room.type || 'public',
          createdBy: creator._id,
          memberCount: room.memberCount || 0,
          lastActivity: room.lastActivity ? new Date(room.lastActivity) : new Date(),
          createdAt: room.createdAt ? new Date(room.createdAt) : new Date(),
          updatedAt: room.updatedAt ? new Date(room.updatedAt) : new Date(),
        });

        await mongoChatRoom.save();
        console.log(`✅ Migrated chat room: ${room.name}`);
      }
    } catch (error) {
      console.error("❌ Chat room migration failed:", error);
    }
  }

  async migrateChatMessages() {
    console.log("🔄 Migrating chat messages...");
    
    try {
      const messages = await this.sqliteDb.all("SELECT * FROM chat_messages");
      
      for (const message of messages) {
        // Find the MongoDB user and chat room
        const user = await User.findOne({
          $or: [
            { email: message.userEmail },
            { username: message.username }
          ]
        });

        const chatRoom = await ChatRoom.findOne({ name: message.roomName });

        if (!user || !chatRoom) {
          console.log(`⚠️  User or room not found for message ${message.id}, skipping...`);
          continue;
        }

        const mongoChatMessage = new ChatMessage({
          content: message.content,
          messageType: message.type || 'text',
          author: user._id,
          chatRoom: chatRoom._id,
          status: 'sent',
          createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
          updatedAt: message.updatedAt ? new Date(message.updatedAt) : new Date(),
        });

        await mongoChatMessage.save();
        console.log(`✅ Migrated chat message: ${message.id}`);
      }
    } catch (error) {
      console.error("❌ Chat message migration failed:", error);
    }
  }

  async migrateSnippets() {
    console.log("🔄 Migrating snippets...");
    
    try {
      const snippets = await this.sqliteDb.all("SELECT * FROM snippets");
      
      for (const snippet of snippets) {
        // Find the MongoDB user
        const user = await User.findOne({
          $or: [
            { email: snippet.authorEmail },
            { username: snippet.authorUsername }
          ]
        });

        if (!user) {
          console.log(`⚠️  User not found for snippet ${snippet.id}, skipping...`);
          continue;
        }

        const mongoSnippet = new Snippet({
          title: snippet.title,
          description: snippet.description,
          code: snippet.code,
          language: snippet.language,
          author: user._id,
          tags: snippet.tags ? JSON.parse(snippet.tags) : [],
          category: snippet.category || 'snippet',
          visibility: snippet.visibility || 'public',
          stats: {
            views: snippet.views || 0,
            likes: snippet.likes || 0,
            copies: snippet.copies || 0,
          },
          createdAt: snippet.createdAt ? new Date(snippet.createdAt) : new Date(),
          updatedAt: snippet.updatedAt ? new Date(snippet.updatedAt) : new Date(),
        });

        await mongoSnippet.save();
        console.log(`✅ Migrated snippet: ${snippet.title}`);
      }
    } catch (error) {
      console.error("❌ Snippet migration failed:", error);
    }
  }

  async migrateAIInteractions() {
    console.log("🔄 Migrating AI interactions...");
    
    try {
      const interactions = await this.sqliteDb.all("SELECT * FROM ai_interactions");
      
      for (const interaction of interactions) {
        // Find the MongoDB user
        const user = await User.findOne({
          $or: [
            { email: interaction.userEmail },
            { username: interaction.username }
          ]
        });

        if (!user) {
          console.log(`⚠️  User not found for AI interaction ${interaction.id}, skipping...`);
          continue;
        }

        const mongoAIInteraction = new AIInteraction({
          user: user._id,
          request: {
            type: interaction.type || 'general_chat',
            input: interaction.input,
            language: interaction.language,
            context: interaction.context,
          },
          response: {
            output: interaction.output,
            confidence: interaction.confidence || 0,
          },
          metadata: {
            model: interaction.model || 'gpt-3.5-turbo',
            tokenUsage: {
              total: interaction.tokens || 0,
            },
            processingTime: interaction.processingTime || 0,
          },
          status: 'completed',
          createdAt: interaction.createdAt ? new Date(interaction.createdAt) : new Date(),
        });

        await mongoAIInteraction.save();
        console.log(`✅ Migrated AI interaction: ${interaction.id}`);
      }
    } catch (error) {
      console.error("❌ AI interaction migration failed:", error);
    }
  }

  async cleanupExistingData() {
    console.log("🧹 Cleaning up existing MongoDB data...");
    
    try {
      // Only remove if we're doing a fresh migration
      const userCount = await User.countDocuments();
      if (userCount > 1) { // Keep admin user
        console.log("⚠️  Data already exists, skipping cleanup...");
        return;
      }

      await Promise.all([
        User.deleteMany({ isAdmin: { $ne: true } }),
        Post.deleteMany({}),
        Comment.deleteMany({}),
        ChatRoom.deleteMany({}),
        ChatMessage.deleteMany({}),
        PostLike.deleteMany({}),
        UserFollow.deleteMany({}),
        UserSession.deleteMany({}),
        Snippet.deleteMany({}),
        AIInteraction.deleteMany({}),
        OAuthProvider.deleteMany({}),
      ]);
      
      console.log("✅ Cleanup completed");
    } catch (error) {
      console.error("❌ Cleanup failed:", error);
    }
  }

  async migrate() {
    try {
      console.log("🚀 Starting data migration from SQLite to MongoDB...");
      
      await this.connectMongoDB();
      await this.connectSQLite();
      
      // Migrate in order of dependencies
      await this.migrateUsers();
      await this.migratePosts();
      await this.migrateComments();
      await this.migrateChatRooms();
      await this.migrateChatMessages();
      await this.migrateSnippets();
      await this.migrateAIInteractions();
      
      console.log("✅ Migration completed successfully!");
      
    } catch (error) {
      console.error("❌ Migration failed:", error);
    } finally {
      if (this.sqliteDb) {
        await this.sqliteDb.close();
      }
      await mongoose.disconnect();
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const migration = new DataMigration();
  migration.migrate();
}

module.exports = DataMigration;
