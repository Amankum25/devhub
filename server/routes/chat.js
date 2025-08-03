const express = require("express");
const database = require("../config/database");
const { AppError, catchAsync } = require("../middleware/errorHandler");
const { validationRules } = require("../middleware/validation");

const router = express.Router();

// Get all chat rooms
router.get(
  "/rooms",
  catchAsync(async (req, res) => {
    const db = database.getDb();

    const rooms = await db.all(`
    SELECT 
      cr.id, cr.name, cr.description, cr.type, cr.memberCount, cr.createdAt,
      u.firstName, u.lastName, u.username as createdByUsername
    FROM chat_rooms cr
    LEFT JOIN users u ON cr.createdBy = u.id
    WHERE cr.type = 'public'
    ORDER BY cr.memberCount DESC, cr.name ASC
  `);

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
    const offset = (page - 1) * limit;

    const db = database.getDb();

    // Check if room exists
    const room = await db.get("SELECT id, type FROM chat_rooms WHERE id = ?", [
      roomId,
    ]);
    if (!room) {
      throw new AppError("Room not found", 404, "ROOM_NOT_FOUND");
    }

    // Get messages
    const messages = await db.all(
      `
    SELECT 
      cm.id, cm.content, cm.type, cm.createdAt, cm.editedAt,
      u.firstName, u.lastName, u.username, u.avatar
    FROM chat_messages cm
    JOIN users u ON cm.userId = u.id
    WHERE cm.roomId = ? AND cm.deletedAt IS NULL
    ORDER BY cm.createdAt DESC
    LIMIT ? OFFSET ?
  `,
      [roomId, limit, offset],
    );

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
  validationRules.sendMessage,
  catchAsync(async (req, res) => {
    const { roomId } = req.params;
    const { message, type = "text" } = req.body;
    const db = database.getDb();

    // Check if room exists
    const room = await db.get("SELECT id FROM chat_rooms WHERE id = ?", [
      roomId,
    ]);
    if (!room) {
      throw new AppError("Room not found", 404, "ROOM_NOT_FOUND");
    }

    // Create message
    const result = await db.run(
      `
    INSERT INTO chat_messages (roomId, userId, content, type)
    VALUES (?, ?, ?, ?)
  `,
      [roomId, req.user.id, message, type],
    );

    // Get the created message with user info
    const newMessage = await db.get(
      `
    SELECT 
      cm.id, cm.content, cm.type, cm.createdAt,
      u.firstName, u.lastName, u.username, u.avatar
    FROM chat_messages cm
    JOIN users u ON cm.userId = u.id
    WHERE cm.id = ?
  `,
      [result.lastID],
    );

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
  validationRules.createRoom,
  catchAsync(async (req, res) => {
    const { name, description, type = "public" } = req.body;
    const db = database.getDb();

    // Check if room name already exists
    const existingRoom = await db.get(
      "SELECT id FROM chat_rooms WHERE name = ?",
      [name],
    );
    if (existingRoom) {
      throw new AppError("Room name already exists", 409, "ROOM_NAME_EXISTS");
    }

    // Create room
    const result = await db.run(
      `
    INSERT INTO chat_rooms (name, description, type, createdBy, memberCount)
    VALUES (?, ?, ?, ?, ?)
  `,
      [name, description, type, req.user.id, 1],
    );

    const room = await db.get(
      `
    SELECT 
      cr.*, 
      u.firstName, u.lastName, u.username as createdByUsername
    FROM chat_rooms cr
    JOIN users u ON cr.createdBy = u.id
    WHERE cr.id = ?
  `,
      [result.lastID],
    );

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
    const db = database.getDb();

    const stats = await db.get(`
    SELECT 
      (SELECT COUNT(*) FROM chat_rooms) as totalRooms,
      (SELECT COUNT(*) FROM chat_messages WHERE deletedAt IS NULL) as totalMessages,
      (SELECT COUNT(DISTINCT userId) FROM chat_messages WHERE createdAt > datetime('now', '-24 hours')) as activeUsers24h,
      (SELECT COUNT(*) FROM chat_messages WHERE createdAt > datetime('now', '-1 hour')) as messagesLastHour
  `);

    // Get most active rooms
    const activeRooms = await db.all(`
    SELECT 
      cr.id, cr.name, cr.memberCount,
      COUNT(cm.id) as messageCount
    FROM chat_rooms cr
    LEFT JOIN chat_messages cm ON cr.id = cm.roomId 
      AND cm.createdAt > datetime('now', '-24 hours')
      AND cm.deletedAt IS NULL
    GROUP BY cr.id
    ORDER BY messageCount DESC
    LIMIT 5
  `);

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
