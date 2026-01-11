const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  farmerName: { type: String, required: true },
  image: { type: String, default: 'https://via.placeholder.com/400x300' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

ProductSchema.index({ name: 1, createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
