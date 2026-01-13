const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  pendingAmount: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'partial'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'paid',
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  saleDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
  isSynced: {
    type: Boolean,
    default: false,
  },
  offlineId: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for queries (invoiceNumber index already created by unique: true)
saleSchema.index({ customer: 1 });
saleSchema.index({ saleDate: -1 });
saleSchema.index({ cashier: 1 });

// Calculate profit virtual
saleSchema.virtual('profit').get(function() {
  return this.items.reduce((total, item) => {
    const profit = (item.sellingPrice - item.purchasePrice) * item.quantity;
    return total + profit;
  }, 0);
});

module.exports = mongoose.model('Sale', saleSchema);
