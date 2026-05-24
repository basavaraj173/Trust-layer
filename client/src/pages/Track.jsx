import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, AlertTriangle, FileText, MapPin, Tag, Gauge, Users, ThumbsUp, Camera, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusTimeline from '../components/StatusTimeline';
import { useApp } from '../context/AppContext';

export default function Track() {
  const { trackComplaint, validateComplaint } = useApp();

  const [grievanceId, setGrievanceId] = useState('');
  const [pin, setPin] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!grievanceId.trim() || !pin.trim()) {
      setError('Both Grievance ID and PIN are required');
      return;
    }

    setLoading(true);
    setError('');
    setComplaint(null);

    try {
      const data = await trackComplaint(grievanceId.trim(), pin.trim());
      setComplaint(data.complaint);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Complaint not found. Check your ID and PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!complaint) return;
    setValidating(true);
    try {
      const formData = new FormData();
      await validateComplaint(complaint.grievanceId, formData);
      setComplaint({ ...complaint, validations: (complaint.validations || 0) + 1 });
      setValidated(true);
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setValidating(false);
    }
  };

  const severityColors = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-orange-600 bg-orange-50 border-orange-200',
    low: 'text-green-600 bg-green-50 border-green-200',
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-trust-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
            🔍 Track <span className="gradient-text">Complaint</span>
          </h1>
          <p className="text-slate-500">Enter your Grievance ID and PIN to check your complaint status.</p>
        </motion.div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleTrack}
          className="glass-card p-6 mt-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Grievance ID</label>
              <input
                type="text"
                value={grievanceId}
                onChange={(e) => setGrievanceId(e.target.value.toUpperCase())}
                placeholder="TL-XXXXXX"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-trust-400 focus:ring-2 focus:ring-trust-100 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 tracking-wider transition-all"
                id="track-grievance-id"
              />
            </div>
            <div className="w-full sm:w-36">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-trust-400 focus:ring-2 focus:ring-trust-100 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 tracking-[0.3em] text-center transition-all"
                id="track-pin"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-trust-700 to-trust-500 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                id="track-submit"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Track</span>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mt-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Complaint Detail */}
        <AnimatePresence>
          {complaint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 mt-8"
            >
              {/* Summary Card */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-trust-600 bg-trust-50 px-3 py-1 rounded-lg">
                      {complaint.grievanceId}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${severityColors[complaint.aiSummary?.severity]}`}>
                      {complaint.aiSummary?.severity}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* AI Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    <Tag className="w-4 h-4 text-trust-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Issue</p>
                      <p className="text-sm font-semibold text-slate-700">{complaint.aiSummary?.issueType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    <MapPin className="w-4 h-4 text-trust-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Location</p>
                      <p className="text-sm font-semibold text-slate-700">{complaint.location || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    <Users className="w-4 h-4 text-trust-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Validations</p>
                      <p className="text-sm font-semibold text-slate-700">{complaint.validations || 0} people confirmed</p>
                    </div>
                  </div>
                </div>

                {/* Original Text */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Original Complaint</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{complaint.originalText}</p>
                </div>

                {complaint.assignedOfficer && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-violet-700 bg-violet-50 rounded-xl px-4 py-2.5 border border-violet-100">
                    <Users className="w-4 h-4" />
                    <span>Assigned to: <strong>{complaint.assignedOfficer}</strong></span>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">📍 Status Timeline</h3>
                <StatusTimeline
                  currentStatus={complaint.status}
                  statusHistory={complaint.statusHistory || []}
                />
              </div>

              {/* Admin Notes */}
              {complaint.notes && complaint.notes.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">📌 Admin Notes</h3>
                  <div className="space-y-3">
                    {complaint.notes.map((note, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-sm text-slate-600">{note.text}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {note.author} · {new Date(note.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proof Images */}
              {complaint.proofImages && complaint.proofImages.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">📸 Proof of Action</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {complaint.proofImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Proof ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                    ))}
                  </div>
                </div>
              )}

              {/* Community Validation */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">🤝 Community Validation</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <ThumbsUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-800">{complaint.validations || 0}</p>
                      <p className="text-xs text-slate-500">People confirmed this issue</p>
                    </div>
                  </div>
                  <button
                    onClick={handleValidate}
                    disabled={validating || validated}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      validated
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg'
                    } disabled:opacity-50`}
                    id="validate-complaint"
                  >
                    {validated ? '✓ Validated' : validating ? 'Validating...' : 'Confirm Issue'}
                  </button>
                </div>
              </div>


            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
