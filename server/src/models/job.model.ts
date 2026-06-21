import { Schema, model, Document, Types } from "mongoose";

export interface IJob extends Document {
  recruiterId: Types.ObjectId;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  workMode: "remote" | "onsite" | "hybrid" | "any";
  type: "full-time" | "part-time" | "internship" | "contract" | "temporary";
  source: "internal" | "external";
  externalUrl?: string;
  status: "active" | "closed";
  embedding: number[];
  createdAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [{ type: String }],
    skills: [{ type: String, trim: true }],
    location: {
      type: String,
      required: true,
      trim: true,
    },
    workMode: {
      type: String,
      enum: ["remote", "onsite", "hybrid", "any"],
      default: "any",
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract", "temporary"],
      default: "full-time",
    },
    source: {
      type: String,
      enum: ["internal", "external"],
      default: "internal",
    },
    externalUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    embedding: [{ type: Number }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Job = model<IJob>("Job", jobSchema);
export default Job;
