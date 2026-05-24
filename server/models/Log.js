// ============================================================
// Log Model – Tamper-Evident Hash Chain
// ============================================================

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  // Reference to complaint
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  grievanceId: {
    type: String,
    required: true,
    index: true
  },

  // Action details
  action: {
    type: String,
    required: true
  },
  actionData: {
    type: String,
    required: true
  },
  actor: {
    type: String,
    default: 'system'
  },

  // Hash chain fields
  previousHash: {
    type: String,
    required: true
  },
  currentHash: {
    type: String,
    required: true
  },

  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Log', logSchema);
