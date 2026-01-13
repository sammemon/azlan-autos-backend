const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  totalPurchases: {
    type: Number,
    default: 0,
  },
  totalPayments: {
    type: Number,
    default: 0,
  },
  pendingBalance: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for search
customerSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
