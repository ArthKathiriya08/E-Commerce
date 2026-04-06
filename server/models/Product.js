/**
 * Product Schema — Mongoose Model
 * Luxury fashion products for ATELIER
 */

const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['Outerwear', 'Dresses', 'Tailoring', 'Knitwear', 'Accessories', 'Leather Goods', 'Fine Jewelry'],
    default: 'Outerwear'
  },
  sizes: [{
    type: String
  }],
  colors: [colorSchema],
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isLimited: {
    type: Boolean,
    default: false
  },
  specifications: {
    fabric: String,
    lining: String,
    closure: String,
    madeIn: String
  },
  care: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round((1 - this.price / this.originalPrice) * 100);
  }
  return 0;
});

// Index for search
productSchema.index({ name: 'text', category: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);