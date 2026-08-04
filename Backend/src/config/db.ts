import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/visvam_harvest";

    const conn = await mongoose.connect(connStr, {
      maxPoolSize: 50, // Scalable pool for up to 5000 concurrent users
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: true, // Automatically build indexes for performance
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    process.exit(1);
  }
};
