import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';

/**
 * MicButton – Large animated microphone button for voice recording
 * States: idle, recording, processing
 */
export default function MicButton({ state = 'idle', onClick, size = 'lg' }) {
  const sizes = {
    sm: { button: 'w-16 h-16', icon: 'w-7 h-7', ring: 'w-20 h-20' },
    md: { button: 'w-24 h-24', icon: 'w-10 h-10', ring: 'w-32 h-32' },
    lg: { button: 'w-32 h-32', icon: 'w-14 h-14', ring: 'w-44 h-44' },
  };

  const s = sizes[size] || sizes.lg;

  const colors = {
    idle: 'from-trust-600 to-trust-500',
    recording: 'from-red-500 to-red-600',
    processing: 'from-amber-500 to-amber-600',
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings (recording state) */}
      {state === 'recording' && (
        <>
          <motion.div
            className={`absolute ${s.ring} rounded-full bg-red-400/20`}
            animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className={`absolute ${s.ring} rounded-full bg-red-400/15`}
            animate={{ scale: [1, 2], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
          <motion.div
            className={`absolute ${s.ring} rounded-full bg-red-400/10`}
            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
          />
        </>
      )}

      {/* Idle glow */}
      {state === 'idle' && (
        <motion.div
          className={`absolute ${s.ring} rounded-full bg-trust-400/10`}
          animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main Button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: state === 'processing' ? 1 : 1.05 }}
        whileTap={{ scale: state === 'processing' ? 1 : 0.95 }}
        disabled={state === 'processing'}
        className={`relative ${s.button} rounded-full bg-gradient-to-br ${colors[state]} 
          shadow-xl flex items-center justify-center cursor-pointer
          transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-trust-300/50
          ${state === 'recording' ? 'mic-recording' : ''}
          ${state === 'processing' ? 'cursor-wait' : ''}
          ${state === 'idle' ? 'hover:shadow-glow-lg' : ''}`}
        id="mic-record-button"
      >
        {state === 'processing' ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className={`${s.icon} text-white`} />
          </motion.div>
        ) : state === 'recording' ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <MicOff className={`${s.icon} text-white`} />
          </motion.div>
        ) : (
          <Mic className={`${s.icon} text-white`} />
        )}
      </motion.button>

      {/* Label */}
      <motion.p
        className="absolute -bottom-8 text-sm font-medium text-slate-500 whitespace-nowrap"
        key={state}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {state === 'idle' && 'Tap to speak'}
        {state === 'recording' && 'Listening... Tap to stop'}
        {state === 'processing' && 'Processing...'}
      </motion.p>
    </div>
  );
}
