const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Expense category is required'],
    enum: ['rent', 'utilities', 'salaries', 'supplies', 'maintenance', 'transportation', 'marketing', 'other'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'card'],
    default: 'cash',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
  },
  isSynced: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for date queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
