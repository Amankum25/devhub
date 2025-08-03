const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

// Ensure the database directory exists
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'devhub.db');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    if (this.db) {
      return this.db;
    }

    try {
      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Enable foreign keys
      await this.db.exec('PRAGMA foreign_keys = ON;');
      
      console.log('📁 Connected to SQLite database');
      await this.initializeTables();
      
      return this.db;
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async initializeTables() {
    try {
      // Users table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          username TEXT UNIQUE,
          avatar TEXT,
          bio TEXT,
          location TEXT,
          website TEXT,
          company TEXT,
          position TEXT,
          github TEXT,
          linkedin TEXT,
          twitter TEXT,
          skills TEXT, -- JSON array
          isAdmin BOOLEAN DEFAULT 0,
          isActive BOOLEAN DEFAULT 1,
          emailVerified BOOLEAN DEFAULT 0,
          lastLoginAt DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Posts table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          slug TEXT UNIQUE,
          status TEXT DEFAULT 'published', -- draft, published, archived
          visibility TEXT DEFAULT 'public', -- public, private, unlisted
          featuredImage TEXT,
          tags TEXT, -- JSON array
          readTime INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0,
          likes INTEGER DEFAULT 0,
          publishedAt DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Comments table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          postId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          parentId INTEGER,
          content TEXT NOT NULL,
          status TEXT DEFAULT 'approved', -- pending, approved, rejected
          likes INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE
        )
      `);

      // Code snippets table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS snippets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          code TEXT NOT NULL,
          language TEXT NOT NULL,
          tags TEXT, -- JSON array
          isPublic BOOLEAN DEFAULT 1,
          views INTEGER DEFAULT 0,
          likes INTEGER DEFAULT 0,
          forks INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Chat rooms table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS chat_rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          type TEXT DEFAULT 'public', -- public, private, direct
          createdBy INTEGER,
          memberCount INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (createdBy) REFERENCES users(id)
        )
      `);

      // Chat messages table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          roomId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          content TEXT NOT NULL,
          type TEXT DEFAULT 'text', -- text, image, file, system
          editedAt DATETIME,
          deletedAt DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (roomId) REFERENCES chat_rooms(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // AI interactions table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS ai_interactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          tool TEXT NOT NULL, -- code_explain, project_suggest, resume_review, etc.
          input TEXT NOT NULL,
          output TEXT,
          status TEXT DEFAULT 'pending', -- pending, completed, failed
          tokensUsed INTEGER DEFAULT 0,
          processingTime INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // User sessions table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          refreshToken TEXT UNIQUE,
          userAgent TEXT,
          ipAddress TEXT,
          isActive BOOLEAN DEFAULT 1,
          expiresAt DATETIME NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // User follows table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS user_follows (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          followerId INTEGER NOT NULL,
          followingId INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(followerId, followingId),
          FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (followingId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Post likes table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS post_likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          postId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(postId, userId),
          FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // OAuth providers table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS oauth_providers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          provider TEXT NOT NULL, -- google, github, linkedin
          providerId TEXT NOT NULL,
          accessToken TEXT,
          refreshToken TEXT,
          expiresAt DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(provider, providerId),
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create indexes for better performance
      await this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(userId);
        CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
        CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(publishedAt);
        CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(postId);
        CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(userId);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(roomId);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(userId);
        CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(userId);
        CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(userId);
        CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
      `);

      // Insert default data
      await this.insertDefaultData();

      console.log('✅ Database tables initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database tables:', error);
      throw error;
    }
  }

  async insertDefaultData() {
    try {
      // Check if admin user exists
      const adminExists = await this.db.get('SELECT id FROM users WHERE email = ?', ['admin@devhub.com']);
      
      if (!adminExists) {
        // Create default admin user
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await this.db.run(`
          INSERT INTO users (email, password, firstName, lastName, username, isAdmin, emailVerified)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, ['admin@devhub.com', hashedPassword, 'Admin', 'User', 'admin', 1, 1]);

        // Create default chat rooms
        await this.db.run(`
          INSERT OR IGNORE INTO chat_rooms (name, description, type, createdBy)
          VALUES 
            ('General', 'General discussion for all developers', 'public', 1),
            ('React Help', 'Get help with React development', 'public', 1),
            ('JavaScript Tips', 'Share JavaScript tips and tricks', 'public', 1),
            ('Career Advice', 'Career guidance and advice', 'public', 1),
            ('Code Review', 'Request code reviews from the community', 'public', 1),
            ('Random', 'Off-topic discussions', 'public', 1)
        `);

        console.log('✅ Default data inserted successfully');
      }
    } catch (error) {
      console.error('Failed to insert default data:', error);
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('📁 Database connection closed');
    }
  }

  getDb() {
    return this.db;
  }
}

module.exports = new Database();
