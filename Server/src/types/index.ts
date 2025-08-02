import { Types } from 'mongoose';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface Recipe {
  id: string;
  title: string;
  chef: string;           // מזהה של שף
  description: string;    // תיאור / הוראות הכנה
  publishedYear: number;
  categories: string[];   // במקום genres
  createdAt: Date;
  userId: string;         // מי הוסיף את המתכון
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthPayload {
  userId: Types.ObjectId;
  email: string;
}

export interface CreateRecipeRequest {
  title: string;
  chef: string;
  description: string;     // חובה ביצירה
  publishedYear: number;
  categories: string[];
}

export interface UpdateRecipeRequest {
  title?: string;
  chef?: string;
  description?: string;    // אופציונלי בעדכון
  publishedYear?: number;
  categories?: string[];
}
