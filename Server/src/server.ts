import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import reviewRoutes from "./routes/reviewRoutes";
// Configs
import connectDB from './config/db'

// Routes Imports
import authRoutes from './routes/auth';
import chefRoutes from './routes/Chef';        // תיקנתי מ-authorRoutes ל-chefRoutes
import recipeRoutes from './routes/Recipe';    // תיקנתי מ-bookRoutes ל-recipeRoutes


import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

connectDB()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('tiny'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chefs', chefRoutes);           // נתיב מתוקן ל-chefs
app.use('/api/recipes', recipeRoutes);        // נתיב מתוקן ל-recipes
app.use('/api/recipes',reviewRoutes)
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
