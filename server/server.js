/**
 * ATELIER — Express Server Entry Point
 * Luxury Fashion E-Commerce Backend
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root directory
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);

// Serve HTML pages for client-side routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'home_page_ethos_couture.html'));
});

app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'shop_product_listing_ethos_couture.html'));
});

app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'product_details_ethos_couture.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'shopping_cart_ethos_couture.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ATELIER server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});

module.exports = app;