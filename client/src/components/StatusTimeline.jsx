import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, UserCheck, Loader, CheckCircle2 } from 'lucide-react';

const STATUSES = [
  { key: 'submitted', label: 'Submitted', icon: Clock, color: 'bg-slate-400' },
  { key: 'verified', label: 'Verified', icon: Check, color: 'bg-blue-500' },
  { key: 'assigned', label: 'Assigned', icon: UserCheck, color: 'bg-violet-500' },
  { key: 'in-progress', label: 'In Progress', icon: Loader, color: 'bg-amber-500' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'bg-emerald-500' },
];

/**
 * StatusTimeline – Vertical timeline showing complaint progress
 */
export default function StatusTimeline({ currentStatus, statusHistory = [] }) {
  const currentIdx = STATUSES.findIndex(s => s.key === currentStatus);

  // Map history to get timestamps
  const getTimestamp = (statusKey) => {
    const entry = statusHistory.find(h => h.status === statusKey);
    return entry ? new Date(entry.timestamp).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : null;
  };

  const getNote = (statusKey) => {
    const entry = statusHistory.find(h => h.status === statusKey);
    return entry?.note || null;
  };

  return (
    <div className="relative">
      {STATUSES.map((status, idx) => {
        const Icon = status.icon;
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        const timestamp = getTimestamp(status.key);
        const note = getNote(status.key);

        return (
          <motion.div
            key={status.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {/* Connector Line */}
            {idx < STATUSES.length - 1 && (
              <div className="absolute left-[1.125rem] top-10 bottom-0 w-0.5">
                <div
                  className={`h-full transition-colors duration-500 ${
                    isCompleted && idx < currentIdx
                      ? 'bg-gradient-to-b from-trust-400 to-trust-300'
                      : 'bg-slate-200'
                  }`}
                />
              </div>
            )}

            {/* Status Dot */}
            <div className="relative flex-shrink-0">
              <motion.div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? `${status.color} shadow-md`
                    : 'bg-slate-100 border-2 border-slate-200'
                }`}
                animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
              </motion.div>
              {isCurrent && (
                <motion.div
                  className={`absolute inset-0 rounded-full ${status.color} opacity-20`}
                  animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-semibold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {status.label}
                </h4>
                {isCurrent && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-trust-100 text-trust-700 rounded-full">
                    Current
                  </span>
                )}
              </div>
              {timestamp && (
                <p className="text-xs text-slate-400 mt-0.5">{timestamp}</p>
              )}
              {note && isCompleted && (
                <p className="text-xs text-slate-500 mt-1 bg-slate-50 rounded-lg px-3 py-1.5 inline-block">
                  {note}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
