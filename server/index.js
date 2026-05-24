// ============================================================
// TrustLayer Backend – Express Server
// ============================================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const complaintsRouter = require('./routes/complaints');
const adminRouter = require('./routes/admin');
const validationsRouter = require('./routes/validations');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

let isDbConnected = false;
let dbError = null;

// Middleware to check database connection status
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(MONGODB_URI);
        isDbConnected = true;
        dbError = null;
      } catch (err) {
        dbError = err.message;
        return res.status(503).json({
          error: `Database is not connected. Please ensure MongoDB is running and configured correctly. Error: ${err.message}`
        });
      }
    } else {
      isDbConnected = true;
      dbError = null;
    }
  }
  next();
});

// Serve uploaded files
const uploadsDir = process.env.VERCEL ? require('os').tmpdir() : path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Warning: Could not create uploads directory:', err.message);
}
app.use('/uploads', express.static(uploadsDir));

// ── Routes ─────────────────────────────────────────────────
app.use('/api/complaints', complaintsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/validations', validationsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    isDbConnected,
    dbReadyState: mongoose.connection.readyState,
    dbError,
    timestamp: new Date().toISOString()
  });
});

// ── MongoDB Connection ─────────────────────────────────────
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlayer';
if (MONGODB_URI.includes('<db_password>') || MONGODB_URI.includes('<password>')) {
  console.warn('⚠️ Warning: MONGODB_URI contains a password placeholder. Falling back to localhost MongoDB...');
  MONGODB_URI = 'mongodb://localhost:27017/trustlayer';
}

if (process.env.VERCEL) {
  // On Vercel (serverless), just connect to MongoDB; do not listen on a port
  mongoose.connect(MONGODB_URI)
    .then(() => {
      isDbConnected = true;
      console.log('✅ Connected to MongoDB (Serverless)');
    })
    .catch((err) => {
      dbError = err.message;
      console.error('❌ MongoDB connection error (Serverless):', err.message);
    });
} else {
  // Local/persistent server setup
  mongoose.connect(MONGODB_URI)
    .then(() => {
      isDbConnected = true;
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`🚀 TrustLayer API running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      dbError = err.message;
      console.error('❌ MongoDB connection error:', err.message);
      console.log('⚠️  Starting server without MongoDB...');
      app.listen(PORT, () => {
        console.log(`🚀 TrustLayer API running on http://localhost:${PORT} (no DB)`);
      });
    });
}

module.exports = app;
