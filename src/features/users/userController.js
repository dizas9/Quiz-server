const User = require('./userModel');

/**
 * Controller to get the authenticated user's profile.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getUserProfile = (req, res) => {
  res.json({
    message: "You have accessed a protected route!",
    user: req.user,
  });
};

/**
 * Controller to get all users.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({
      message: "Successfully fetched all users!",
      users: users,
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

module.exports = {
  getUserProfile,
  getAllUsers,
};