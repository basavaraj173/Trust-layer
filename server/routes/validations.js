// ============================================================
// Validations Routes – Community Validation
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Complaint = require('../models/Complaint');
const { appendLog } = require('../utils/hashChain');
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

// ── Multer for validation image uploads ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.VERCEL ? require('os').tmpdir() : path.join(__dirname, '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `validation-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ──────────────────────────────────────────────────────────
// POST /api/validations/:grievanceId – Validate/upvote a complaint
// ──────────────────────────────────────────────────────────
router.post('/:grievanceId', upload.single('image'), async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      grievanceId: req.params.grievanceId.toUpperCase()
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Increment validation count
    complaint.validations += 1;

    // Add validation image if provided
    if (req.file) {
      const url = await uploadFileToCloudinary(req.file, 'trustlayer/validations');
      complaint.validationImages.push(url);
    }

    await complaint.save();

    // Log the validation
    await appendLog({
      complaintId: complaint._id,
      grievanceId: complaint.grievanceId,
      action: 'COMMUNITY_VALIDATION',
      actionData: {
        validationCount: complaint.validations,
        hasImage: !!req.file
      },
      actor: 'community'
    });

    res.json({
      success: true,
      validations: complaint.validations,
      message: 'Thank you for validating this complaint'
    });
  } catch (err) {
    console.error('Error validating complaint:', err);
    res.status(500).json({ error: 'Failed to validate complaint' });
  }
});

// ──────────────────────────────────────────────────────────
// GET /api/validations/:grievanceId – Get validation info
// ──────────────────────────────────────────────────────────
router.get('/:grievanceId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      grievanceId: req.params.grievanceId.toUpperCase()
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({
      success: true,
      validations: complaint.validations,
      validationImages: complaint.validationImages
    });
  } catch (err) {
    console.error('Error fetching validations:', err);
    res.status(500).json({ error: 'Failed to fetch validations' });
  }
});

module.exports = router;
