import { Router } from "express";
import * as jobController from "../controllers/job.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { getJobApplicants } from "../controllers/application.controller";

const jobRouter = Router();

// Public routes to read postings
jobRouter.get("/", jobController.getJobs);
jobRouter.get("/:id", jobController.getJobById);
jobRouter.get(
  "/:id/match",
  protect as any,
  authorize("seeker") as any,
  jobController.getJobMatch as any
);

// Recruiter restricted routes to write/modify postings
jobRouter.post(
  "/",
  protect as any,
  authorize("recruiter") as any,
  validate(jobController.jobCreateSchema),
  jobController.createJob as any
);

jobRouter.put(
  "/:id",
  protect as any,
  authorize("recruiter") as any,
  validate(jobController.jobUpdateSchema),
  jobController.updateJob as any
);

jobRouter.delete(
  "/:id",
  protect as any,
  authorize("recruiter") as any,
  jobController.deleteJob as any
);

jobRouter.get(
  "/:id/applicants",
  protect as any,
  authorize("recruiter") as any,
  getJobApplicants as any
);

export default jobRouter;
