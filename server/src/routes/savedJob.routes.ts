import { Router } from "express";
import * as savedJobController from "../controllers/savedJob.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const savedJobRouter = Router();

savedJobRouter.get(
  "/",
  protect as any,
  authorize("seeker") as any,
  savedJobController.getSavedJobs as any
);

savedJobRouter.post(
  "/:jobId",
  protect as any,
  authorize("seeker") as any,
  savedJobController.saveJob as any
);

savedJobRouter.delete(
  "/:jobId",
  protect as any,
  authorize("seeker") as any,
  savedJobController.unsaveJob as any
);

export default savedJobRouter;
