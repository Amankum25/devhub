const express = require("express");
const database = require("../config/database");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { validationRules } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");
const ChatRoom = require("../models/ChatRoom");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const mongoose = require("mongoose");

const router = express.Router();

// Input validation helper
const validatePaginationParams = (page, limit) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 50;
  
  if (parsedPage < 1) {
    throw new AppError("Page number must be greater than 0", 400, "INVALID_PAGE");
  }
  
  if (parsedLimit < 1 || parsedLimit > 100) {
    throw new AppError("Limit must be between 1 and 100", 400, "INVALID_LIMIT");
  }
  
  return { page: parsedPage, limit: parsedLimit };
};

// Helper function to create or find direct message room
const findOrCreateDirectRoom = async (userId1, userId2) => {
  // Ensure consistent ordering for direct message room lookup
  const sortedIds = [userId1, userId2].sort();
  
  // Try to find existing direct message room
  let room = await ChatRoom.findOne({
    type: "direct",
    "members.user": { $all: sortedIds },
    memberCount: 2
  }).populate("members.user", "firstName lastName username avatar");
  
  if (!room) {
    // Create new direct message room
    room = new ChatRoom({
      name: `Direct Message`,
      type: "direct",
      createdBy: userId1,
      members: [
        { user: userId1, role: "member" },
        { user: userId2, role: "member" }
      ],
      memberCount: 2
    });
    await room.save();
    await room.populate("members.user", "firstName lastName username avatar");
  }
  
  return room;
};

