import mongoose, { Document, Schema } from 'mongoose';
import Recipe from './Recipe';  // ייבוא מודל Recipe

interface IChef extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  bio: string;
  birthYear: number;
  createdAt: Date;
  updatedAt: Date;

  log: () => void;
}

const chefSchema = new Schema<IChef>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  bio: String,
  birthYear: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

chefSchema.virtual('recipes', {
  ref: "Recipe",
  localField: "_id",
  foreignField: "chef",
});

chefSchema.pre(/delete/i, async function (this: any, next) {
  const docId = this.getQuery()._id;
  await Recipe.deleteMany({ chef: docId });
  next();
});

chefSchema.methods.log = function () {
  console.log(`[INSTANCE LOG] ${this._id}`);
};

const Chef = mongoose.model<IChef>("Chef", chefSchema);
export default Chef;
