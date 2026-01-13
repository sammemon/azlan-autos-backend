const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sale', 'purchase'],
    required: true,
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type',
  },
  relatedParty: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'partyType',
  },
  partyType: {
    type: String,
    enum: ['Customer', 'Supplier'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque'],
    required: true,
  },
  transactionId: {
    type: String,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isSynced: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
paymentSchema.index({ reference: 1 });
paymentSchema.index({ relatedParty: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
