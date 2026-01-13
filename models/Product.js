const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  description: {
    type: String,
    trim: true,
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0,
  },
  unit: {
    type: String,
    enum: ['pcs', 'kg', 'liter', 'box', 'set'],
    default: 'pcs',
  },
  image: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  lastRestocked: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for search
productSchema.index({ name: 'text', sku: 'text', barcode: 'text' });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  return this.sellingPrice - this.purchasePrice;
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStockLevel;
});

module.exports = mongoose.model('Product', productSchema);
