const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Address = require('../models/Address');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, mobile, email, password, userType, farmerId } = req.body;
    
    let user = await User.findOne({ mobile });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, mobile, email, password: hashedPassword, userType, farmerId });
    await user.save();

    await UserProfile.create({ userId: user._id });
    await Cart.create({ userId: user._id, items: [] });
    await Wishlist.create({ userId: user._id, items: [] });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, mobile: user.mobile, userType: user.userType, farmerId: user.farmerId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const profile = await UserProfile.findOne({ userId: user._id });
    const cart = await Cart.findOne({ userId: user._id });
    const wishlist = await Wishlist.findOne({ userId: user._id });
    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    const addresses = await Address.find({ userId: user._id });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        mobile: user.mobile, 
        userType: user.userType, 
        farmerId: user.farmerId,
        profileImage: profile?.profileImage,
        address: addresses.find(a => a.isDefault)?.flat || '',
        cart: cart?.items || [],
        wishlist: wishlist?.items || [],
        orders: orders || []
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-password', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    res.json({ message: 'Password verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update-profile', auth, async (req, res) => {
  try {
    const { mobile, address, profileImage } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (mobile) user.mobile = mobile;
    await user.save();

    if (profileImage !== undefined) {
      await UserProfile.findOneAndUpdate(
        { userId: user._id },
        { profileImage, updatedAt: Date.now() },
        { upsert: true }
      );
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: { 
        id: user.id, 
        name: user.name, 
        mobile: user.mobile, 
        address,
        profileImage,
        userType: user.userType, 
        farmerId: user.farmerId 
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/delete-account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    await UserProfile.deleteOne({ userId: req.user.id });
    await Cart.deleteOne({ userId: req.user.id });
    await Wishlist.deleteOne({ userId: req.user.id });
    await Order.deleteMany({ userId: req.user.id });
    await Address.deleteMany({ userId: req.user.id });
    
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/cart', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.json({ cart: cart?.items || [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/cart', auth, async (req, res) => {
  try {
    const { cart } = req.body;
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: cart, updatedAt: Date.now() },
      { upsert: true }
    );
    res.json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/wishlist', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    res.json({ wishlist: wishlist?.items || [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/wishlist', auth, async (req, res) => {
  try {
    const { wishlist } = req.body;
    await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { items: wishlist, updatedAt: Date.now() },
      { upsert: true }
    );
    res.json({ message: 'Wishlist updated', wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders: orders || [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/orders', auth, async (req, res) => {
  try {
    const { order } = req.body;
    const newOrder = await Order.create({
      userId: req.user.id,
      orderId: order.id.toString(),
      items: order.items,
      total: order.total,
      address: order.address,
      payment: order.payment,
      status: order.status
    });
    res.json({ message: 'Order placed', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/orders', auth, async (req, res) => {
  try {
    const { orders } = req.body;
    for (const order of orders) {
      await Order.findOneAndUpdate(
        { userId: req.user.id, orderId: order.id.toString() },
        { status: order.status },
        { upsert: true }
      );
    }
    res.json({ message: 'Orders updated', orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/addresses', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id });
    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/addresses', auth, async (req, res) => {
  try {
    const address = await Address.create({ userId: req.user.id, ...req.body });
    res.json({ message: 'Address added', address });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
