# FarmTrade Backend

## Tech Stack
- Node.js + Express.js
- MongoDB
- JWT Authentication
- REST API

## Setup Instructions

1. Install MongoDB locally or use MongoDB Atlas
2. Install dependencies:
   ```
   npm install
   ```

3. Update `.env` file with your MongoDB URI and JWT secret

4. Start the server:
   ```
   npm start
   ```
   Or for development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Products
- GET `/api/products` - Get all products
- POST `/api/products` - Create product (requires auth)

## Default Port
Server runs on http://localhost:5000
