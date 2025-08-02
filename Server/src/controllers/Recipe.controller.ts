import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import RecipeModel from '../models/Recipe';
import ChefModel from '../models/Chef';
import User from '../models/User';

const RecipeController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, chef, publishedYear, categories, description, chefBirthYear } = req.body;

      let recipeChef;

      // בדיקה אם chef הוא ObjectId תקין
      if (/^[0-9a-fA-F]{24}$/.test(chef)) {
        recipeChef = await ChefModel.findById(chef);
      }

      // אם לא נמצא לפי ID – ננסה לפי שם
      if (!recipeChef) {
        recipeChef = await ChefModel.findOne({ name: chef });

        // אם לא קיים כלל – צור חדש רק אם birthYear קיים
        if (!recipeChef) {
          if (chefBirthYear === undefined || chefBirthYear === null) {
            res.status(400).json({
              success: false,
              message: "Chef not found and birthYear is required to create new chef",
            });
            return;
          }
          recipeChef = await ChefModel.create({ name: chef, birthYear: chefBirthYear });
        }
      }

      // בדיקת המשתמש המחובר
      const user = await User.findById(req.user?.userId);
      if (!user) {
        res.status(400).json({ success: false, message: "User not found" });
        return;
      }

      // יצירת מתכון חדש
      const newRecipe = await RecipeModel.create({
        title,
        chef: recipeChef._id,
        publishedYear,
        categories,
        description,
        addedBy: user._id,
      });

      const populatedRecipe = await RecipeModel.findById(newRecipe._id)
        .populate('chef', 'name')
        .populate('addedBy', 'name');

      res.status(201).json({
        success: true,
        data: populatedRecipe,
      });
    } catch (error) {
      console.error('Create recipe error:', error);
      res.status(500).json({
        message: 'Server error during recipe creation',
        error,
      });
    }
  },

  async getAllRecipes(req: Request, res: Response): Promise<void> {
    try {
      const recipes = await RecipeModel.find()
        .populate('chef', 'name')
        .populate('addedBy', 'name');

      res.status(200).json({
        success: true,
        data: recipes,
      });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({
        message: 'Server error during fetching recipes',
        error,
      });
    }
  },

  async deleteRecipe(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(404).json({
          success: false,
          message: `Recipe with id: ${id} not found`,
        });
        return;
      }

      await RecipeModel.findOneAndDelete({ _id: id });

      res.json({
        success: true,
        message: `Recipe with id: ${id} deleted.`,
      });
    } catch (error) {
      console.error('Delete recipe error:', error);
      res.status(500).json({
        message: 'Server error during deletion',
        error,
      });
    }
  },

  async updateRecipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, chef, publishedYear, categories, description } = req.body;

      const existingRecipe = await RecipeModel.findById(id);
      if (!existingRecipe) {
        res.status(404).json({ message: "Recipe not found" });
        return;
      }

      const recipeChef = await ChefModel.findById(chef);
      if (!recipeChef) {
        res.status(400).json({ message: "Invalid chef ID" });
        return;
      }

      existingRecipe.title = title;
      existingRecipe.chef = recipeChef._id;
      existingRecipe.publishedYear = publishedYear;
      existingRecipe.categories = categories;
      existingRecipe.description = description;

      await existingRecipe.save();

      const updated = await RecipeModel.findById(id)
        .populate("chef", "name")
        .populate("addedBy", "name");

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error("Update recipe error:", error);
      res.status(500).json({ message: "Server error during update", error });
    }
  }
};

export default RecipeController;
