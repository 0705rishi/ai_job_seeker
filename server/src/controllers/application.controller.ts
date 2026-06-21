import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import Application from "../models/application.model";
import Job from "../models/job.model";
import SeekerProfile from "../models/profile.model";
import { calculateJobMatch } from "../services/matching/matching.service";

// Zod validation for applying to a job
export const applySchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
});

// Zod validation for status update
export const updateStatusSchema = z.object({
  status: z.enum(["applied", "review", "shortlisted", "rejected"]),
});

// Seeker applies for an internal job (one-click apply)
export const applyToJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.body;
    const seekerId = req.user?._id;

    // 1. Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        error: { message: "Job posting not found" },
      });
      return;
    }

    if (job.status === "closed") {
      res.status(400).json({
        success: false,
        error: { message: "This job posting has been closed" },
      });
      return;
    }

    // 2. Retrieve seeker profile & verify resume exists
    const profile = await SeekerProfile.findOne({ userId: seekerId });
    if (!profile || !profile.resumeUrl) {
      res.status(400).json({
        success: false,
        error: {
          message: "Please complete onboarding and upload a resume before applying.",
        },
      });
      return;
    }

    // 3. Prevent duplicate applications
    const existingApplication = await Application.findOne({ seekerId, jobId });
    if (existingApplication) {
      res.status(400).json({
        success: false,
        error: { message: "You have already applied to this job" },
      });
      return;
    }

    // 4. Calculate match score to persist on the application
    const match = calculateJobMatch(profile, job);

    // 5. Create application record
    const application = await Application.create({
      seekerId,
      jobId,
      resumeUrl: profile.resumeUrl,
      matchScore: match.score,
      status: "applied",
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error: any) {
    // Catch Mongoose duplicate key error (code 11000) just in case
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: { message: "You have already applied to this job" },
      });
      return;
    }
    next(error);
  }
};

// Seeker gets own applications list
export const getMyApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const seekerId = req.user?._id;

    const applications = await Application.find({ seekerId })
      .populate({
        path: "jobId",
        select: "-embedding"
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// Recruiter updates application status
export const updateApplicationStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;
    const recruiterId = req.user?._id;

    if (!recruiterId) {
      res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
      return;
    }

    // 1. Fetch application and populate job details to check ownership
    const application = await Application.findById(applicationId).populate("jobId");
    if (!application) {
      res.status(404).json({
        success: false,
        error: { message: "Application not found" },
      });
      return;
    }

    const job = application.jobId as any;
    if (!job) {
      res.status(404).json({
        success: false,
        error: { message: "Associated job posting no longer exists" },
      });
      return;
    }

    // 2. Verify job ownership
    if (job.recruiterId.toString() !== recruiterId.toString()) {
      res.status(403).json({
        success: false,
        error: { message: "You are not authorized to update this application status" },
      });
      return;
    }

    // 3. Update status
    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Recruiter fetches applicants for a specific job posting
export const getJobApplicants = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = req.params.id;
    const recruiterId = req.user?._id;

    if (!recruiterId) {
      res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
      return;
    }

    // 1. Verify job existence and recruiter ownership
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        error: { message: "Job posting not found" },
      });
      return;
    }

    if (job.recruiterId.toString() !== recruiterId.toString()) {
      res.status(403).json({
        success: false,
        error: { message: "You are not authorized to view applicants for this job" },
      });
      return;
    }

    // 2. Fetch applications and populate seeker user detail
    const applications = await Application.find({ jobId })
      .populate("seekerId", "name email phone")
      .sort({ appliedAt: -1 });

    // 3. Attach seeker profiles for resume access & skills breakdown
    const applicantsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const seekerUser = app.seekerId as any;
        const profile = await SeekerProfile.findOne({ userId: seekerUser?._id })
          .select("education skills projects experience preferences completeness");
        
        return {
          application: {
            _id: app._id,
            resumeUrl: app.resumeUrl,
            matchScore: app.matchScore,
            status: app.status,
            appliedAt: app.appliedAt,
          },
          seeker: {
            _id: seekerUser?._id,
            name: seekerUser?.name,
            email: seekerUser?.email,
            phone: seekerUser?.phone,
            profile,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: applicantsWithProfiles,
    });
  } catch (error) {
    next(error);
  }
};
