const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

class Database {
  constructor() {
    this.db = null;
    this.connectionString =
      process.env.MONGODB_URI || "mongodb://localhost:27017/devhub";
  }

  async connect() {
    try {
      // MongoDB connection options
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maximum number of connections in the connection pool
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close connections after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      };

      // Connect to MongoDB
      await mongoose.connect(this.connectionString, options);

      console.log("🍃 Connected to MongoDB successfully");

      // Set up connection event listeners
      mongoose.connection.on("connected", () => {
        console.log("📦 Mongoose connected to MongoDB");
      });

      mongoose.connection.on("error", (err) => {
        console.error("❌ Mongoose connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("🔌 Mongoose disconnected from MongoDB");
      });

      // Graceful shutdown
      process.on("SIGINT", async () => {
        await this.close();
        process.exit(0);
      });

      // Initialize default data
      await this.initializeDefaultData();

      return mongoose.connection;
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      throw error;
    }
  }

  async initializeDefaultData() {
    try {
      const User = require("../models/User");
      const ChatRoom = require("../models/ChatRoom");

      // Check if admin user exists
      const adminExists = await User.findOne({ email: "admin@devhub.com" });

      if (!adminExists) {
        // Create default admin user
        const hashedPassword = await bcrypt.hash("admin123", 12);

        const adminUser = new User({
          email: "admin@devhub.com",
          password: hashedPassword,
          firstName: "Admin",
          lastName: "User",
          username: "admin",
          isAdmin: true,
          isActive: true,
          emailVerified: true,
        });

        await adminUser.save();
        console.log("✅ Default admin user created");

        // Create default chat rooms
        const defaultRooms = [
          {
            name: "General",
            description: "General discussion for all developers",
            type: "public",
            createdBy: adminUser._id,
            memberCount: 0,
          },
          {
            name: "React Help",
            description: "Get help with React development",
            type: "public",
            createdBy: adminUser._id,
            memberCount: 0,
          },
          {
            name: "JavaScript Tips",
            description: "Share JavaScript tips and tricks",
            type: "public",
            createdBy: adminUser._id,
            memberCount: 0,
          },
          {
            name: "Career Advice",
            description: "Career guidance and advice",
            type: "public",
            createdBy: adminUser._id,
            memberCount: 0,
          },
          {
            name: "Code Review",
            description: "Request code reviews from the community",
            type: "public",
            createdBy: adminUser._id,
            memberCount: 0,
          },
          {
            name: "Random",
            description: "Off-topic discussions",
            type: "public",
            createdBy: adminUser._id,
            memberCount: 0,
          },
        ];

        for (const roomData of defaultRooms) {
          const existingRoom = await ChatRoom.findOne({ name: roomData.name });
          if (!existingRoom) {
            const room = new ChatRoom(roomData);
            await room.save();
          }
        }

        console.log("✅ Default chat rooms created");
      }
    } catch (error) {
      console.error("❌ Failed to initialize default data:", error);
    }
  }

  async close() {
    try {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed");
    } catch (error) {
      console.error("❌ Error closing MongoDB connection:", error);
    }
  }

  getDb() {
    return mongoose.connection;
  }

  // Helper method to check connection status
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  // Helper method to get connection info
  getConnectionInfo() {
    return {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }
}

// Export singleton instance
module.exports = new Database();
