import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp, Hash } from 'lucide-react';

/**
 * LogViewer – Displays tamper-evident hash chain logs
 */
export default function LogViewer({ logs = [], chainVerification }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);

  const displayLogs = expanded ? logs : logs.slice(0, 3);

  const formatAction = (action) => {
    const map = {
      'COMPLAINT_SUBMITTED': '📝 Complaint Submitted',
      'COMPLAINT_VERIFIED': '✅ Verified by Admin',
      'OFFICER_ASSIGNED': '👤 Officer Assigned',
      'STATUS_UPDATED': '🔄 Status Updated',
      'PROOF_UPLOADED': '📸 Proof Uploaded',
      'NOTE_ADDED': '📌 Note Added',
      'COMMUNITY_VALIDATION': '🤝 Community Validated',
    };
    return map[action] || action;
  };

  const parseActionData = (dataStr) => {
    try {
      return JSON.parse(dataStr);
    } catch {
      return { raw: dataStr };
    }
  };

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-trust-600" />
          <h3 className="text-sm font-bold text-slate-800">Tamper-Evident Log Chain</h3>
        </div>
        {chainVerification && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            chainVerification.valid
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {chainVerification.valid ? (
              <><ShieldCheck className="w-3.5 h-3.5" /> Chain Verified</>
            ) : (
              <><ShieldAlert className="w-3.5 h-3.5" /> Chain Broken</>
            )}
          </div>
        )}
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No logs recorded yet</p>
        ) : (
          <>
            {displayLogs.map((log, idx) => {
              const data = parseActionData(log.actionData);
              const isExpanded = expandedLog === idx;

              return (
                <motion.div
                  key={log._id || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border border-slate-100 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedLog(isExpanded ? null : idx)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-trust-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-trust-600">#{idx + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {formatAction(log.action)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString('en-IN')} · {log.actor}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 space-y-2 border-t border-slate-50">
                          {/* Action Data */}
                          {data.data && (
                            <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">Action Data</p>
                              <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                                {JSON.stringify(data.data, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Hashes */}
                          <div className="grid grid-cols-1 gap-1.5">
                            <div className="flex items-start gap-2">
                              <Hash className="w-3 h-3 text-slate-300 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Previous Hash</p>
                                <p className="hash-text">{log.previousHash}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Hash className="w-3 h-3 text-trust-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-trust-500 font-semibold">Current Hash</p>
                                <p className="hash-text text-trust-600">{log.currentHash}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {logs.length > 3 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-center text-sm font-medium text-trust-600 hover:text-trust-700 py-2 transition-colors"
              >
                {expanded ? 'Show less' : `Show all ${logs.length} entries`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
