import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import env from "../config/env";
import User, { IUser } from "../models/user.model";
import OtpToken from "../models/otpToken.model";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || "",
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER || "",
    pass: env.SMTP_PASS || "",
  },
});

const sendOtpEmail = async (email: string, code: string): Promise<void> => {
  const isSmtpConfigured = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS;

  if (!isSmtpConfigured) {
    console.log(`
=========================================================
[DEV OTP SERVICE] Email: ${email}
[DEV OTP SERVICE] Verification Code: ${code}
=========================================================
    `);
    return;
  }

  const mailOptions = {
    from: `"AI Job Seeker" <${env.SMTP_USER}>`,
    to: email,
    subject: "AI Job Seeker - Verify Your Account",
    text: `Your verification code is: ${code}. It is valid for 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e6e9f0; rounded-radius: 12px;">
        <h2 style="color: #4f46e5; text-align: center;">Verify Your Account</h2>
        <p>Thank you for signing up with AI Job Seeker. Use the verification code below to activate your account:</p>
        <div style="background-color: #eef0ff; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 5 minutes. If you did not sign up for this account, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📡 OTP email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Failed to send OTP email to ${email}:`, err);
    throw new Error("Failed to send verification email. Please try again.");
  }
};

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

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
}): Promise<{ userId: string; email: string }> => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  // Create unverified user
  const user = await User.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash: data.passwordHash,
    role: data.role,
    verified: false,
  });

  // Generate and save OTP
  const code = generateOtp();
  const salt = await bcrypt.genSalt(10);
  const codeHash = await bcrypt.hash(code, salt);

  await OtpToken.create({
    userId: user._id,
    codeHash,
    purpose: "verification",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiration
  });

  // Send OTP
  await sendOtpEmail(user.email, code);

  return {
    userId: user._id.toString(),
    email: user.email,
  };
};

export const verifyOtp = async (email: string, code: string): Promise<{ token: string; user: Omit<IUser, "passwordHash"> }> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const otpToken = await OtpToken.findOne({ userId: user._id, purpose: "verification" });
  if (!otpToken) {
    throw new Error("Invalid or expired OTP");
  }

  // Compare OTP
  const isMatch = await bcrypt.compare(code, otpToken.codeHash);
  if (!isMatch) {
    throw new Error("Invalid OTP code");
  }

  // Mark user as verified
  user.verified = true;
  await user.save();

  // Clean up OTP
  await OtpToken.deleteOne({ _id: otpToken._id });

  const token = generateToken(user);
  
  // Return user without password
  const userResponse = user.toObject();
  delete (userResponse as any).passwordHash;

  return {
    token,
    user: userResponse as any,
  };
};

export const resendOtp = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.verified) {
    throw new Error("Account is already verified");
  }

  // Delete previous OTP tokens
  await OtpToken.deleteMany({ userId: user._id, purpose: "verification" });

  // Generate new OTP
  const code = generateOtp();
  const salt = await bcrypt.genSalt(10);
  const codeHash = await bcrypt.hash(code, salt);

  await OtpToken.create({
    userId: user._id,
    codeHash,
    purpose: "verification",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });

  await sendOtpEmail(user.email, code);
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

  if (!user.verified) {
    throw new Error("Account not verified. Please verify using OTP.");
  }

  const token = generateToken(user);

  const userResponse = user.toObject();
  delete (userResponse as any).passwordHash;

  return {
    token,
    user: userResponse as any,
  };
};
