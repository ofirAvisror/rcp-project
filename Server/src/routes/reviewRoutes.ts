import { Router } from "express";
import { addReview, getReviewsByRecipe } from "../controllers/reviewController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// POST /api/recipes/:id/reviews
router.post("/:id/reviews", authenticateToken, addReview);

// GET /api/recipes/:id/reviews
router.get("/:id/reviews", getReviewsByRecipe);

export default router;
