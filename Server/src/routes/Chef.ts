import express from 'express';
import ChefController from '../controllers/Chef.controller';

const router = express.Router();

// Routes for chefs
router.post('/all', ChefController.create);
router.get('/all', ChefController.findAll);
router.get('/all', ChefController.findChef);
router.patch('/all', ChefController.updateChef);
router.delete('/all', ChefController.deleteChef);

export default router;
