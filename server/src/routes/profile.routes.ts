import { Router } from "express";
import * as profileController from "../controllers/profile.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { upload } from "../middleware/upload.middleware";

const profileRouter = Router();

profileRouter.get(
  "/",
  protect as any,
  authorize("seeker") as any,
  profileController.getProfile as any
);

profileRouter.put(
  "/",
  protect as any,
  authorize("seeker") as any,
  validate(profileController.profileUpdateSchema),
  profileController.updateProfile as any
);

profileRouter.post(
  "/resume",
  protect as any,
  authorize("seeker") as any,
  upload.single("resume"),
  profileController.parseResume as any
);

export default profileRouter;
