// ============================================================
// Complaint Model – MongoDB Schema
// ============================================================

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  author: { type: String, default: 'Admin' }
});

const complaintSchema = new mongoose.Schema({
  // Unique anonymous identifiers
  grievanceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  pin: {
    type: String,
    required: true
  },

  // Complaint type
  type: {
    type: String,
    enum: ['voice', 'text'],
    required: true
  },

  // Content
  originalText: { type: String, default: '' },
  description: { type: String, default: '' },

  // AI-generated summary
  aiSummary: {
    issueType: { type: String, default: 'General Complaint' },
    severity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    location: { type: String, default: 'Not specified' },
    summary: { type: String, default: '' },
    officerAction: { type: String, default: '' }
  },

  // User-provided location
  location: { type: String, default: '' },

  // Uploaded images (stored as file paths)
  images: [{ type: String }],

  // Status tracking
  status: {
    type: String,
    enum: ['submitted', 'verified', 'assigned', 'in-progress', 'resolved'],
    default: 'submitted'
  },

  // Admin fields
  assignedOfficer: { type: String, default: '' },
  proofImages: [{ type: String }],
  notes: [noteSchema],

  // Community validation
  validations: { type: Number, default: 0 },
  validationImages: [{ type: String }],

  // Proxy reporting
  isProxy: { type: Boolean, default: false },

  // Status history for timeline
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],

  // Language of original complaint
  language: { type: String, default: 'en' }

}, {
  timestamps: true
});

// Pre-save: push initial status to history
complaintSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: 'submitted',
      timestamp: new Date(),
      note: 'Complaint submitted'
    });
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
