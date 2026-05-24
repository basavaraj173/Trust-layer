import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, UserPlus, RefreshCw, Upload, MessageSquarePlus,
  Tag, MapPin, Gauge, Users, FileText, Mic, Image, AlertTriangle, Loader2
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusTimeline from '../components/StatusTimeline';
import { useApp } from '../context/AppContext';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    adminToken, getComplaintDetail, verifyComplaint,
    assignOfficer, updateStatus, addNote, uploadProof
  } = useApp();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Action form states
  const [officerName, setOfficerName] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    fetchDetail();
  }, [id, adminToken]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const result = await getComplaintDetail(id);
      setData(result);
    } catch (err) {
      setError('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleVerify = async () => {
    setActionLoading('verify');
    try {
      await verifyComplaint(id);
      await fetchDetail();
      showSuccessMessage('Complaint verified successfully');
    } catch (err) {
      setError('Failed to verify');
    } finally {
      setActionLoading('');
    }
  };

  const handleAssign = async () => {
    if (!officerName.trim()) return;
    setActionLoading('assign');
    try {
      await assignOfficer(id, officerName.trim());
      await fetchDetail();
      setOfficerName('');
      setShowAssign(false);
      showSuccessMessage(`Assigned to ${officerName}`);
    } catch (err) {
      setError('Failed to assign');
    } finally {
      setActionLoading('');
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setActionLoading('status');
    try {
      await updateStatus(id, newStatus, statusNote);
      await fetchDetail();
      setNewStatus('');
      setStatusNote('');
      setShowStatus(false);
      showSuccessMessage('Status updated');
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setActionLoading('');
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setActionLoading('note');
    try {
      await addNote(id, noteText.trim());
      await fetchDetail();
      setNoteText('');
      setShowNote(false);
      showSuccessMessage('Note added');
    } catch (err) {
      setError('Failed to add note');
    } finally {
      setActionLoading('');
    }
  };

  const handleProofUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setActionLoading('proof');
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('proofImages', f));
      await uploadProof(id, formData);
      await fetchDetail();
      showSuccessMessage('Proof uploaded');
    } catch (err) {
      setError('Failed to upload proof');
    } finally {
      setActionLoading('');
    }
  };

  const severityColors = {
    high: 'severity-high',
    medium: 'severity-medium',
    low: 'severity-low',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-8 h-8 text-trust-600" />
        </motion.div>
      </div>
    );
  }

  if (!data || !data.complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Complaint not found</p>
          <Link to="/admin/dashboard" className="text-trust-600 font-medium">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { complaint, logs, chainVerification } = data;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-trust-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">{complaint.grievanceId}</h1>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${severityColors[complaint.aiSummary?.severity]}`}>
                {complaint.aiSummary?.severity}
              </span>
              <span className="text-xs text-slate-400">
                {complaint.type === 'voice' ? '🎤 Voice' : '📝 Text'}
              </span>
            </div>
            <button onClick={fetchDetail} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm mb-4">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              <AlertTriangle className="w-4 h-4" /> {error}
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-trust-600" /> AI Summary
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1"><Tag className="w-3.5 h-3.5 text-slate-400" /><span className="text-[10px] text-slate-400 font-semibold uppercase">Issue</span></div>
                  <p className="text-sm font-semibold text-slate-700">{complaint.aiSummary?.issueType}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1"><Gauge className="w-3.5 h-3.5 text-slate-400" /><span className="text-[10px] text-slate-400 font-semibold uppercase">Severity</span></div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${severityColors[complaint.aiSummary?.severity]}`}>
                    {complaint.aiSummary?.severity?.toUpperCase()}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /><span className="text-[10px] text-slate-400 font-semibold uppercase">Location</span></div>
                  <p className="text-sm font-semibold text-slate-700">{complaint.location || 'N/A'}</p>
                </div>
              </div>

              {/* AI Summary Text */}
              {complaint.aiSummary?.summary && (
                <div className="bg-trust-50/50 rounded-xl p-4 border border-trust-100 mb-4">
                  <p className="text-xs font-semibold text-trust-600 uppercase tracking-wider mb-2">
                    🤖 AI Summary Text
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed font-semibold">{complaint.aiSummary.summary}</p>
                </div>
              )}

              {/* Original Text */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {complaint.type === 'voice' ? '🎤 Voice Transcript' : '📝 Original Text'}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">{complaint.originalText}</p>
              </div>

              {/* Validations & Officer */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl border border-emerald-100">
                  <Users className="w-4 h-4" />
                  {complaint.validations || 0} Validations
                </div>
                {complaint.assignedOfficer && (
                  <div className="flex items-center gap-2 text-sm bg-violet-50 text-violet-700 px-3 py-2 rounded-xl border border-violet-100">
                    <UserPlus className="w-4 h-4" />
                    {complaint.assignedOfficer}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Images */}
            {(complaint.images?.length > 0 || complaint.proofImages?.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Image className="w-4 h-4 text-trust-600" /> Images
                </h3>
                {complaint.images?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Complaint Images</p>
                    <div className="grid grid-cols-3 gap-3">
                      {complaint.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`Complaint ${idx + 1}`} className="w-full h-28 object-cover rounded-xl border border-slate-200" />
                      ))}
                    </div>
                  </div>
                )}
                {complaint.proofImages?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Proof Images</p>
                    <div className="grid grid-cols-3 gap-3">
                      {complaint.proofImages.map((img, idx) => (
                        <img key={idx} src={img} alt={`Proof ${idx + 1}`} className="w-full h-28 object-cover rounded-xl border border-slate-200" />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Notes */}
            {complaint.notes?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">📌 Notes</h3>
                <div className="space-y-2">
                  {complaint.notes.map((note, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-sm text-slate-600">{note.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{note.author} · {new Date(note.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}


          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">📍 Status</h3>
              <StatusTimeline currentStatus={complaint.status} statusHistory={complaint.statusHistory || []} />
            </motion.div>

            {/* Admin Actions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">⚡ Actions</h3>
              <div className="space-y-3">
                {/* Verify */}
                {complaint.status === 'submitted' && (
                  <button
                    onClick={handleVerify}
                    disabled={actionLoading === 'verify'}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-medium text-sm hover:bg-blue-100 transition-all disabled:opacity-50"
                    id="btn-verify"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {actionLoading === 'verify' ? 'Verifying...' : 'Verify Complaint'}
                  </button>
                )}

                {/* Assign Officer */}
                <div>
                  <button
                    onClick={() => setShowAssign(!showAssign)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 font-medium text-sm hover:bg-violet-100 transition-all"
                    id="btn-assign-toggle"
                  >
                    <UserPlus className="w-5 h-5" />
                    Assign Officer
                  </button>
                  <AnimatePresence>
                    {showAssign && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-2 flex gap-2">
                          <input
                            value={officerName}
                            onChange={(e) => setOfficerName(e.target.value)}
                            placeholder="Officer name"
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-trust-400"
                            id="input-officer-name"
                          />
                          <button onClick={handleAssign} disabled={actionLoading === 'assign'}
                            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium disabled:opacity-50">
                            {actionLoading === 'assign' ? '...' : 'Assign'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Update Status */}
                <div>
                  <button
                    onClick={() => setShowStatus(!showStatus)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-medium text-sm hover:bg-amber-100 transition-all"
                    id="btn-status-toggle"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Update Status
                  </button>
                  <AnimatePresence>
                    {showStatus && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-2 space-y-2">
                          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-trust-400 cursor-pointer"
                            id="select-new-status"
                          >
                            <option value="">Select status...</option>
                            <option value="verified">Verified</option>
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                          <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Optional note" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-trust-400" />
                          <button onClick={handleStatusUpdate} disabled={actionLoading === 'status'}
                            className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium disabled:opacity-50">
                            {actionLoading === 'status' ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Upload Proof */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProofUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    id="input-proof-upload"
                  />
                  <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition-all cursor-pointer">
                    <Upload className="w-5 h-5" />
                    {actionLoading === 'proof' ? 'Uploading...' : 'Upload Proof Image'}
                  </div>
                </div>

                {/* Add Note */}
                <div>
                  <button
                    onClick={() => setShowNote(!showNote)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-100 transition-all"
                    id="btn-note-toggle"
                  >
                    <MessageSquarePlus className="w-5 h-5" />
                    Add Note
                  </button>
                  <AnimatePresence>
                    {showNote && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-2 space-y-2">
                          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Enter your note..." rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-trust-400 resize-none"
                            id="input-note-text"
                          />
                          <button onClick={handleAddNote} disabled={actionLoading === 'note'}
                            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium disabled:opacity-50">
                            {actionLoading === 'note' ? 'Adding...' : 'Add Note'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
