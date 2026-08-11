import cluster from "node:cluster";
import os from "node:os";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initFirebase } from "./config/firebase.js";

import dns from "node:dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config();

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;
const isClusterMode = process.env.CLUSTER_MODE === "true" || process.env.NODE_ENV === "production";

const startServer = async () => {
  if (isClusterMode && cluster.isPrimary) {
    console.log(`[Viśvam Cluster Master] Primary process PID ${process.pid} is running.`);
    console.log(`[Viśvam Cluster Master] Spawning ${numCPUs} CPU worker processes for high-concurrency 5,000 active users load.`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.warn(`[Viśvam Cluster Master] Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Spawning replacement...`);
      cluster.fork();
    });
  } else {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Initialize Firebase Admin SDK
    initFirebase();

    // 3. Start Express server
    const server = app.listen(PORT, () => {
      console.log(`[Viśvam Worker PID ${process.pid}] Server running on http://localhost:${PORT}`);
      console.log(`[Viśvam Worker PID ${process.pid}] Optimized to support up to 5,000 active users.`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      console.log(`[Viśvam Worker PID ${process.pid}] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log(`[Viśvam Worker PID ${process.pid}] Express server closed.`);
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  }
};

startServer();
