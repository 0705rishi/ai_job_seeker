import { Schema, model, Document, Types } from "mongoose";

export interface IEducation {
  degree: string;
  institution: string;
  year: number;
}

export interface IProject {
  title: string;
  description: string;
  tech: string[];
}

export interface IExperience {
  role: string;
  org: string;
  durationMonths: number;
  summary: string;
}

export interface IPreferences {
  roles: string[];
  locations: string[];
  workMode: "remote" | "onsite" | "hybrid" | "any";
}

export interface ISeekerProfile extends Document {
  userId: Types.ObjectId;
  education: IEducation[];
  skills: string[];
  projects: IProject[];
  experience: IExperience[];
  preferences: IPreferences;
  resumeUrl?: string;
  resumeText?: string;
  embedding?: number[];
  completeness: number;
}

const seekerProfileSchema = new Schema<ISeekerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
      },
    ],
    skills: [{ type: String, trim: true }],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        tech: [{ type: String, trim: true }],
      },
    ],
    experience: [
      {
        role: { type: String, required: true },
        org: { type: String, required: true },
        durationMonths: { type: Number, required: true },
        summary: { type: String, required: true },
      },
    ],
    preferences: {
      roles: [{ type: String, trim: true }],
      locations: [{ type: String, trim: true }],
      workMode: {
        type: String,
        enum: ["remote", "onsite", "hybrid", "any"],
        default: "any",
      },
    },
    resumeUrl: { type: String },
    resumeText: { type: String },
    embedding: [{ type: Number }],
    completeness: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const SeekerProfile = model<ISeekerProfile>("SeekerProfile", seekerProfileSchema);
export default SeekerProfile;
