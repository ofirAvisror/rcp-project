import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import BookModel from '../models/Book';
import Author from '../models/Author';
import User from '../models/User';

const BookController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, author, publishedYear, genres } = req.body;

      let bookAuthor;

      // בדיקה אם author הוא ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(author)) {
        bookAuthor = await Author.findById(author);
      }

      // אם לא נמצא לפי ID – ננסה לפי שם
      if (!bookAuthor) {
        bookAuthor = await Author.findOne({ name: author });

        // אם לא קיים בכלל – ניצור חדש
        if (!bookAuthor) {
          bookAuthor = await Author.create({ name: author });
        }
      }

      // בדיקת המשתמש המחובר
      const user = await User.findById(req.user?.userId);
      if (!user) {
        res.status(400).json({ success: false, message: "User not found" });
        return;
      }

      // יצירת ספר חדש
      const newBook = await BookModel.create({
        title,
        author: bookAuthor._id,
        publishedYear,
        genres,
        addedBy: user._id,
      });

      const populatedBook = await BookModel.findById(newBook._id)
        .populate('author', 'name')
        .populate('addedBy', 'name');

      res.status(201).json({
        success: true,
        data: populatedBook,
      });
    } catch (error) {
      console.error('Create book error:', error);
      res.status(500).json({
        message: 'Server error during book creation',
        error,
      });
    }
  },

  async getAllBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await BookModel.find()
        .populate('author', 'name')
        .populate('addedBy', 'name');

      res.status(200).json({
        success: true,
        data: books, // ✅ כך זה יתאים לקוד שלך ב־BooksPage
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({
        message: 'Server error during fetching books',
        error,
      });
    }
  },

  async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(404).json({
          success: false,
          message: `Book with id: ${id} not found`,
        });
        return;
      }

      await BookModel.findOneAndDelete({ _id: id });

      res.json({
        success: true,
        message: `Book with id: ${id} deleted.`,
      });
    } catch (error) {
      console.error('Delete book error:', error);
      res.status(500).json({
        message: 'Server error during deletion',
        error,
      });
    }
  },
  async updateBook(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, author, publishedYear, genres } = req.body;

    const existingBook = await BookModel.findById(id);
    if (!existingBook) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    const bookAuthor = await Author.findById(author);
    if (!bookAuthor) {
      res.status(400).json({ message: "Invalid author ID" });
      return;
    }

    existingBook.title = title;
    existingBook.author = bookAuthor._id;
    existingBook.publishedYear = publishedYear;
    existingBook.genres = genres;

    await existingBook.save();

    const updated = await BookModel.findById(id)
      .populate("author", "name")
      .populate("addedBy", "name");

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ message: "Server error during update", error });
  }
}

};

export default BookController;
