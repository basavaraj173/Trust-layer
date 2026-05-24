// ============================================================
// Hash Chain Utility – Tamper-Evident Logging
// ============================================================

const crypto = require('crypto');
const Log = require('../models/Log');

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Create a SHA-256 hash from input string
 */
function createHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Append a new log entry to the hash chain for a complaint
 * @param {Object} params - Log parameters
 * @param {string} params.complaintId - MongoDB ObjectId of complaint
 * @param {string} params.grievanceId - Public grievance ID
 * @param {string} params.action - Action description
 * @param {Object} params.actionData - Data associated with the action
 * @param {string} params.actor - Who performed the action
 */
async function appendLog({ complaintId, grievanceId, action, actionData, actor = 'system' }) {
  // Get the last log entry for this complaint
  const lastLog = await Log.findOne({ complaintId }).sort({ timestamp: -1 });
  const previousHash = lastLog ? lastLog.currentHash : GENESIS_HASH;

  // Create action data string
  const actionDataString = JSON.stringify({
    action,
    data: actionData,
    actor,
    timestamp: new Date().toISOString()
  });

  // Generate current hash
  const currentHash = createHash(previousHash + actionDataString);

  // Create and save log entry
  const logEntry = new Log({
    complaintId,
    grievanceId,
    action,
    actionData: actionDataString,
    actor,
    previousHash,
    currentHash,
    timestamp: new Date()
  });

  await logEntry.save();
  return logEntry;
}

/**
 * Verify the integrity of the hash chain for a complaint
 * @param {string} complaintId - MongoDB ObjectId
 * @returns {Object} - { valid: boolean, brokenAt: number | null }
 */
async function verifyChain(complaintId) {
  const logs = await Log.find({ complaintId }).sort({ timestamp: 1 });

  if (logs.length === 0) return { valid: true, brokenAt: null, totalLogs: 0 };

  // Verify first entry
  if (logs[0].previousHash !== GENESIS_HASH) {
    return { valid: false, brokenAt: 0, totalLogs: logs.length };
  }

  // Verify chain
  for (let i = 0; i < logs.length; i++) {
    const expectedHash = createHash(logs[i].previousHash + logs[i].actionData);
    if (expectedHash !== logs[i].currentHash) {
      return { valid: false, brokenAt: i, totalLogs: logs.length };
    }

    if (i > 0 && logs[i].previousHash !== logs[i - 1].currentHash) {
      return { valid: false, brokenAt: i, totalLogs: logs.length };
    }
  }

  return { valid: true, brokenAt: null, totalLogs: logs.length };
}

/**
 * Get all logs for a complaint
 */
async function getChain(complaintId) {
  return Log.find({ complaintId }).sort({ timestamp: 1 });
}

module.exports = { appendLog, verifyChain, getChain, GENESIS_HASH, createHash };
