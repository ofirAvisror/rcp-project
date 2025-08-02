import express from 'express';
import RecipeController from '../controllers/Recipe.Controller';
import { authenticateToken } from '../middleware/auth';
import { validateRecipeOwner } from '../middleware/Recipe.mid';

const router = express.Router();

// Routes for recipes
router.post('/', authenticateToken, RecipeController.create);
router.get('/all', RecipeController.getAllRecipes);
router.patch('/:id', authenticateToken, RecipeController.updateRecipe);

router.delete('/:id', authenticateToken, validateRecipeOwner, RecipeController.deleteRecipe);

export default router;