// Validate MongoDB ObjectId
const validateObjectId = (id, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName} format`, 400, "INVALID_ID_FORMAT");
  }
};

// Get all chat rooms
router.get(
  "/rooms",
  catchAsync(async (req, res) => {
    try {
      const rooms = await ChatRoom.find({ type: "public" })
        .populate({
          path: "createdBy",
          select: "firstName lastName username",
          options: { lean: true }
        })
        .sort({ memberCount: -1, name: 1 })
        .select("name description type memberCount createdAt createdBy")
        .lean();

      if (!rooms) {
        throw new AppError("Failed to fetch rooms", 500, "DATABASE_ERROR");
      }

      res.json({
        success: true,
        data: { 
          rooms,
          count: rooms.length
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to retrieve chat rooms", 500, "ROOMS_FETCH_ERROR", error.message);
    }
  }),
);

// Get messages for a room
router.get(
  "/rooms/:roomId/messages",
  validationRules.withRoomId,
  catchAsync(async (req, res) => {
    const { roomId } = req.params;
    
    // Validate ObjectId format
    validateObjectId(roomId, "Room ID");
    
    // Validate pagination parameters
    const { page, limit } = validatePaginationParams(req.query.page, req.query.limit);
    const skip = (page - 1) * limit;

    try {
      // Check if room exists with better error handling
      const room = await ChatRoom.findById(roomId).lean();
      if (!room) {
        throw new AppError("Chat room not found", 404, "ROOM_NOT_FOUND");
      }

      // Check if room is accessible (add access control if needed)
      if (room.type === "private") {
        // Add logic to check if user has access to private room
        // This would require authentication middleware and membership check
      }

      // Get messages with error handling
      const messages = await ChatMessage.find({
        chatRoom: roomId,
        "metadata.deleted": { $ne: true },
      })
        .populate({
          path: "author",
          select: "firstName lastName username avatar",
          options: { lean: true }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      if (!messages) {
        throw new AppError("Failed to fetch messages", 500, "DATABASE_ERROR");
      }

      // Reverse to show oldest first
      messages.reverse();

      // Get total count for pagination info
      const totalMessages = await ChatMessage.countDocuments({
        chatRoom: roomId,
        "metadata.deleted": { $ne: true },
      });

      res.json({
        success: true,
        data: { 
          messages,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages,
            hasMore: skip + messages.length < totalMessages
          }
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to retrieve messages", 500, "MESSAGES_FETCH_ERROR", error.message);
    }
  }),
);

// Send message to room
router.post(
  "/rooms/:roomId/messages",
  authenticateToken,
  validationRules.sendMessage,
  catchAsync(async (req, res) => {
    const { roomId } = req.params;
    const { message, type = "text" } = req.body;

    // Validate inputs
    validateObjectId(roomId, "Room ID");
    
    if (!message || message.trim().length === 0) {
      throw new AppError("Message content cannot be empty", 400, "EMPTY_MESSAGE");
    }
    
    if (message.length > 1000) {
      throw new AppError("Message too long (max 1000 characters)", 400, "MESSAGE_TOO_LONG");
    }

    const validTypes = ["text", "image", "file", "emoji"];
    if (!validTypes.includes(type)) {
      throw new AppError("Invalid message type", 400, "INVALID_MESSAGE_TYPE");
    }

    try {
      // Check if room exists and user has access
      const room = await ChatRoom.findById(roomId).lean();
      if (!room) {
        throw new AppError("Chat room not found", 404, "ROOM_NOT_FOUND");
      }

      // Check if room is active
      if (room.status === "archived" || room.status === "deleted") {
        throw new AppError("Cannot send messages to inactive room", 403, "ROOM_INACTIVE");
      }

      // Rate limiting check (optional - implement based on requirements)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentMessages = await ChatMessage.countDocuments({
        author: req.user.userId,
        createdAt: { $gte: oneMinuteAgo }
      });

      if (recentMessages >= 10) {
        throw new AppError("Rate limit exceeded. Please wait before sending more messages", 429, "RATE_LIMIT_EXCEEDED");
      }

      // Create message without transaction for local development
      const newMessage = new ChatMessage({
        content: message.trim(),
        messageType: type,
        author: req.user.userId,
        chatRoom: roomId,
        createdAt: new Date(),
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      await newMessage.save();

      // Update room's last activity
      await ChatRoom.findByIdAndUpdate(
        roomId,
        { 
          lastActivity: new Date(),
          $inc: { messageCount: 1 }
        }
      );

      // Populate author info
      await newMessage.populate({
        path: "author",
        select: "firstName lastName username avatar",
        options: { lean: true }
      });

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: { message: newMessage },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === "ValidationError") {
        throw new AppError("Invalid message data", 400, "VALIDATION_ERROR", error.message);
      }
      throw new AppError("Failed to send message", 500, "MESSAGE_SEND_ERROR", error.message);
    }
  }),
);

// Create new room
router.post(
  "/rooms",
  authenticateToken,
  validationRules.createRoom,
  catchAsync(async (req, res) => {
    const { name, description, type = "public" } = req.body;

    // Enhanced input validation
    if (!name || name.trim().length === 0) {
      throw new AppError("Room name is required", 400, "MISSING_ROOM_NAME");
    }

    if (name.length > 50) {
      throw new AppError("Room name too long (max 50 characters)", 400, "ROOM_NAME_TOO_LONG");
    }

    if (description && description.length > 200) {
      throw new AppError("Room description too long (max 200 characters)", 400, "DESCRIPTION_TOO_LONG");
    }

    const validTypes = ["public", "private"];
    if (!validTypes.includes(type)) {
      throw new AppError("Invalid room type", 400, "INVALID_ROOM_TYPE");
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedDescription = description ? description.trim() : "";

    try {
      // Check if room name already exists (case-insensitive)
      const existingRoom = await ChatRoom.findOne({ 
        name: { $regex: new RegExp(`^${sanitizedName}$`, 'i') }
      }).lean();
      
      if (existingRoom) {
        throw new AppError("Room name already exists", 409, "ROOM_NAME_EXISTS");
      }

      // Check user's room creation limit
      const userRoomCount = await ChatRoom.countDocuments({ createdBy: req.user.userId });
      if (userRoomCount >= 5) {
        throw new AppError("Maximum room creation limit reached (5 rooms per user)", 403, "ROOM_LIMIT_EXCEEDED");
      }

      // Create room without transaction for local development
      const room = new ChatRoom({
        name: sanitizedName,
        description: sanitizedDescription,
        type,
        createdBy: req.user.userId,
        memberCount: 1,
        createdAt: new Date(),
        lastActivity: new Date(),
        status: "active"
      });

      await room.save();

      await room.populate({
        path: "createdBy",
        select: "firstName lastName username",
        options: { lean: true }
      });

      console.log('✅ Room created successfully:', {
        roomId: room._id,
        roomName: room.name,
        roomType: room.type,
        createdBy: room.createdBy
      });

      res.status(201).json({
        success: true,
        message: "Room created successfully",
        data: { room },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === "ValidationError") {
        throw new AppError("Invalid room data", 400, "VALIDATION_ERROR", error.message);
      }
      if (error.code === 11000) {
        throw new AppError("Room name already exists", 409, "ROOM_NAME_EXISTS");
      }
      throw new AppError("Failed to create room", 500, "ROOM_CREATION_ERROR", error.message);
    }
  }),
);

// Get room statistics (for admin)
router.get(
  "/stats",
  // Add admin authentication middleware here
  catchAsync(async (req, res) => {
    try {
      // Validate date range if provided
      const { startDate, endDate } = req.query;
      let dateFilter = {};
      
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) {
          const start = new Date(startDate);
          if (isNaN(start.getTime())) {
            throw new AppError("Invalid start date format", 400, "INVALID_START_DATE");
          }
          dateFilter.createdAt.$gte = start;
        }
        if (endDate) {
          const end = new Date(endDate);
          if (isNaN(end.getTime())) {
            throw new AppError("Invalid end date format", 400, "INVALID_END_DATE");
          }
          dateFilter.createdAt.$lte = end;
        }
      }

      // Get basic statistics with error handling
      const [totalRooms, totalMessages, activeUsers24h, messagesLastHour, activeRooms] = await Promise.allSettled([
        ChatRoom.countDocuments(),
        ChatMessage.countDocuments({
          "metadata.deleted": { $ne: true },
          ...dateFilter
        }),
        ChatMessage.distinct("author", {
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          ...dateFilter
        }),
        ChatMessage.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
          ...dateFilter
        }),
        ChatMessage.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
              "metadata.deleted": { $ne: true },
              ...dateFilter
            },
          },
          {
            $group: {
              _id: "$chatRoom",
              messageCount: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "chatrooms",
              localField: "_id",
              foreignField: "_id",
              as: "room",
            },
          },
          {
            $unwind: "$room",
          },
          {
            $project: {
              _id: "$room._id",
              name: "$room.name",
              memberCount: "$room.memberCount",
              messageCount: 1,
            },
          },
          {
            $sort: { messageCount: -1 },
          },
          {
            $limit: 5,
          },
        ])
      ]);

      // Handle any failed promises
      const results = await Promise.all([
        totalRooms.status === 'fulfilled' ? totalRooms.value : 0,
        totalMessages.status === 'fulfilled' ? totalMessages.value : 0,
        activeUsers24h.status === 'fulfilled' ? activeUsers24h.value.length : 0,
        messagesLastHour.status === 'fulfilled' ? messagesLastHour.value : 0,
        activeRooms.status === 'fulfilled' ? activeRooms.value : []
      ]);

      const [totalRoomsCount, totalMessagesCount, activeUsersCount, messagesLastHourCount, activeRoomsData] = results;

      const stats = {
        totalRooms: totalRoomsCount,
        totalMessages: totalMessagesCount,
        activeUsers24h: activeUsersCount,
        messagesLastHour: messagesLastHourCount,
        generatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: {
          stats,
          activeRooms: activeRoomsData,
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to generate statistics", 500, "STATS_ERROR", error.message);
    }
  }),
);

// Direct messaging routes

// Get user's direct message conversations
router.get(
  "/direct-messages",
  authenticateToken,
  catchAsync(async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Find all direct message rooms the user is part of
      const directRooms = await ChatRoom.find({
        type: "direct",
        "members.user": userId
      })
      .populate({
        path: "members.user",
        select: "firstName lastName username avatar",
        options: { lean: true }
      })
      .sort({ lastActivity: -1 })
      .lean();

      // Get the other participant for each conversation
      const conversations = directRooms.map(room => {
        const otherMember = room.members.find(member => 
          member.user._id.toString() !== userId
        );
        
        return {
          id: room._id,
          participant: otherMember.user,
          lastActivity: room.lastActivity,
          isOnline: false // You can implement online status later
        };
      });

      res.json({
        success: true,
        data: { 
          conversations,
          count: conversations.length
        }
      });
    } catch (error) {
      throw new AppError("Failed to retrieve conversations", 500, "CONVERSATIONS_FETCH_ERROR", error.message);
    }
  })
);

// Start or get direct message conversation with a user
router.post(
  "/direct-messages/:userId",
  authenticateToken,
  catchAsync(async (req, res) => {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;

    // Validate target user ID
    validateObjectId(targetUserId, "Target User ID");

    if (targetUserId === currentUserId) {
      throw new AppError("Cannot start conversation with yourself", 400, "INVALID_TARGET_USER");
    }

    try {
      // Check if target user exists
      const targetUser = await User.findById(targetUserId).lean();
      if (!targetUser) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
      }

      // Find or create direct message room
      const room = await findOrCreateDirectRoom(currentUserId, targetUserId);

      res.json({
        success: true,
        message: "Conversation ready",
        data: { 
          roomId: room._id,
          participant: room.members.find(m => m.user._id.toString() !== currentUserId).user
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to start conversation", 500, "CONVERSATION_START_ERROR", error.message);
    }
  })
);

// Search users for starting conversations
router.get(
  "/users/search",
  authenticateToken,
  catchAsync(async (req, res) => {
    const { q: query, limit = 10 } = req.query;
    const currentUserId = req.user.id;

    console.log('🔍 User search request:', {
      query: query,
      limit: limit,
      currentUserId: currentUserId
    });

    if (!query || query.trim().length < 2) {
      throw new AppError("Search query must be at least 2 characters", 400, "INVALID_SEARCH_QUERY");
    }

    try {
      const searchLimit = Math.min(parseInt(limit) || 10, 50);
      
      console.log('🔍 Searching with params:', {
        searchQuery: query,
        searchLimit: searchLimit,
        excludeUserId: currentUserId
      });
      
      const users = await User.find({
        _id: { $ne: currentUserId }, // Exclude current user
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } }
        ]
      })
      .select('firstName lastName username avatar')
      .limit(searchLimit)
      .lean();

      console.log('✅ Search results:', {
        query: query,
        foundUsers: users.length,
        users: users.map(u => `${u.firstName} ${u.lastName} (@${u.username})`)
      });

      res.json({
        success: true,
        data: { 
          users,
          count: users.length
        }
      });
    } catch (error) {
      console.error('❌ Search error:', error);
      throw new AppError("Failed to search users", 500, "USER_SEARCH_ERROR", error.message);
    }
  })
);

// Global error handler for this router
router.use((error, req, res, next) => {
  console.error('Chat API Error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { details: error.details })
      }
    });
  }
  
  // Handle mongoose validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(e => e.message)
      }
    });
  }
  
  // Generic server error
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  });
});

module.exports = router;