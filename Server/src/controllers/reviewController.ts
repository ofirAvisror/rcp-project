// src/controllers/reviewController.ts
import { Response } from "express";
import mongoose from "mongoose";
import Review from "../models/Review";
import Recipe from "../models/Recipe";
import { AuthRequest } from "../middleware/auth";

// src/controllers/reviewController.ts
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id: recipeId } = req.params;
    const { text, rating } = req.body;
    const userId = req.user?.userId;

    console.log("📩 Incoming review request:", { recipeId, text, rating, userId });

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 4) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 4" });
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ message: "Review text is required" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const existing = await Review.findOne({
      recipe: new mongoose.Types.ObjectId(recipeId),
      reviewer: new mongoose.Types.ObjectId(userId),
    });
    if (existing) {
      return res.status(400).json({ message: "You already reviewed this recipe" });
    }

    const review = await Review.create({
      recipe: new mongoose.Types.ObjectId(recipeId),
      reviewer: new mongoose.Types.ObjectId(userId),
      rating,
      text,
    });

    console.log("✅ Review successfully created:", review);

    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    console.error("❌ Error in addReview:", err);
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};
``

export const getReviewsByRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { id: recipeId } = req.params;

    console.log("📩 Fetching reviews for recipeId:", recipeId);

    const reviews = await Review.find({
      recipe: new mongoose.Types.ObjectId(recipeId),
    })
      .populate("reviewer", "email")
      .sort({ createdAt: -1 });

    console.log("✅ Reviews found:", reviews.length);

    res.status(200).json({ reviews });
  } catch (err) {
    console.error("❌ Error in getReviewsByRecipe:", err);
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};
