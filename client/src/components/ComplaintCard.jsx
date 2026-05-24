import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, AlertTriangle, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ComplaintCard – Card display for admin complaint list
 */
export default function ComplaintCard({ complaint, index = 0 }) {
  const navigate = useNavigate();

  const severityStyles = {
    high: 'severity-high',
    medium: 'severity-medium',
    low: 'severity-low',
  };

  const statusStyles = {
    'submitted': 'status-submitted',
    'verified': 'status-verified',
    'assigned': 'status-assigned',
    'in-progress': 'status-in-progress',
    'resolved': 'status-resolved',
  };

  const statusLabels = {
    'submitted': 'Submitted',
    'verified': 'Verified',
    'assigned': 'Assigned',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="glass-card p-4 sm:p-5 hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/admin/complaints/${complaint._id}`)}
      id={`complaint-card-${complaint.grievanceId}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Left: ID + Issue */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-trust-600 bg-trust-50 px-2 py-0.5 rounded-md">
              {complaint.grievanceId}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${severityStyles[complaint.aiSummary?.severity] || 'severity-medium'}`}>
              {complaint.aiSummary?.severity || 'medium'}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 truncate group-hover:text-trust-700 transition-colors">
            {complaint.aiSummary?.issueType || 'General Complaint'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {complaint.aiSummary?.summary || complaint.originalText?.substring(0, 80)}
          </p>
        </div>

        {/* Right: Meta info */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 flex-shrink-0">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${statusStyles[complaint.status]}`}>
            {statusLabels[complaint.status] || complaint.status}
          </span>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {complaint.location?.split(',')[0] || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {complaint.validations || 0}
            </span>
          </div>
        </div>

        {/* View button */}
        <div className="hidden sm:flex">
          <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-trust-50 flex items-center justify-center transition-colors">
            <Eye className="w-4 h-4 text-slate-400 group-hover:text-trust-600 transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
