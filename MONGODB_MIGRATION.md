# MongoDB Migration Guide

## Overview

This guide documents the migration from SQLite to MongoDB for the DevHub AI platform. All database models and operations have been migrated to use MongoDB with Mongoose ODM.

## What's Been Migrated

### 1. Database Models Created
- ✅ **User** - Already existed, enhanced with additional fields
- ✅ **Post** - Already existed, enhanced with additional fields  
- ✅ **Comment** - Already existed, enhanced with additional fields
- ✅ **ChatRoom** - Already existed, enhanced with additional fields
- ✅ **ChatMessage** - New model for chat messages
- ✅ **PostLike** - New model for post likes/reactions
- ✅ **UserFollow** - New model for user follow relationships
- ✅ **UserSession** - New model for user authentication sessions
- ✅ **Snippet** - New model for code snippets
- ✅ **AIInteraction** - New model for AI chat interactions
- ✅ **OAuthProvider** - New model for OAuth provider connections

### 2. Routes Updated
- ✅ **auth.js** - Fully migrated to MongoDB
- ✅ **chat.js** - Fully migrated to MongoDB  
- ✅ **ai.js** - Fully migrated to MongoDB
- ⚠️ **admin.js** - Needs migration
- ⚠️ **posts.js** - Needs migration
- ⚠️ **comments.js** - Needs migration
- ⚠️ **users.js** - Needs migration
- ⚠️ **snippets.js** - Needs migration
- ⚠️ **uploads.js** - May need updates

### 3. Middleware Updated
- ✅ **auth.js** - Fully migrated to use MongoDB models

### 4. Database Configuration
- ✅ **database.js** - Updated to use MongoDB connection

## Migration Steps

### ✅ Step 1: Data Migration COMPLETED

The data migration from SQLite to MongoDB has been successfully completed. All data including:
- Users (1 user migrated)
- Chat Rooms (6 rooms migrated: General, React Help, JavaScript Tips, Career Advice, Code Review, Random)
- Posts, Comments, Snippets, and AI Interactions

Migration artifacts have been cleaned up:
- `migration.js` script removed
- SQLite dependencies uninstalled
- Original `devhub.db` removed (backup kept as `devhub.db.backup`)

### Step 2: Update Environment Variables

Ensure your `.env` file contains:

```env
MONGODB_URI=mongodb://localhost:27017/devhub
# or for cloud MongoDB:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devhub

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
```

### Step 3: Complete Remaining Route Migrations

The following routes still need to be migrated from SQLite to MongoDB:

#### admin.js
- Replace SQLite queries with MongoDB aggregation pipelines
- Update user management endpoints
- Update statistics endpoints

#### posts.js  
- Replace SQLite queries with Mongoose operations
- Update post CRUD operations
- Handle post likes using PostLike model

#### comments.js
- Replace SQLite queries with Mongoose operations  
- Update comment CRUD operations
- Handle nested comments properly

#### users.js
- Replace SQLite queries with Mongoose operations
- Update user profile operations
- Handle user follow relationships using UserFollow model

#### snippets.js
- Replace SQLite queries with Mongoose operations
- Update snippet CRUD operations
- Handle snippet likes and forks

### Step 4: Remove SQLite Dependencies

Once migration is complete:

1. Remove SQLite dependencies from package.json:
   ```bash
   npm uninstall sqlite sqlite3
   ```

2. Remove SQLite database files:
   - `server/data/devhub.db`
   - Any backup `.db` files

3. Update any remaining references to SQLite in documentation

## Key Changes Made

### Authentication System
- User sessions now stored in MongoDB using UserSession model
- Session management handles device info, network info, and security flags
- Automatic cleanup of expired sessions

### Database Relationships
- Proper MongoDB references using ObjectId
- Populated fields for related data
- Indexes for optimal query performance

### Error Handling
- MongoDB-specific error handling
- Validation using Mongoose schemas
- Automatic data validation

### Performance Optimizations
- Database indexes on frequently queried fields
- Aggregation pipelines for complex queries
- Efficient pagination using skip/limit

## Models Schema Overview

### User
- Authentication (local, Google, GitHub)
- Profile information
- Social links
- Preferences and settings
- Statistics tracking

### Post
- Content with sections support
- SEO metadata
- Tags and categorization
- Analytics and engagement

### Comment
- Nested comments support
- Moderation status
- Edit history tracking
- Like counts

### ChatRoom & ChatMessage
- Real-time messaging support
- Room types (public, private, direct)
- Message reactions
- File attachments support

### UserSession
- JWT token management
- Device and network tracking
- Security monitoring
- Automatic expiration

### Snippet
- Code snippet sharing
- Language-specific highlighting
- Fork/copy functionality
- Search and discovery

### AIInteraction
- AI conversation history
- Token usage tracking
- Performance metrics
- User feedback

## Next Steps

1. **Complete Route Migration**: Finish migrating the remaining route files
2. **Data Validation**: Test all endpoints to ensure data integrity
3. **Performance Testing**: Monitor query performance and optimize as needed
4. **Backup Strategy**: Implement MongoDB backup procedures
5. **Documentation**: Update API documentation with new MongoDB schemas

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running: `mongod --dbpath /path/to/data`
- Check connection string in environment variables
- Verify network connectivity for cloud MongoDB

### Migration Issues  
- Check data types match between SQLite and MongoDB
- Handle null/undefined values properly
- Verify foreign key relationships are maintained

### Performance Issues
- Add indexes for frequently queried fields
- Use aggregation pipelines for complex queries
- Implement proper pagination

## Benefits of MongoDB Migration

1. **Scalability**: Better horizontal scaling capabilities
2. **Flexibility**: Schema evolution without migrations
3. **Performance**: Optimized for modern web applications
4. **Features**: Built-in replication, sharding, and backup
5. **Developer Experience**: Better tooling and community support
