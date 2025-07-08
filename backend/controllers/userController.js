const User = require('../models/User');

// Get current user profile with detailed usage stats
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure usage object exists with all fields
    const userWithDefaults = {
      ...user._doc,
      usage: {
        images: user.usage?.images || 0,
        audio: user.usage?.audio || 0,
        videos: user.usage?.videos || 0
      }
    };

    res.json(userWithDefaults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};