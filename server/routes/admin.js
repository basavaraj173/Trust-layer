// ============================================================
// Admin Routes – Dashboard & Complaint Management
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Complaint = require('../models/Complaint');
const Log = require('../models/Log');
const { appendLog, verifyChain, getChain } = require('../utils/hashChain');
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

// ── Multer for proof image uploads ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.VERCEL ? require('os').tmpdir() : path.join(__dirname, '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `proof-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ──────────────────────────────────────────────────────────
// POST /api/admin/login – Simple admin authentication
// ──────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === adminUser && password === adminPass) {
    res.json({
      success: true,
      token: 'trustlayer-admin-token-' + Date.now(),
      message: 'Login successful'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ──────────────────────────────────────────────────────────
// GET /api/admin/stats – Dashboard statistics
// ──────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const highPriority = await Complaint.countDocuments({ 'aiSummary.severity': 'high' });
    const pendingVerification = await Complaint.countDocuments({ status: 'submitted' });

    // Resolved today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const resolvedToday = await Complaint.countDocuments({
      status: 'resolved',
      updatedAt: { $gte: startOfDay }
    });

    const inProgress = await Complaint.countDocuments({ status: 'in-progress' });
    const assigned = await Complaint.countDocuments({ status: 'assigned' });
    const verified = await Complaint.countDocuments({ status: 'verified' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });

    res.json({
      success: true,
      stats: {
        total,
        highPriority,
        pendingVerification,
        resolvedToday,
        inProgress,
        assigned,
        verified,
        resolved
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ──────────────────────────────────────────────────────────
// GET /api/admin/complaints – List all complaints
// ──────────────────────────────────────────────────────────
router.get('/complaints', async (req, res) => {
  try {
    const { status, severity, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (severity && severity !== 'all') filter['aiSummary.severity'] = severity;
    if (search) {
      filter.$or = [
        { grievanceId: { $regex: search, $options: 'i' } },
        { 'aiSummary.issueType': { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { originalText: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      complaints,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// ──────────────────────────────────────────────────────────
// GET /api/admin/complaints/:id – Single complaint detail
// ──────────────────────────────────────────────────────────
router.get('/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const logs = await getChain(complaint._id);
    const chainVerification = await verifyChain(complaint._id);

    res.json({
      success: true,
      complaint,
      logs,
      chainVerification
    });
  } catch (err) {
    console.error('Error fetching complaint:', err);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// ──────────────────────────────────────────────────────────
// PUT /api/admin/complaints/:id/verify – Verify a complaint
// ──────────────────────────────────────────────────────────
router.put('/complaints/:id/verify', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.status = 'verified';
    complaint.statusHistory.push({
      status: 'verified',
      timestamp: new Date(),
      note: 'Complaint verified by admin'
    });
    await complaint.save();

    await appendLog({
      complaintId: complaint._id,
      grievanceId: complaint.grievanceId,
      action: 'COMPLAINT_VERIFIED',
      actionData: { status: 'verified', verifiedBy: 'admin' },
      actor: 'admin'
    });

    res.json({ success: true, complaint });
  } catch (err) {
    console.error('Error verifying complaint:', err);
    res.status(500).json({ error: 'Failed to verify complaint' });
  }
});

// ──────────────────────────────────────────────────────────
// PUT /api/admin/complaints/:id/assign – Assign an officer
// ──────────────────────────────────────────────────────────
router.put('/complaints/:id/assign', async (req, res) => {
  try {
    const { officer } = req.body;
    if (!officer) return res.status(400).json({ error: 'Officer name is required' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.assignedOfficer = officer;
    complaint.status = 'assigned';
    complaint.statusHistory.push({
      status: 'assigned',
      timestamp: new Date(),
      note: `Assigned to ${officer}`
    });
    await complaint.save();

    await appendLog({
      complaintId: complaint._id,
      grievanceId: complaint.grievanceId,
      action: 'OFFICER_ASSIGNED',
      actionData: { officer, status: 'assigned' },
      actor: 'admin'
    });

    res.json({ success: true, complaint });
  } catch (err) {
    console.error('Error assigning officer:', err);
    res.status(500).json({ error: 'Failed to assign officer' });
  }
});

// ──────────────────────────────────────────────────────────
// PUT /api/admin/complaints/:id/status – Update status
// ──────────────────────────────────────────────────────────
router.put('/complaints/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['submitted', 'verified', 'assigned', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`
    });
    await complaint.save();

    await appendLog({
      complaintId: complaint._id,
      grievanceId: complaint.grievanceId,
      action: 'STATUS_UPDATED',
      actionData: { previousStatus: complaint.status, newStatus: status, note },
      actor: 'admin'
    });

    res.json({ success: true, complaint });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ──────────────────────────────────────────────────────────
// PUT /api/admin/complaints/:id/proof – Upload proof image
// ──────────────────────────────────────────────────────────
router.put('/complaints/:id/proof', upload.array('proofImages', 5), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const newImages = req.files && req.files.length > 0
      ? await Promise.all(req.files.map(f => uploadFileToCloudinary(f, 'trustlayer/proofs')))
      : [];
    complaint.proofImages.push(...newImages);
    await complaint.save();

    await appendLog({
      complaintId: complaint._id,
      grievanceId: complaint.grievanceId,
      action: 'PROOF_UPLOADED',
      actionData: { imagesCount: newImages.length, images: newImages },
      actor: 'admin'
    });

    res.json({ success: true, complaint });
  } catch (err) {
    console.error('Error uploading proof:', err);
    res.status(500).json({ error: 'Failed to upload proof' });
  }
});

// ──────────────────────────────────────────────────────────
// PUT /api/admin/complaints/:id/note – Add a note
// ──────────────────────────────────────────────────────────
router.put('/complaints/:id/note', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Note text is required' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.notes.push({ text, timestamp: new Date(), author: 'Admin' });
    await complaint.save();

    await appendLog({
      complaintId: complaint._id,
      grievanceId: complaint.grievanceId,
      action: 'NOTE_ADDED',
      actionData: { note: text },
      actor: 'admin'
    });

    res.json({ success: true, complaint });
  } catch (err) {
    console.error('Error adding note:', err);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

module.exports = router;
