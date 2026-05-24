import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, CheckCircle2, AlertTriangle, MapPin, Tag, Gauge, FileText, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MicButton from '../components/MicButton';
import { useApp } from '../context/AppContext';

export default function VoiceReport() {
  const { language, submitComplaint, summarizeText } = useApp();
  const navigate = useNavigate();

  const [micState, setMicState] = useState('idle'); // idle, recording, processing
  const [transcript, setTranscript] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isProxy, setIsProxy] = useState(false);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef(null);

  const startRecording = useCallback(() => {
    setError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language.speechCode;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setMicState('recording');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please enable microphone permissions.');
      } else if (event.error !== 'aborted') {
        setError('Speech recognition error. Please try again.');
      }
      setMicState('idle');
    };

    recognition.onend = () => {
      // Chrome stops automatically after a pause. Restart it if still in 'recording' state
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          setMicState('idle');
        }
      } else {
        setMicState('idle');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, micState]);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setMicState('processing');

    try {
      if (transcript.trim().length < 10) {
        setError('Please speak a longer complaint. At least a few sentences.');
        setMicState('idle');
        return;
      }

      const summary = await summarizeText(transcript);
      setAiSummary(summary);
      setMicState('idle');
    } catch (err) {
      setError('Failed to process your speech. Please try again.');
      setMicState('idle');
    }
  }, [transcript, summarizeText]);

  const handleMicClick = () => {
    if (micState === 'idle') {
      setTranscript('');
      setAiSummary(null);
      setResult(null);
      startRecording();
    } else if (micState === 'recording') {
      stopRecording();
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) return;
    setMicState('processing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('type', 'voice');
      formData.append('originalText', transcript.trim());
      formData.append('description', transcript.trim());
      formData.append('location', aiSummary?.location || '');
      formData.append('isProxy', isProxy);
      formData.append('language', language.code);

      const data = await submitComplaint(formData);
      setResult(data);
      setMicState('idle');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint. Please try again.');
      setMicState('idle');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityColors = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-orange-600 bg-orange-50 border-orange-200',
    low: 'text-green-600 bg-green-50 border-green-200',
  };

  // ── Success Screen ──
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 sm:p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">Complaint Submitted!</h2>
          <p className="text-sm text-slate-500 mb-8">Save these details to track your complaint:</p>

          <div className="space-y-4 mb-8">
            <div className="bg-trust-50 rounded-2xl p-4 border border-trust-100">
              <p className="text-xs font-semibold text-trust-500 uppercase tracking-wider mb-1">Grievance ID</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-black text-trust-700 tracking-wider">{result.grievanceId}</p>
                <button
                  onClick={() => copyToClipboard(result.grievanceId)}
                  className="p-1.5 rounded-lg hover:bg-trust-100 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-trust-400" />}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">Secret PIN</p>
              <p className="text-2xl font-black text-amber-700 tracking-[0.3em]">{result.pin}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/track"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-trust-700 to-trust-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Shield className="w-4 h-4" />
              Track My Complaint
            </Link>
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-trust-600 font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-trust-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
            🎤 Voice <span className="gradient-text">Report</span>
          </h1>
          <p className="text-slate-500">Speak your complaint in {language.label}. Our AI will structure it for you.</p>
        </motion.div>

        {/* Mic Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 sm:p-12 mt-8 flex flex-col items-center"
        >
          <div className="mb-12">
            <MicButton state={micState} onClick={handleMicClick} size="lg" />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4 w-full"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript */}
          {transcript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full mt-4"
            >
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Your Speech (Transcript)
              </label>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">{transcript}</p>
              </div>
            </motion.div>
          )}

          {/* Proxy toggle */}
          <div className="w-full mt-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isProxy}
                onChange={(e) => setIsProxy(e.target.checked)}
                className="w-5 h-5 rounded-md border-2 border-slate-300 text-trust-600 focus:ring-trust-500 cursor-pointer"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                I am reporting on behalf of someone else (proxy report)
              </span>
            </label>
          </div>
        </motion.div>

        {/* AI Summary */}
        <AnimatePresence>
          {aiSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card p-6 mt-6"
            >
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-trust-600" />
                AI Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Issue Type</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{aiSummary.issueType}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Severity</span>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${severityColors[aiSummary.severity]}`}>
                    {aiSummary.severity?.toUpperCase()}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{aiSummary.location}</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={micState === 'processing'}
                className="w-full mt-6 px-6 py-3.5 rounded-xl bg-gradient-to-r from-trust-700 to-trust-500 text-white font-semibold text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                id="submit-voice-complaint"
              >
                {micState === 'processing' ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
