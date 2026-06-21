import { Router } from "express";
import * as recommendationController from "../controllers/recommendation.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const recommendationRouter = Router();

recommendationRouter.get(
  "/",
  protect as any,
  authorize("seeker") as any,
  recommendationController.getRecommendations as any
);

export default recommendationRouter;
