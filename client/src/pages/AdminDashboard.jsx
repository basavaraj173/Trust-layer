import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, Clock, CheckCircle2, Search, Filter, LogOut, RefreshCw, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import { useApp } from '../context/AppContext';

export default function AdminDashboard() {
  const { adminToken, adminLogout, getAdminStats, getAdminComplaints } = useApp();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [adminToken]);

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
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      const timer = setTimeout(() => fetchData(), 300);
      return () => clearTimeout(timer);
    }
  }, [statusFilter, severityFilter, search]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  const statCards = stats ? [
    { label: 'Total Complaints', value: stats.total, icon: BarChart3, color: 'from-trust-500 to-trust-600', bgColor: 'bg-trust-50' },
    { label: 'High Priority', value: stats.highPriority, icon: AlertTriangle, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
    { label: 'Pending Verification', value: stats.pendingVerification, icon: Clock, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50' },
    { label: 'Resolved Today', value: stats.resolvedToday, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50' },
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
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage and resolve citizen grievances</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              id="refresh-dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600 hover:bg-red-100 transition-all"
              id="admin-logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
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
                  <TrendingUp className="w-4 h-4 text-slate-300" />
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
                placeholder="Search by ID, issue, location..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-trust-400 focus:ring-2 focus:ring-trust-100 outline-none text-sm text-slate-700 placeholder:text-slate-400 transition-all"
                id="search-complaints"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-trust-400 transition-all cursor-pointer"
                id="filter-status"
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
                id="filter-severity"
              >
                <option value="all">All Severity</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟠 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Complaints List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-trust-200 border-t-trust-600 rounded-full mx-auto mb-3"
                style={{ borderWidth: 3 }}
              />
              <p className="text-sm text-slate-500">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">No complaints found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            complaints.map((complaint, idx) => (
              <ComplaintCard key={complaint._id} complaint={complaint} index={idx} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
