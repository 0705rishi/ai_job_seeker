import { Schema, model, Document, Types } from "mongoose";

export interface ISavedJob extends Document {
  seekerId: Types.ObjectId;
  jobId: Types.ObjectId;
  savedAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>(
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
  },
  {
    timestamps: { createdAt: "savedAt", updatedAt: false },
  }
);

// Enforce compound unique index for no-duplicate-saves
savedJobSchema.index({ seekerId: 1, jobId: 1 }, { unique: true });

export const SavedJob = model<ISavedJob>("SavedJob", savedJobSchema);
export default SavedJob;
