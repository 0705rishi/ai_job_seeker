import { Response, NextFunction } from "express";
import { z } from "zod";
import SeekerProfile from "../models/profile.model";
import Job from "../models/job.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import * as groqService from "../services/ai/groq.service";

export const skillGapSchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid jobId format"),
});

export const coverLetterSchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid jobId format"),
});

export const getAtsScore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await SeekerProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      res.status(400).json({
        success: false,
        error: { message: "Please complete your profile first before analyzing your resume." },
      });
      return;
    }

    const result = await groqService.getAtsScore(profile, req.user?.email || "");
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSkillGap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.body;
    const profile = await SeekerProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      res.status(400).json({
        success: false,
        error: { message: "Please complete your profile first." },
      });
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        error: { message: "Job not found" },
      });
      return;
    }

    const result = await groqService.getSkillGapAnalysis(profile, job);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.body;
    const profile = await SeekerProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      res.status(400).json({
        success: false,
        error: { message: "Please complete your profile first." },
      });
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        error: { message: "Job not found" },
      });
      return;
    }

    const coverLetter = await groqService.generateCoverLetter(
      profile,
      job,
      req.user?.name || "Job Seeker"
    );

    res.status(200).json({
      success: true,
      data: { coverLetter },
    });
  } catch (error) {
    next(error);
  }
};

export const generateLatexResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await SeekerProfile.findOne({ userId: req.user?._id });
    if (!profile) {
      res.status(400).json({
        success: false,
        error: { message: "Please complete your profile first." },
      });
      return;
    }

    const latex = groqService.generateLatexResume(
      profile,
      req.user?.email || "",
      req.user?.name || "Job Seeker"
    );

    res.status(200).json({
      success: true,
      data: { latex },
    });
  } catch (error) {
    next(error);
  }
};
