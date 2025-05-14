const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await User.countDocuments();

    const users = await User.find()
      .skip(startIndex)
      .limit(limit)
      .select('-password') // exclude password field

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        pages: totalPages
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Only allow the owner or an admin to view the profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this user'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    // Only allow the owner or an admin to update the profile
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }

    // Remove fields that shouldn't be updated directly
    const { password, role, ...updateData } = req.body;

    // Only admin can update roles
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    // Check if user is the owner or admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this user'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/users/:id/password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    // Only allow the owner to change their password
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to change this password'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get books purchased by user
// @route   GET /api/users/:id/books
// @access  Private
exports.getUserBooks = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { page = 1, limit = 9, category, search, sort } = req.query;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Build query for books purchased by user
    let query = { _id: { $in: user.purchasedBooks } };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default recent
    if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'author') {
      sortOption = { author: 1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    }

    const skip = (page - 1) * limit;

    const books = await require('../models/Book').find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOption)
      .exec();

    const total = await require('../models/Book').countDocuments(query);

    res.status(200).json({
      success: true,
      count: books.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      data: books
    });
  } catch (error) {
    next(error);
  }
};

// Add this after your other exports
exports.updateProfile = async (req, res, next) => {
  try {
    // Only allow the owner to update their profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this profile'
      });
    }

    // Remove sensitive fields that shouldn't be updated via profile update
    const { password, role, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};