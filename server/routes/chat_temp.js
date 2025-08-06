const express = require("express");
const database = require("../config/database");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { validationRules } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");
const ChatRoom = require("../models/ChatRoom");
const ChatMessage = require("../models/ChatMessage");

const router = express.Router();

// Get all chat rooms
router.get(
  "/rooms",
  catchAsync(async (req, res) => {
    const rooms = await ChatRoom.find({ type: "public" })
      .populate("createdBy", "firstName lastName username")
      .sort({ memberCount: -1, name: 1 })
      .select("name description type memberCount createdAt createdBy");

    res.json({
      success: true,
      data: { rooms },
    });
  }),
);

// Get messages for a room
router.get(
  "/rooms/:roomId/messages",
  validationRules.withRoomId,
  catchAsync(async (req, res) => {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check if room exists
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      throw new AppError("Room not found", 404, "ROOM_NOT_FOUND");
    }

    // Get messages
    const messages = await ChatMessage.find({
      chatRoom: roomId,
      "metadata.deleted": { $ne: true },
    })
      .populate("author", "firstName lastName username avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Reverse to show oldest first
    messages.reverse();

    res.json({
      success: true,
      data: { messages },
    });
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

    // Check if room exists
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      throw new AppError("Room not found", 404, "ROOM_NOT_FOUND");
    }

    // Create message
    const newMessage = new ChatMessage({
      content: message,
      messageType: type,
      author: req.user.userId,
      chatRoom: roomId,
    });

    await newMessage.save();

    // Populate author info
    await newMessage.populate("author", "firstName lastName username avatar");

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: { message: newMessage },
    });
  }),
);

// Create new room
router.post(
  "/rooms",
  authenticateToken,
  validationRules.createRoom,
  catchAsync(async (req, res) => {
    const { name, description, type = "public" } = req.body;

    // Check if room name already exists
    const existingRoom = await ChatRoom.findOne({ name });
    if (existingRoom) {
      throw new AppError("Room name already exists", 409, "ROOM_NAME_EXISTS");
    }

    // Create room
    const room = new ChatRoom({
      name,
      description,
      type,
      createdBy: req.user.userId,
      memberCount: 1,
    });

    await room.save();
    await room.populate("createdBy", "firstName lastName username");

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: { room },
    });
// Create new room
router.post(
  "/rooms",
  authenticateToken,
  validationRules.createRoom,
  catchAsync(async (req, res) => {
    const { name, description, type = "public" } = req.body;

    // Check if room name already exists
    const existingRoom = await ChatRoom.findOne({ name });
    if (existingRoom) {
      throw new AppError("Room name already exists", 409, "ROOM_NAME_EXISTS");
    }

    // Create room
    const room = new ChatRoom({
      name,
      description,
      type,
      createdBy: req.user.userId,
      memberCount: 1,
    });

    await room.save();
    await room.populate("createdBy", "firstName lastName username");

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: { room },
    });
  }),
);

// Get room statistics (for admin)
router.get(
  "/stats",
  catchAsync(async (req, res) => {
    // Get basic statistics
    const totalRooms = await ChatRoom.countDocuments();
    const totalMessages = await ChatMessage.countDocuments({
      "metadata.deleted": { $ne: true },
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const activeUsers24h = await ChatMessage.distinct("author", {
      createdAt: { $gte: oneDayAgo },
    });

    const messagesLastHour = await ChatMessage.countDocuments({
      createdAt: { $gte: oneHourAgo },
    });

    // Get most active rooms
    const activeRooms = await ChatMessage.aggregate([
      {
        $match: {
          createdAt: { $gte: oneDayAgo },
          "metadata.deleted": { $ne: true },
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
    ]);

    const stats = {
      totalRooms,
      totalMessages,
      activeUsers24h: activeUsers24h.length,
      messagesLastHour,
    };

    res.json({
      success: true,
      data: {
        stats,
        activeRooms,
      },
    });
  }),
);

module.exports = router;
