const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  usage: {
    images: { type: Number, default: 0 },
    audio: { type: Number, default: 0 },
    videos: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('User', userSchema);