const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const ChatRoom = require('./models/ChatRoom');
const ChatMessage = require('./models/ChatMessage');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.username} (${socket.id})`);

        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.user.username} joined room ${roomId}`);
        });

        socket.on('leave_room', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.user.username} left room ${roomId}`);
        });

        socket.on('send_message', async (data) => {
            try {
                const { roomId, content, type = 'text' } = data;

                // Save message to database
                const newMessage = new ChatMessage({
                    content,
                    messageType: type,
                    author: socket.user._id,
                    chatRoom: roomId,
                    createdAt: new Date(),
                    metadata: {
                        ipAddress: socket.handshake.address,
                        userAgent: socket.handshake.headers['user-agent']
                    }
                });

                await newMessage.save();

                // Populate author info
                await newMessage.populate({
                    path: "author",
                    select: "firstName lastName username avatar",
                    options: { lean: true }
                });

                // Update room activity
                await ChatRoom.findByIdAndUpdate(roomId, {
                    lastActivity: new Date(),
                    $inc: { messageCount: 1 }
                });

                // Broadcast to room
                io.to(roomId).emit('receive_message', newMessage);
            } catch (error) {
                console.error('Socket message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initializeSocket, getIo };
