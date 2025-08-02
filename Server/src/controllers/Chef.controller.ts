import { Request, Response } from 'express';
import ChefModel from '../models/Chef';

const ChefController = {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, specialty, experienceYears, about } = req.body;

      if (!name || !specialty || !experienceYears) {
        res.status(400).json({
          success: false,
          message: "name, specialty or experienceYears are missing"
        });
        return;
      }

      const newChef = await ChefModel.create({
        name,
        specialty,
        experienceYears,
        about
      });

      await newChef.save();

      res.status(201).json({
        success: true,
        data: newChef
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration', error });
    }
  },

  async findChef(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const chef = await ChefModel.findById(id).populate('recipes');

      if (!chef) {
        res.status(404).json({
          success: false,
          message: `Chef With id: ${id} Not Found`
        });
        return;
      }

      res.json({
        success: true,
        data: chef
      });
    } catch (error) {
      console.error('Find chef error:', error);
      res.status(500).json({ message: 'Server error during find', error });
    }
  },

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const chefs = await ChefModel.find({});

      if (!chefs.length) {
        res.status(404).json({
          success: false,
          message: `No Chefs found, add some`
        });
        return;
      }

      res.json({
        success: true,
        data: chefs
      });
    } catch (error) {
      console.error('Find all chefs error:', error);
      res.status(500).json({ message: 'Server error during fetching', error });
    }
  },

  async updateChef(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, specialty, experienceYears, about } = req.body;

      if (!name && !specialty && !experienceYears && !about) {
        res.status(400).json({
          success: false,
          message: `At least one field is required`
        });
        return;
      }

      const updatedChef = await ChefModel.findByIdAndUpdate(id, {
        name, specialty, experienceYears, about
      }, { new: true });

      if (!updatedChef) {
        res.status(404).json({
          success: false,
          message: `Chef With id: ${id} Not Found`
        });
        return;
      }

      res.json({
        success: true,
        data: updatedChef
      });
    } catch (error) {
      console.error('Update chef error:', error);
      res.status(500).json({ message: 'Server error during update', error });
    }
  },

  async deleteChef(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(404).json({
          success: false,
          message: `Chef With id: ${id} Not Found`
        });
        return;
      }

      await ChefModel.findByIdAndDelete(id);

      res.json({
        success: true,
        message: `Chef with id: ${id} deleted`
      });
    } catch (error) {
      console.error('Delete chef error:', error);
      res.status(500).json({ message: 'Server error during deletion', error });
    }
  },
};

export default ChefController;
