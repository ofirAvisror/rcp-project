import mongoose, { Document, Schema } from 'mongoose';

// ✅ Define the Recipe interface (includes imageUrl now)
export interface IRecipe extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  chef: mongoose.Types.ObjectId;         // The chef who created the recipe
  publishedYear: number;
  categories: string[];                  // Categories instead of genres
  description?: string;                  // Optional
  ingredients: string[];                 // List of ingredients
  imageUrl?: string;                     // ✅ New field for recipe image
  addedBy: mongoose.Types.ObjectId;      // User who added the recipe
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define the schema
const recipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef', required: true },
    publishedYear: { type: Number, required: true },
    categories: { type: [String], default: [] },
    description: { type: String },
    ingredients: { type: [String], default: [] },
    imageUrl: { type: String }, // ✅ matches interface
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
  }
);

// ✅ Pre-save middleware for logging
recipeSchema.pre('save', function (this: IRecipe, next) {
  console.log(`[PRE-SAVE] Recipe about to be saved: ${this._id}`);
  next();
});

// ✅ Create the model
const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema);
export default Recipe;
