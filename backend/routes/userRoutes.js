
const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, updateProfile, getUserBooks, changePassword } = require('../controller/userController.js');

const { protect, authorize } = require('../middleware/auth.js');

// GET /api/users - Get all users with pagination (Admin only)
router.get('/', protect, authorize('admin'), getUsers);

// GET /api/users/:id - Get single user
router.get('/:id', protect, getUser);

// GET /api/users/:id/books - Get books purchased by user
router.get('/:id/books', protect, getUserBooks);

// PUT /api/users/:id - Update user profile (admin or owner)
router.put('/:id', protect, updateUser);

// PUT /api/users/:id/profile - Update user profile details (owner only)
router.put('/:id/profile', protect, updateProfile);

// PUT /api/users/:id/password - Change user password
router.put('/:id/password', protect, changePassword);

module.exports = router;
