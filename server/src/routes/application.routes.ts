import { Router } from "express";
import * as applicationController from "../controllers/application.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const applicationRouter = Router();

// Seeker routes
applicationRouter.post(
  "/",
  protect as any,
  authorize("seeker") as any,
  validate(applicationController.applySchema),
  applicationController.applyToJob as any
);

applicationRouter.get(
  "/",
  protect as any,
  authorize("seeker") as any,
  applicationController.getMyApplications as any
);

// Recruiter routes
applicationRouter.patch(
  "/:id/status",
  protect as any,
  authorize("recruiter") as any,
  validate(applicationController.updateStatusSchema),
  applicationController.updateApplicationStatus as any
);

export default applicationRouter;
