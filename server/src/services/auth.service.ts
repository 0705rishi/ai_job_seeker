import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env";
import User, { IUser } from "../models/user.model";

const generateToken = (user: IUser): string => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
};

export const registerUser = async (data: {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: "seeker" | "recruiter";
}): Promise<{ token: string; user: Omit<IUser, "passwordHash"> }> => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  // Create directly verified user
  const user = await User.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash: data.passwordHash,
    role: data.role,
    verified: true,
  });

  const token = generateToken(user);
  
  // Return user without password
  const userResponse = user.toObject();
  delete (userResponse as any).passwordHash;

  return {
    token,
    user: userResponse as any,
  };
};

export const loginUser = async (email: string, passwordHash: string): Promise<{ token: string; user: Omit<IUser, "passwordHash"> }> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  const userResponse = user.toObject();
  delete (userResponse as any).passwordHash;

  return {
    token,
    user: userResponse as any,
  };
};
