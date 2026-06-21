import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import SeekerProfile from "../models/profile.model";
import Job from "../models/job.model";
import { calculateJobMatch } from "../services/matching/matching.service";

export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;

    // 1. Fetch user profile
    const profile = await SeekerProfile.findOne({ userId });
    if (!profile) {
      res.status(200).json({
        success: true,
        data: {
          recommendations: [],
          onboardingRequired: true,
          message: "Please complete your onboarding profile to view recommendations."
        }
      });
      return;
    }

    // 2. Fetch all active jobs
    const jobs = await Job.find({ status: "active" });

    // 3. Compute match scores in-memory
    const recommendations = jobs
      .map((job) => {
        const match = calculateJobMatch(profile, job);
        return {
          job: {
            _id: job._id,
            title: job.title,
            company: job.company,
            description: job.description,
            requirements: job.requirements,
            skills: job.skills,
            location: job.location,
            workMode: job.workMode,
            type: job.type,
            source: job.source,
            externalUrl: job.externalUrl,
            status: job.status,
            createdAt: job.createdAt
          },
          match
        };
      })
      // 4. Sort by match score in descending order
      .sort((a, b) => b.match.score - a.match.score);

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        onboardingRequired: false
      }
    });
  } catch (error) {
    next(error);
  }
};
