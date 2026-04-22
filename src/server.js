import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import wishlistRoutes from "./routes/wishlist.js";
import newsletterRoutes from "./routes/newsletter.js";

dotenv.config();

/* ─── Connect DB ──────────────────────────────────────────────────────────────── */
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

/* ─── Security Middleware ─────────────────────────────────────────────────────── */
app.use(helmet());
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://radiant-fenglisu-da5073.netlify.app",
  "http://localhost:5174",
  "https://anniepatricia.netlify.app",

  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(o => o.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Session-Id"],
  })
);

// Handle preflight for all routes
app.options("*", cors());

// General rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 300,
    message: { success: false, message: "Too many requests. Please try again later." },
  })
);

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts. Please try again after 15 minutes." },
});

/* ─── Body Parsing ────────────────────────────────────────────────────────────── */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

/* ─── Logging ─────────────────────────────────────────────────────────────────── */
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

/* ─── Routes ──────────────────────────────────────────────────────────────────── */
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/newsletter", newsletterRoutes);

/* ─── Health Check ────────────────────────────────────────────────────────────── */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

/* ─── 404 ─────────────────────────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

/* ─── Error Handler ───────────────────────────────────────────────────────────── */
app.use(errorHandler);

/* ─── Start ───────────────────────────────────────────────────────────────────── */
const server = app.listen(PORT, () => {
  console.log(`🚀 Annie Patricia API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});

export default app;
