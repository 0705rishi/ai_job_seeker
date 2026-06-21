import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { protect } from "../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

const authRouter = Router();

// Rate limiting for auth endpoints (brute force mitigation)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // max 20 attempts
  message: {
    success: false,
    error: {
      message: "Too many authentication attempts. Please try again after 15 minutes.",
    },
  },
});

authRouter.post(
  "/register",
  authRateLimiter,
  validate(authController.registerSchema),
  authController.register
);

authRouter.post(
  "/verify-otp",
  authRateLimiter,
  validate(authController.verifyOtpSchema),
  authController.verify
);

authRouter.post(
  "/resend-otp",
  authRateLimiter,
  validate(authController.resendOtpSchema),
  authController.resend
);

authRouter.post(
  "/login",
  authRateLimiter,
  validate(authController.loginSchema),
  authController.login
);

authRouter.get("/me", protect as any, authController.me as any);

export default authRouter;
