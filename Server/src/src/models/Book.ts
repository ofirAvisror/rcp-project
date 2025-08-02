import mongoose, { Document, Schema } from 'mongoose';

interface IBook extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  author: mongoose.Types.ObjectId;
  publishedYear: number;
  genres: string[];
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true, // ✅ תיקון
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: true, // ✅ תיקון
    },
    publishedYear: Number,
    genres: [String],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // ✅ תיקון
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.pre('save', function (this: IBook, next) {
  console.log(`[PRE-SAVE] Document about to be saved: ${this._id}`);
  next();
});

const Book = mongoose.model<IBook>('Book', bookSchema);
export default Book;
