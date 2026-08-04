import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initFirebase } from "./config/firebase.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Initialize MongoDB connection
  await connectDB();

  // 2. Initialize Firebase Admin SDK
  initFirebase();

  // 3. Start Express HTTP server
  app.listen(PORT, () => {
    console.log(`[Viśvam Backend] Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
    console.log(`[Viśvam Backend] Target capacity: 5,000 active users ready.`);
  });
};

startServer();
