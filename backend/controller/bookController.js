const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');
const User = require('../models/User');
const File = require('../models/File');
const { cloudinary } = require('../config/cloudinary');

let drive;

try {
  let auth;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/drive']
    );
  } else if (fs.existsSync(path.join(__dirname, '../service-account-key.json'))) {
    const serviceAccount = require('../service-account-key.json');
    auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/drive']
    );
  } else {
    console.error('No service account credentials found. Please provide them either as a file named "service-account-key.json" or as an environment variable GOOGLE_SERVICE_ACCOUNT_JSON');
  }
  drive = google.drive({ version: 'v3', auth });
  console.log('Google Drive API initialized in bookController');
} catch (error) {
  console.error('Error initializing Google Drive API in bookController:', error);
}
// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    let query = {};

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by price (free or paid)
    if (req.query.free === 'true') {
      query.isFree = true;
    } else if (req.query.free === 'false') {
      query.isFree = false;
    }

    // Search by title or author
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { author: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const books = await Book.find(query)
      .populate('createdBy', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      count: books.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('reviews.user', 'name');

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin/Instructor
exports.createBook = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin/Instructor
exports.updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Make sure user is book creator or admin
    if (book.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this book'
      });
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin/Instructor
exports.deleteBook = async (req, res, next) => {
  try {
    console.log('deleteBook called with id:', req.params.id);
    const book = await Book.findById(req.params.id);
    console.log('Book found:', book);

    if (!book) {
      console.error('Book not found');
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Make sure user is book creator or admin
    if (book.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      console.error('Not authorized to delete this book');
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this book'
      });
    }

    // Find all associated files (cover image and book file)
    const files = await File.find({
      'relatedTo.model': 'Book',
      'relatedTo.id': book._id
    });
    console.log('Associated files found:', files.length);

    // Delete files from storage and database
    for (const file of files) {
      try {
        console.log('Processing file:', file._id, 'URL:', file.fileUrl);

        // Handle Cloudinary files (cover images)
        if (file.fileUrl && file.fileUrl.includes('cloudinary')) {
          try {
            // Use the fileId which contains the Cloudinary public_id
            const publicId = file.fileId;

            await cloudinary.uploader.destroy(publicId);
            console.log('Deleted file from Cloudinary:', publicId);
          } catch (cloudinaryErr) {
            console.error(`Cloudinary API error deleting file ${file._id}:`, cloudinaryErr);
          }
        }

        // Handle Google Drive files
        if (file.fileUrl && !file.fileUrl.includes('cloudinary') && file.fileId) {
          try {
            await drive.files.delete({ fileId: file.fileId });
            console.log('Deleted file from Google Drive:', file.fileId);
          } catch (driveErr) {
            console.error(`Google Drive API error deleting file ${file._id}:`, driveErr);
          }
        }

        // Delete file document from database
        await File.findByIdAndDelete(file._id);
        console.log('Deleted file document from database:', file._id);
      } catch (err) {
        console.error(`Error processing file ${file._id}:`, err);
        // Continue with other files even if one fails
      }
    }

    console.log('All associated files processed');

    // Finally, delete the book
    await book.deleteOne();
    console.log('Book deleted');

    // Remove the book ID from all users' purchasedBooks arrays
    try {
      console.log('Removing book from users purchasedBooks');
      await User.updateMany(
        { purchasedBooks: book._id },
        { $pull: { purchasedBooks: book._id } }
      );
      console.log('Removed book from users purchasedBooks');
    } catch (err) {
      console.error('Error removing book from users purchasedBooks:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to remove book from user enrollments'
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Book and all associated files deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteBook:', error);
    next(error);
  }
};

// @desc    Enroll a book
// @route   POST /api/books/:id/enroll
// @access  Private
exports.addBookToUser = async (req, res, next) => {
  try {
    // Only allow the owner or an admin to update the profile
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }

    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a bookId'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if bookId already exists in purchasedBooks
    if (user.purchasedBooks.includes(bookId)) {
      return res.status(400).json({
        success: false,
        error: 'Book already added to user'
      });
    }

    user.purchasedBooks.push(bookId);
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Purchase/enroll a book for the logged-in user
 * @route   POST /api/books/:id/purchase
 * @access  Private
 */
exports.purchaseBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if book is already purchased/enrolled
    if (user.purchasedBooks.includes(bookId)) {
      return res.status(400).json({
        success: false,
        error: 'Book already purchased/enrolled'
      });
    }

    user.purchasedBooks.push(bookId);
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for book
// @route   POST /api/books/:id/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a rating between 1 and 5'
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Check if user has already left a review
    const alreadyReviewed = book.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this book'
      });
    }

    // Add review
    const review = {
      user: req.user.id,
      rating: Number(rating),
      text
    };

    book.reviews.push(review);

    // Calculate average rating
    book.rating = book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length;

    await book.save();

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};
