import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import User, { IUser } from "../models/user.model";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  userId: string;
  role: "seeker" | "recruiter";
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: "Not authorized, token missing" },
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Get user from DB
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: "Not authorized, user not found" },
      });
      return;
    }

    if (!user.verified) {
      res.status(403).json({
        success: false,
        error: { message: "Account is not verified. Please verify using OTP." },
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: "Not authorized, invalid token" },
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { message: `Role '${req.user?.role || "unknown"}' is not authorized to access this resource` },
      });
      return;
    }
    next();
  };
};
