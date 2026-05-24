// ============================================================
// Complaints Routes – Public API
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Complaint = require('../models/Complaint');
const { appendLog } = require('../utils/hashChain');
const { generateSummary, isSpam } = require('../utils/aiSummary');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadFileToCloudinary(file, folder) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      throw new Error('Cloudinary credentials not configured');
    }
    const result = await cloudinary.uploader.upload(file.path, { folder });
    try { fs.unlinkSync(file.path); } catch (e) {}
    return result.secure_url;
  } catch (err) {
    console.warn(`⚠️ Cloudinary upload failed (falling back to base64 Data URI): ${err.message}`);
    const fileData = fs.readFileSync(file.path);
    const base64 = fileData.toString('base64');
    try { fs.unlinkSync(file.path); } catch (e) {}
    return `data:${file.mimetype};base64,${base64}`;
  }
}

// ── Multer config for image uploads ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.VERCEL ? require('os').tmpdir() : path.join(__dirname, '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `complaint-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

/**
 * Generate a unique grievance ID
 * Format: TL-XXXXXX (6 random alphanumeric chars)
 */
function generateGrievanceId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'TL-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Generate a 4-digit PIN
 */
function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ──────────────────────────────────────────────────────────
// POST /api/complaints – Create a new complaint
// ──────────────────────────────────────────────────────────
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { type, originalText, description, location, isProxy, language } = req.body;
    const text = originalText || description || '';

    // Spam check
    if (isSpam(text)) {
      return res.status(400).json({
        error: 'Your complaint appears too short or invalid. Please provide more details.'
      });
    }

    // Generate AI summary
    const aiSummary = generateSummary(text);

    // Override location if user provided one
    if (location && location.trim()) {
      aiSummary.location = location.trim();
    }

    // Generate unique IDs
    let grievanceId = generateGrievanceId();
    // Ensure uniqueness
    while (await Complaint.findOne({ grievanceId })) {
      grievanceId = generateGrievanceId();
    }
    const pin = generatePin();

    // Collect uploaded image paths using Cloudinary
    const images = req.files && req.files.length > 0
      ? await Promise.all(req.files.map(f => uploadFileToCloudinary(f, 'trustlayer/complaints')))
      : [];

    // Create complaint
    const complaint = new Complaint({
      grievanceId,
      pin,
      type: type || 'text',
      originalText: text,
      description: description || text,
      aiSummary,
      location: aiSummary.location,
      images,
      isProxy: isProxy === 'true' || isProxy === true,
      language: language || 'en'
    });

    await complaint.save();

    // Create initial hash chain log
    await appendLog({
      complaintId: complaint._id,
      grievanceId,
      action: 'COMPLAINT_SUBMITTED',
      actionData: {
        type: complaint.type,
        issueType: aiSummary.issueType,
        severity: aiSummary.severity,
        location: aiSummary.location
      },
      actor: 'citizen'
    });

    res.status(201).json({
      success: true,
      grievanceId,
      pin,
      aiSummary,
      message: 'Complaint submitted successfully'
    });
  } catch (err) {
    console.error('Error creating complaint:', err);
    const errorMsg = err.name === 'MongooseServerSelectionError' 
      ? 'Database connection failed. Please ensure MongoDB is running locally.'
      : 'Failed to submit complaint. Please try again.';
    res.status(500).json({ error: errorMsg });
  }
});

// ──────────────────────────────────────────────────────────
// POST /api/complaints/track – Track a complaint by ID + PIN
// ──────────────────────────────────────────────────────────
router.post('/track', async (req, res) => {
  try {
    const { grievanceId, pin } = req.body;

    if (!grievanceId || !pin) {
      return res.status(400).json({ error: 'Grievance ID and PIN are required' });
    }

    const complaint = await Complaint.findOne({
      grievanceId: grievanceId.toUpperCase(),
      pin
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found. Check your ID and PIN.' });
    }

    // Get logs for this complaint
    const Log = require('../models/Log');
    const logs = await Log.find({ complaintId: complaint._id }).sort({ timestamp: 1 });

    res.json({
      success: true,
      complaint: {
        grievanceId: complaint.grievanceId,
        type: complaint.type,
        originalText: complaint.originalText,
        aiSummary: complaint.aiSummary,
        status: complaint.status,
        statusHistory: complaint.statusHistory,
        location: complaint.location,
        images: complaint.images,
        proofImages: complaint.proofImages,
        notes: complaint.notes,
        validations: complaint.validations,
        assignedOfficer: complaint.assignedOfficer,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt
      },
      logs
    });
  } catch (err) {
    console.error('Error tracking complaint:', err);
    const errorMsg = err.name === 'MongooseServerSelectionError' 
      ? 'Database connection failed. Please ensure MongoDB is running locally.'
      : 'Failed to track complaint. Please try again.';
    res.status(500).json({ error: errorMsg });
  }
});

// ──────────────────────────────────────────────────────────
// GET /api/complaints/public/:grievanceId – Public view (limited info)
// ──────────────────────────────────────────────────────────
router.get('/public/:grievanceId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      grievanceId: req.params.grievanceId.toUpperCase()
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({
      success: true,
      complaint: {
        grievanceId: complaint.grievanceId,
        aiSummary: complaint.aiSummary,
        status: complaint.status,
        location: complaint.location,
        validations: complaint.validations,
        createdAt: complaint.createdAt
      }
    });
  } catch (err) {
    console.error('Error fetching complaint:', err);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// ──────────────────────────────────────────────────────────
// POST /api/complaints/summarize – AI summarize text
// ──────────────────────────────────────────────────────────
router.post('/summarize', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const summary = generateSummary(text);
  res.json({ success: true, summary });
});

module.exports = router;
