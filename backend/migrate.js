const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const UserProfile = require('./models/UserProfile');
const Address = require('./models/Address');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');
const Order = require('./models/Order');

async function migrateData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmtrade');
    console.log('Connected to MongoDB');

    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      console.log(`Migrating user: ${user.name}`);

      // Create UserProfile
      if (user.profileImage || user.address) {
        await UserProfile.findOneAndUpdate(
          { userId: user._id },
          { userId: user._id, profileImage: user.profileImage },
          { upsert: true }
        );
      }

      // Create Cart
      if (user.cart && user.cart.length > 0) {
        await Cart.findOneAndUpdate(
          { userId: user._id },
          { userId: user._id, items: user.cart },
          { upsert: true }
        );
      } else {
        await Cart.findOneAndUpdate(
          { userId: user._id },
          { userId: user._id, items: [] },
          { upsert: true }
        );
      }

      // Create Wishlist
      if (user.wishlist && user.wishlist.length > 0) {
        await Wishlist.findOneAndUpdate(
          { userId: user._id },
          { userId: user._id, items: user.wishlist },
          { upsert: true }
        );
      } else {
        await Wishlist.findOneAndUpdate(
          { userId: user._id },
          { userId: user._id, items: [] },
          { upsert: true }
        );
      }

      // Create Orders
      if (user.orders && user.orders.length > 0) {
        for (const order of user.orders) {
          await Order.findOneAndUpdate(
            { userId: user._id, orderId: order.id.toString() },
            {
              userId: user._id,
              orderId: order.id.toString(),
              items: order.items,
              total: order.total,
              address: order.address,
              payment: order.payment,
              status: order.status,
              createdAt: order.date ? new Date(order.date) : new Date()
            },
            { upsert: true }
          );
        }
      }

      // Remove old fields from user
      await mongoose.connection.db.collection('users').updateOne(
        { _id: user._id },
        { $unset: { cart: '', wishlist: '', orders: '', address: '', profileImage: '' } }
      );

      console.log(`✓ Migrated user: ${user.name}`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrateData();
