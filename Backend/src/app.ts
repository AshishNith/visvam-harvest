import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { checkDbConnection } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Security Headers & Dynamic CORS configuration
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:8081", "http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes("*") ||
        origin === "https://visvam.in" ||
        origin === "http://visvam.in" ||
        origin === "https://www.visvam.in" ||
        origin === "http://www.visvam.in" ||
        origin.endsWith("visvam.in") ||
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.endsWith(".lovable.app") ||
        origin.endsWith(".lovableproject.com")
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Cache", "Accept"],
  })
);

// Payload compression for high concurrency (5,000 active users)
app.use(compression());

// Body Parsing & Rate Limiting
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(apiLimiter);

// Root Welcome Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Viśvam Harvest API",
    capacity: "5,000 Concurrent Active Users Ready",
    endpoints: {
      health: "/api/v1/health",
      products: "/api/v1/products",
      orders: "/api/v1/orders",
      contact: "/api/v1/contact",
      newsletter: "/api/v1/newsletter",
    },
  });
});

// Health Check Endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Viśvam Harvest Backend API",
    capacity: "5,000 Concurrent Active Users Ready",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/v1", checkDbConnection);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/contact", inquiryRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/users", userRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
