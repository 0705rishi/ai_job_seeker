import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import Job from "../models/job.model";
import SeekerProfile from "../models/profile.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getEmbedding } from "../services/ai/gemini.service";
import { calculateJobMatch } from "../services/matching/matching.service";

// Validation Schema for creating a job
export const jobCreateSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  company: z.string().min(1, "Company is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  location: z.string().min(1, "Location is required"),
  workMode: z.enum(["remote", "onsite", "hybrid", "any"]).default("any"),
  type: z.enum(["full-time", "part-time", "internship", "contract", "temporary"]).default("full-time"),
  source: z.enum(["internal", "external"]).default("internal"),
  externalUrl: z.string().url("Invalid external URL").optional().or(z.literal("")),
});

// Validation Schema for updating a job
export const jobUpdateSchema = jobCreateSchema.partial();

// Get list of all active jobs with search, filtering, and pagination
export const getJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, location, workMode, type, page = 1, limit = 10 } = req.query;
    
    // Construct query object
    const query: any = { status: "active" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (workMode && workMode !== "all" && workMode !== "any") {
      query.workMode = workMode;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    // Pagination calculations
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Fetch matching jobs
    const jobs = await Job.find(query)
      .select("-embedding") // Exclude embedding vector from general listing
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalJobs = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          total: totalJobs,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalJobs / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve a single job details
export const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id).select("-embedding");
    if (!job) {
      res.status(404).json({
        success: false,
        error: { message: "Job posting not found" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new job posting (recruiter only)
export const createJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobData = req.body;
    
    // Generate text details for semantic matching embedding
    const jobText = `
      Title: ${jobData.title}
      Company: ${jobData.company}
      Description: ${jobData.description}
      Requirements: ${jobData.requirements.join(", ")}
      Skills: ${jobData.skills.join(", ")}
      Location: ${jobData.location}
      Work Mode: ${jobData.workMode}
    `;

    // Compute embedding vector
    const embedding = await getEmbedding(jobText);

    // Save job posting
    const job = await Job.create({
      ...jobData,
      recruiterId: req.user?._id,
      embedding,
    });

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// Edit a job posting (recruiter only)
export const updateJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = req.params.id;
    
    const existingJob = await Job.findById(jobId);
    if (!existingJob) {
      res.status(404).json({
        success: false,
        error: { message: "Job posting not found" },
      });
      return;
    }

    // Verify ownership
    if (existingJob.recruiterId.toString() !== req.user?._id.toString()) {
      res.status(403).json({
        success: false,
        error: { message: "You are not authorized to update this job posting" },
      });
      return;
    }

    const updateData = req.body;

    // If description/title/skills change, re-generate embedding
    if (updateData.title || updateData.description || updateData.skills || updateData.requirements) {
      const title = updateData.title || existingJob.title;
      const company = updateData.company || existingJob.company;
      const description = updateData.description || existingJob.description;
      const requirements = updateData.requirements || existingJob.requirements;
      const skills = updateData.skills || existingJob.skills;
      const location = updateData.location || existingJob.location;
      const workMode = updateData.workMode || existingJob.workMode;

      const jobText = `
        Title: ${title}
        Company: ${company}
        Description: ${description}
        Requirements: ${requirements.join(", ")}
        Skills: ${skills.join(", ")}
        Location: ${location}
        Work Mode: ${workMode}
      `;
      updateData.embedding = await getEmbedding(jobText);
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// Delete/Close a job posting (recruiter only)
export const deleteJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = req.params.id;
    
    const existingJob = await Job.findById(jobId);
    if (!existingJob) {
      res.status(404).json({
        success: false,
        error: { message: "Job posting not found" },
      });
      return;
    }

    // Verify ownership
    if (existingJob.recruiterId.toString() !== req.user?._id.toString()) {
      res.status(403).json({
        success: false,
        error: { message: "You are not authorized to delete this job posting" },
      });
      return;
    }

    // Mark as closed instead of true delete to maintain applicant relations, or delete
    // per instructions. Let's delete it per REST convention or close it.
    // The implementation plan says "Close/remove job", so marking status as closed is safe, 
    // or deleting from DB. Let's delete it so the browse listing is cleaned up.
    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      data: { message: "Job posting removed successfully" },
    });
  } catch (error) {
    next(error);
  }
};

// Get match score and details for a specific job (seeker only)
export const getJobMatch = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = req.params.id;
    const userId = req.user?._id;

    // Fetch the job
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        error: { message: "Job posting not found" },
      });
      return;
    }

    // Fetch seeker profile
    const profile = await SeekerProfile.findOne({ userId });
    if (!profile) {
      res.status(200).json({
        success: true,
        data: {
          match: null,
          onboardingRequired: true,
          message: "Please complete onboarding to calculate match scores.",
        },
      });
      return;
    }

    // Calculate match
    const match = calculateJobMatch(profile, job);

    res.status(200).json({
      success: true,
      data: {
        match,
        onboardingRequired: false,
      },
    });
  } catch (error) {
    next(error);
  }
};
