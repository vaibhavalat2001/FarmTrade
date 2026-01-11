const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

router.get('/create-indexes', async (req, res) => {
  try {
    await Product.collection.createIndex({ name: 1, createdAt: -1 });
    res.json({ message: 'Indexes created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating indexes', error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().limit(100);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, category, price, quantity, location, farmerName, image } = req.body;
    
    const product = new Product({
      name,
      category,
      price,
      quantity,
      location,
      farmerName,
      image,
      userId: req.user.id
    });

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
