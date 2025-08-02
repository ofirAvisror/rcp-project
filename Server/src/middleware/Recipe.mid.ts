import Recipe from "../models/Recipe";
import { Response, NextFunction } from 'express';
import { AuthRequest } from "./auth";

export const validateRecipeOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      res.status(404).json({
        success: false,
        message: `Recipe With id: ${id} Not Found`
      });
      return;
    }

    console.log(`userId: ${req.user?.userId}`);
    console.log(`recipe addedBy: ${recipe?.addedBy}`);

    if (req.user?.userId.toString() === recipe.addedBy.toString()) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "You are not authorized to modify a recipe you haven't created"
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during recipe ownership validation",
      error
    });
  }
}
