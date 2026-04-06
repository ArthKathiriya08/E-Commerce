/**
 * Orders API Routes
 * POST /api/orders - Create new order
 * GET /api/orders - Get user orders
 * GET /api/orders/:id - Get single order
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, optionalAuth } = require('../middleware/auth');

/**
 * @route   POST /api/orders
 * @desc     Create a new order
 * @access   Public (guest) or Private (authenticated)
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      discountCode,
      notes,
      paymentMethod
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Validate product exists
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      const orderItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity || 1,
        size: item.size || 'One Size',
        color: item.color || 'Default',
        image: product.images[0] || ''
      };

      orderItems.push(orderItem);
      subtotal += product.price * orderItem.quantity;
    }

    // Calculate shipping (free over $5000)
    const shipping = subtotal >= 5000 ? 0 : 35;

    // Calculate discount (placeholder - would need a Discount model)
    let discount = 0;

    // Calculate total
    const total = subtotal + shipping - discount;

    // Create order
    const order = new Order({
      userId: req.user ? req.user._id : null,
      items: orderItems,
      subtotal,
      shipping,
      discount,
      discountCode: discountCode || null,
      total,
      shippingAddress: shippingAddress || null,
      billingAddress: billingAddress || null,
      notes: notes || null,
      paymentMethod: paymentMethod || 'card',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        total: order.total,
        status: order.status,
        items: order.items,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/orders
 * @desc     Get all orders for current user
 * @access   Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc     Get single order by ID
 * @access   Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.userId && order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc     Update order status (admin only)
 * @access   Private/Admin
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/orders/:id/cancel
 * @desc     Cancel an order
 * @access   Private
 */
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check ownership
    if (order.userId && order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that has been shipped or delivered'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/orders/guest/:id
 * @desc     Get guest order by ID (public, no auth)
 * @access   Public
 */
router.get('/guest/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow access to guest orders (no userId)
    if (order.userId) {
      return res.status(403).json({
        success: false,
        message: 'Please login to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;