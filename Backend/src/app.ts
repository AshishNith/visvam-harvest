// Must run before any other local import — several modules (e.g. authController,
// authMiddleware) read process.env.JWT_SECRET at module load time, so the .env
// file has to be parsed before those modules are evaluated, not after.
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import merchandisingRoutes from "./routes/merchandisingRoutes.js";

import { checkDbConnection } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Behind the VPS nginx reverse proxy, so the client IP arrives in
// X-Forwarded-For. Trust exactly one hop (nginx) — without this the rate
// limiter keys every request off the proxy's own IP and throttles all users
// as if they were one. Not a blanket `true`, which would let clients spoof
// their own X-Forwarded-For and evade the limiter.
app.set("trust proxy", 1);

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
    message: "Welcome to Viśvam API",
    capacity: "5,000 Concurrent Active Users Ready",
    endpoints: {
      health: "/api/v1/health",
      products: "/api/v1/products",
      orders: "/api/v1/orders",
      shipping: "/api/v1/shipping",
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
    service: "Viśvam Backend API",
    capacity: "5,000 Concurrent Active Users Ready",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/v1", checkDbConnection);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/shipping", shippingRoutes);
app.use("/api/v1/contact", inquiryRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/merchandising", merchandisingRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
