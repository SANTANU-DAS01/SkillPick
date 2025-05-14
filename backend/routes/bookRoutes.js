const express = require('express');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  addBookToUser,
  addReview,
  purchaseBook
} = require('../controller/bookController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getBooks)
  .post(protect, authorize('admin', 'instructor'), createBook);

router
  .route('/:id')
  .get(getBook)
  .put(protect, authorize('admin', 'instructor'), updateBook)
  .delete(protect, authorize('admin', 'instructor'), deleteBook);

router.post('/:id/addBookToUser', protect, addBookToUser);
router.post('/:id/reviews', protect, addReview);
router.post('/:id/purchase', protect, purchaseBook);

module.exports = router;
