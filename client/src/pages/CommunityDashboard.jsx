import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, RefreshCw, ThumbsUp, MapPin, Tag, Clock, Eye, X, Upload, CheckCircle2, AlertTriangle, Image } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusTimeline from '../components/StatusTimeline';

export default function CommunityDashboard() {
  const { getAdminStats, getAdminComplaints, validateComplaint } = useApp();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Modal details state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validatedIds, setValidatedIds] = useState(() => {
    // Persistent validations state during session
    const saved = sessionStorage.getItem('validated_complaints');
    return saved ? JSON.parse(saved) : [];
  });
  const [validationFile, setValidationFile] = useState(null);
  const [validationFilePreview, setValidationFilePreview] = useState(null);
  const [validationSuccess, setValidationSuccess] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, complaintsData] = await Promise.all([
        getAdminStats(),
        getAdminComplaints({ status: statusFilter, severity: severityFilter, search })
      ]);
      setStats(statsData);
      setComplaints(complaintsData.complaints || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search / filter update
  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [statusFilter, severityFilter, search]);

  const handleValidate = async (grievanceId) => {
    setValidating(true);
    setValidationError('');
    setValidationSuccess('');
    try {
      const formData = new FormData();
      if (validationFile) {
        formData.append('image', validationFile);
      }

      const result = await validateComplaint(grievanceId, formData);

      // Update local state
      setComplaints(prev => prev.map(c => 
        c.grievanceId === grievanceId ? { ...c, validations: result.validations } : c
      ));

      if (selectedComplaint && selectedComplaint.grievanceId === grievanceId) {
        setSelectedComplaint(prev => ({
          ...prev,
          validations: result.validations,
          validationImages: result.validationImages || prev.validationImages
        }));
      }

      const newValidated = [...validatedIds, grievanceId];
      setValidatedIds(newValidated);
      sessionStorage.setItem('validated_complaints', JSON.stringify(newValidated));

      setValidationSuccess('Thank you! Your validation has been recorded.');
      setValidationFile(null);
      setValidationFilePreview(null);

      // Refresh list details in background
      fetchData();
    } catch (err) {
      setValidationError(err.response?.data?.error || 'Failed to submit validation. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValidationFile(file);
      setValidationFilePreview(URL.createObjectURL(file));
    }
  };

  const severityColors = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-orange-600 bg-orange-50 border-orange-200',
    low: 'text-green-600 bg-green-50 border-green-200',
  };

  const statusColors = {
    'submitted': 'text-slate-600 bg-slate-50 border-slate-200',
    'verified': 'text-blue-600 bg-blue-50 border-blue-200',
    'assigned': 'text-violet-600 bg-violet-50 border-violet-200',
    'in-progress': 'text-amber-600 bg-amber-50 border-amber-200',
    'resolved': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  };

  const statCards = stats ? [
    { label: 'Active Complaints', value: stats.total, icon: Users, color: 'from-trust-500 to-trust-600', bgColor: 'bg-trust-50' },
    { label: 'High Priority Needs', value: stats.highPriority, icon: AlertTriangle, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
    { label: 'In Progress Fixes', value: stats.inProgress + stats.assigned, icon: Clock, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50' },
    { label: 'Resolved Community Grievances', value: stats.resolved, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              🤝 Community <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Verify, confirm, and monitor local civic grievances collectively</p>
          </div>
          <div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              id="refresh-community-dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="glass-card p-5 group hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{card.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, issue category, or location..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-trust-400 focus:ring-2 focus:ring-trust-100 outline-none text-sm text-slate-700 placeholder:text-slate-400 transition-all"
                id="search-community-complaints"
              />
            </div>

            {/* Select Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-trust-400 transition-all cursor-pointer"
                id="community-filter-status"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-trust-400 transition-all cursor-pointer"
                id="community-filter-severity"
              >
                <option value="all">All Severity</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟠 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Complaints Public Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-trust-200 border-t-trust-600 rounded-full mx-auto mb-3"
                style={{ borderWidth: 3 }}
              />
              <p className="text-sm text-slate-500">Loading civic feed...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="col-span-full text-center py-16 glass-card">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">No public complaints listed</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting the filters or search keywords</p>
            </div>
          ) : (
            complaints.map((c, idx) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-5 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-trust-600 bg-trust-50 px-2 py-0.5 rounded-md">
                        {c.grievanceId}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityColors[c.aiSummary?.severity] || 'severity-medium'}`}>
                        {c.aiSummary?.severity || 'medium'}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[c.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mb-1.5 truncate group-hover:text-trust-700 transition-colors">
                    {c.aiSummary?.issueType || 'General Complaint'}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                    {c.aiSummary?.summary || c.originalText}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-300" />
                      {c.location || 'Not Specified'}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {c.validations || 0} confirmations
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      setValidationSuccess('');
                      setValidationError('');
                      setValidationFile(null);
                      setValidationFilePreview(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-trust-50 hover:bg-trust-100 text-trust-700 text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ── Public Detail Modal ── */}
        <AnimatePresence>
          {selectedComplaint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-8 max-h-[85vh]"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-800">{selectedComplaint.grievanceId}</h2>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[selectedComplaint.status]}`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  
                  {/* Summary Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Tag className="w-4 h-4 text-trust-500" />
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Category</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">{selectedComplaint.aiSummary?.issueType || 'General Complaint'}</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-4 h-4 text-trust-500" />
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Location</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">{selectedComplaint.location || 'Not Specified'}</p>
                    </div>
                  </div>

                  {/* AI summary text */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Issue Description</h4>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {selectedComplaint.aiSummary?.summary || selectedComplaint.originalText}
                      </p>
                    </div>
                  </div>

                  {/* Attached Photos */}
                  {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">🖼️ Attached Photos</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedComplaint.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Attached Photo ${idx + 1}`} className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Public timeline */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">📍 Status History</h4>
                    <StatusTimeline
                      currentStatus={selectedComplaint.status}
                      statusHistory={selectedComplaint.statusHistory || []}
                    />
                  </div>

                  {/* Proof of Resolution Images */}
                  {selectedComplaint.proofImages && selectedComplaint.proofImages.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">📸 Resolution Proof</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedComplaint.proofImages.map((img, idx) => (
                          <img key={idx} src={img} alt={`Resolution Proof ${idx + 1}`} className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other community validation images */}
                  {selectedComplaint.validationImages && selectedComplaint.validationImages.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">👥 Community Photos</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedComplaint.validationImages.map((img, idx) => (
                          <img key={idx} src={img} alt={`Community confirmation ${idx + 1}`} className="w-full h-20 object-cover rounded-xl border border-slate-200" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {selectedComplaint.notes && selectedComplaint.notes.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">📌 Official Updates</h4>
                      <div className="space-y-2">
                        {selectedComplaint.notes.map((note, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600">
                            <p className="font-semibold text-slate-700">{note.text}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{note.author} · {new Date(note.timestamp).toLocaleDateString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer / Community Validation */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <div className="flex flex-col gap-3">
                    
                    {/* Error / Success logs */}
                    {validationSuccess && (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {validationSuccess}
                      </div>
                    )}
                    {validationError && (
                      <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl text-xs font-semibold">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {validationError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-700">Confirm this issue?</p>
                        <p className="text-xs text-slate-400">Add weight to this grievance by confirming it affects your area.</p>
                      </div>

                      {validatedIds.includes(selectedComplaint.grievanceId) ? (
                        <span className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 text-sm font-bold">
                          ✓ Confirmed
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2 justify-end">
                          {/* File upload button */}
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors">
                              <Image className="w-4 h-4" />
                              {validationFile ? 'Photo Attached' : 'Add Photo'}
                            </button>
                          </div>

                          <button
                            onClick={() => handleValidate(selectedComplaint.grievanceId)}
                            disabled={validating}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold shadow-md disabled:opacity-50"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {validating ? 'Confirming...' : 'Confirm Issue'}
                          </button>
                        </div>
                      )}
                    </div>

                    {validationFilePreview && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 mt-2">
                        <img src={validationFilePreview} alt="Validation Upload Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => { setValidationFile(null); setValidationFilePreview(null); }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
