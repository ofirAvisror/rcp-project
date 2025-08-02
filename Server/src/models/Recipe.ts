import mongoose, { Document, Schema } from 'mongoose';

interface IRecipe extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  chef: mongoose.Types.ObjectId;         // מחבר המתכון (Chef)
  publishedYear: number;
  categories: string[];                   // במקום genres
  description: string;                    // הוראות הכנה / תיאור
  addedBy: mongoose.Types.ObjectId;      // המשתמש שהוסיף את המתכון
  createdAt: Date;
  updatedAt: Date;
}

const recipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef', required: true },
    publishedYear: Number,
    categories: [String],
    description: { type: String,  },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

recipeSchema.pre('save', function (this: IRecipe, next) {
  console.log(`[PRE-SAVE] Recipe about to be saved: ${this._id}`);
  next();
});

const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema);
export default Recipe;
