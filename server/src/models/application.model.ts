import { Schema, model, Document, Types } from "mongoose";

export interface IApplication extends Document {
  seekerId: Types.ObjectId;
  jobId: Types.ObjectId;
  resumeUrl: string;
  matchScore: number;
  status: "applied" | "review" | "shortlisted" | "rejected";
  appliedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    seekerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "review", "shortlisted", "rejected"],
      default: "applied",
    },
  },
  {
    timestamps: { createdAt: "appliedAt", updatedAt: true },
  }
);

// Enforce compound unique index for no-duplicate-applications
applicationSchema.index({ seekerId: 1, jobId: 1 }, { unique: true });

export const Application = model<IApplication>("Application", applicationSchema);
export default Application;
