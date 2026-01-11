// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const eventRoutes = require('./routes/eventRoutes'); 
// const notificationRoutes = require('./routes/notificationRoutes');
// const dotenv = require('dotenv');
// const cors = require('cors');
// require('dotenv').config();

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // Log all requests
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//   next();
// });

// // Test endpoint
// app.get('/test', (req, res) => {
//   console.log('TEST ENDPOINT HIT');
//   res.json({ message: 'Server is working!' });
// });

// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmtrade')
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log('MongoDB error:', err.message));

// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/products', require('./routes/products'));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// let isConnected = false;

// async function connectToMongoDB() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       userNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     isConnected = true;
//     console.log('Connected to MongoDB');
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//   }
// }


// // add middleware

// app.use((req, res, next) => {
//   if (!isConnected) {
//     connectToMongoDB();
//   }
//   next();
// });

// app.use('/api/events', eventRoutes);
// app.use('/api/notifications', notificationRoutes);

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // do not use app.listen() in vercel
// module.exports = app;




// vercel deployment version setup code.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
// const eventRoutes = require('./routes/eventRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB connection (serverless safe)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "FarmTrade backend is working" });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
// app.use('/api/events', eventRoutes);
// app.use('/api/notifications', notificationRoutes);

// ❌ NO app.listen()

module.exports = app;
