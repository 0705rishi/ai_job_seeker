import { Router } from "express";
import * as aiController from "../controllers/ai.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const aiRouter = Router();

aiRouter.post(
  "/resume-score",
  protect as any,
  authorize("seeker") as any,
  aiController.getAtsScore as any
);

aiRouter.post(
  "/skill-gap",
  protect as any,
  authorize("seeker") as any,
  validate(aiController.skillGapSchema),
  aiController.getSkillGap as any
);

aiRouter.post(
  "/cover-letter",
  protect as any,
  authorize("seeker") as any,
  validate(aiController.coverLetterSchema),
  aiController.generateCoverLetter as any
);

aiRouter.post(
  "/latex-resume",
  protect as any,
  authorize("seeker") as any,
  aiController.generateLatexResume as any
);

export default aiRouter;
