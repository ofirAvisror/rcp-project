import mongoose, { Document, Schema } from 'mongoose';
import Recipe from './Recipe';  // ייבוא מודל Recipe

interface IChef extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
bio?: string;  
  birthYear: number;
  createdAt: Date;
  updatedAt: Date;

  log: () => void;
}

const chefSchema = new Schema<IChef>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: '',  // או אפשרות להיות undefined
    },
    birthYear: {
      type: Number,
      
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// הגדרת וירטואל ל־recipes
chefSchema.virtual('recipes', {
  ref: "Recipe",
  localField: "_id",
  foreignField: "chef",
});

// Middleware להרצה לפני מחיקת שף - מחיקת כל המתכונים של השף
chefSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await Recipe.deleteMany({ chef: doc._id });
  }
  next();
});

// הוספת מתודה אינסטנסית
chefSchema.methods.log = function () {
  console.log(`[INSTANCE LOG] ${this._id}`);
};

const Chef = mongoose.model<IChef>("Chef", chefSchema);
export default Chef;
