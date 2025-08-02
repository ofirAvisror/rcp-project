import express from 'express';
import ChefController from '../controllers/Chef.controller';

const router = express.Router();

// Routes for chefs
router.post('/', ChefController.create);
router.get('/', ChefController.findAll);
router.get('/:id', ChefController.findChef);
router.patch('/:id', ChefController.updateChef);
router.delete('/:id', ChefController.deleteChef);

export default router;
