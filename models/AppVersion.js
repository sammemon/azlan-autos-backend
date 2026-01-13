const mongoose = require('mongoose');

const appVersionSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    unique: true,
  },
  platform: {
    type: String,
    enum: ['android', 'windows'],
    required: true,
  },
  buildNumber: {
    type: Number,
    required: true,
  },
  downloadUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: String,
  },
  releaseNotes: {
    type: String,
  },
  isMandatory: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  releaseDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index
appVersionSchema.index({ platform: 1, version: -1 });

module.exports = mongoose.model('AppVersion', appVersionSchema);
