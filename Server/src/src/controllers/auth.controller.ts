import { Request, Response } from 'express';
import { LoginRequest, RegisterRequest } from '../types';
import UserModel from '../models/User';
import bcrypt from 'bcryptjs';
import { AuthRequest, generateAccessToken } from '../middleware/auth';

const validatePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name }: RegisterRequest = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ message: 'Missing Fields' });
        return;
      }

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        email,
        password: hashedPassword,
        name,
      });

      await user.save();

      const token = generateAccessToken({ userId: user._id, email: user.email });

      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          userId: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const isValid = await validatePassword(password, user.password);
      if (!isValid) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const token = generateAccessToken({ userId: user.id, email: user.email });

      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        message: 'Login successful',
        user: {
          userId: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  },

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await UserModel.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({
        user: {
          userId: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('GetMe error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error during logout' });
    }
  },

  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await UserModel.find();

      const safeUsers = users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      res.json({
        message: `Found ${safeUsers.length} users`,
        users: safeUsers,
        total: safeUsers.length,
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Server error while fetching users' });
    }
  },

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (id === String(req.user!.userId)) {
        res.status(400).json({ message: 'Cannot delete your own account using this endpoint' });
        return;
      }

      const user = await UserModel.findById(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const deleted = await UserModel.findByIdAndDelete(id);

      if (deleted) {
        res.json({
          message: 'User deleted successfully',
          deletedUser: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error while deleting user' });
    }
  },
};

export default AuthController;
