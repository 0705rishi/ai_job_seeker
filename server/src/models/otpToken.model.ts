import { Schema, model, Document, Types } from "mongoose";

export interface IOtpToken extends Document {
  userId: Types.ObjectId;
  codeHash: string;
  purpose: "verification" | "password_reset";
  expiresAt: Date;
}

const otpTokenSchema = new Schema<IOtpToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  codeHash: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["verification", "password_reset"],
    default: "verification",
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL index to automatically delete expired OTP tokens
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpToken = model<IOtpToken>("OtpToken", otpTokenSchema);
export default OtpToken;
