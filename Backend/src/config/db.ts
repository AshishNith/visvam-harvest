import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/visvam";

  // Prevent duplicate connection attempts
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    console.log(`[MongoDB] Connecting to database...`);
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 100,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 15000, // 15 seconds timeout for cloud Atlas connections
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      autoIndex: true,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.error(`[MongoDB Error] Failed to connect to MongoDB (${error.message}).`);
    console.error(`[MongoDB Tip] Ensure 0.0.0.0/0 (Allow Access from Anywhere) is enabled in MongoDB Atlas Network Access.`);
  }
};

// Global DB Connection Health Check Middleware
export const checkDbConnection = (req: any, res: any, next: any) => {
  if (mongoose.connection.readyState !== 1) {
    // Attempt auto-reconnect asynchronously
    connectDB().catch(() => {});
    return res.status(503).json({
      success: false,
      message: "Database connection initializing or unreachable. If using MongoDB Atlas, verify IP Whitelist (0.0.0.0/0) is active.",
    });
  }
  next();
};
