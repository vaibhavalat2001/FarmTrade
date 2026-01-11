const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  profileImage: { type: String },
  bio: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
