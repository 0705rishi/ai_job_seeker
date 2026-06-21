import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import env from "./config/env";
import connectDB from "./config/db";
import healthRouter from "./routes/health.routes";
import authRouter from "./routes/auth.routes";
import profileRouter from "./routes/profile.routes";
import jobRouter from "./routes/job.routes";
import recommendationRouter from "./routes/recommendation.routes";
import applicationRouter from "./routes/application.routes";
import savedJobRouter from "./routes/savedJob.routes";
import aiRouter from "./routes/ai.routes";
import errorHandler from "./middleware/errorHandler";

const app = express();

// Set security headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading local files in frontend
}));

// Enable CORS
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again after 15 minutes",
    },
  },
});
app.use(limiter);

// Serve uploads static folder
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Register routes
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/saved", savedJobRouter);
app.use("/api/ai", aiRouter);

// Centralized error handling
app.use(errorHandler);

// Connect database and start server
const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
