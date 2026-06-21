import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import SavedJob from "../models/savedJob.model";
import Job from "../models/job.model";

// Save a job
export const saveJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const seekerId = req.user?._id;

    // 1. Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        error: { message: "Job posting not found" },
      });
      return;
    }

    // 2. Check if already saved
    const existingSave = await SavedJob.findOne({ seekerId, jobId });
    if (existingSave) {
      res.status(400).json({
        success: false,
        error: { message: "Job is already saved" },
      });
      return;
    }

    // 3. Create saved job entry
    const saved = await SavedJob.create({
      seekerId,
      jobId,
    });

    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: { message: "Job is already saved" },
      });
      return;
    }
    next(error);
  }
};

// Unsave a job
export const unsaveJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const seekerId = req.user?._id;

    const result = await SavedJob.findOneAndDelete({ seekerId, jobId });
    if (!result) {
      res.status(404).json({
        success: false,
        error: { message: "Job was not saved" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { message: "Job unsaved successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// List all saved jobs
export const getSavedJobs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const seekerId = req.user?._id;

    const savedJobs = await SavedJob.find({ seekerId })
      .populate({
        path: "jobId",
        select: "-embedding"
      })
      .sort({ savedAt: -1 });

    res.status(200).json({
      success: true,
      data: savedJobs,
    });
  } catch (error) {
    next(error);
  }
};
