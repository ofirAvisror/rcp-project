import express from 'express';
import BookController from '../controllers/book.controller';
import { authenticateToken } from '../middleware/auth';
// import { validateRegisterInput, validateLoginInput } from '../middleware/validation';
import { validateBookOwner } from '../middleware/book.mid';
const router = express.Router();

// Authentication routes
router.post('/', authenticateToken, BookController.create);
router.get('/all', BookController.getAllBooks)
router.patch("/:id", authenticateToken, BookController.updateBook);

router.delete('/:id', authenticateToken, validateBookOwner, BookController.deleteBook)

export default router; 