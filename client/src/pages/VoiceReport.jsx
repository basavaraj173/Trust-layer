import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, CheckCircle2, AlertTriangle, MapPin, Tag, Gauge, FileText, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MicButton from '../components/MicButton';
import { useApp } from '../context/AppContext';

// Helper to merge two phrases with word-level overlap check to prevent duplication
function mergePhrases(phrase1, phrase2) {
  const p1 = (phrase1 || '').trim();
  const p2 = (phrase2 || '').trim();
  if (!p1) return p2;
  if (!p2) return p1;

  const words1 = p1.split(/\s+/);
  const words2 = p2.split(/\s+/);

  let maxOverlap = 0;
  const minLength = Math.min(words1.length, words2.length);

  for (let i = 1; i <= minLength; i++) {
    const slice1 = words1.slice(words1.length - i).join(' ').toLowerCase();
    const slice2 = words2.slice(0, i).join(' ').toLowerCase();
    if (slice1 === slice2) {
      maxOverlap = i;
    }
  }

  const uniquePart = words2.slice(maxOverlap).join(' ');
  return uniquePart ? `${p1} ${uniquePart}` : p1;
}

export default function VoiceReport() {
  const { language, submitComplaint, summarizeText, t } = useApp();
  const navigate = useNavigate();

  const [micState, setMicState] = useState('idle'); // idle, recording, processing
  const [transcript, setTranscript] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isProxy, setIsProxy] = useState(false);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');
  const sessionFinalTranscriptRef = useRef('');

  const startRecording = useCallback(() => {
    setError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    accumulatedTranscriptRef.current = '';
    sessionFinalTranscriptRef.current = '';
    setTranscript('');

    const startSession = () => {
      const recognition = new SpeechRecognition();
      recognition.lang = language.speechCode;
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setMicState('recording');
      };

      recognition.onresult = (event) => {
        let localFinal = '';
        let localInterim = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            localFinal = mergePhrases(localFinal, event.results[i][0].transcript);
          } else {
            localInterim = mergePhrases(localInterim, event.results[i][0].transcript);
          }
        }
        sessionFinalTranscriptRef.current = localFinal;
        const sessionTranscript = mergePhrases(localFinal, localInterim);
        setTranscript(mergePhrases(accumulatedTranscriptRef.current, sessionTranscript));
      };

      recognition.onerror = (event) => {
        console.error('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable microphone permissions.');
        } else if (event.error !== 'aborted') {
          setError('Speech recognition error. Please try again.');
        }
        setMicState(prev => prev === 'recording' ? 'idle' : prev);
      };

      recognition.onend = () => {
        accumulatedTranscriptRef.current = mergePhrases(accumulatedTranscriptRef.current, sessionFinalTranscriptRef.current);
        sessionFinalTranscriptRef.current = '';

        if (recognitionRef.current === recognition) {
          try {
            startSession();
          } catch (e) {
            setMicState('idle');
          }
        } else {
          setMicState(prev => prev === 'recording' ? 'idle' : prev);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    };

    startSession();
  }, [language]);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) {
      const activeRec = recognitionRef.current;
      recognitionRef.current = null;
      activeRec.stop();
    }
    setMicState('processing');

    try {
      const finalVal = transcript.trim();
      if (finalVal.length < 10) {
        setError('Please speak a longer complaint. At least a few sentences.');
        setMicState('idle');
        return;
      }

      const summary = await summarizeText(finalVal);
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

          <h2 className="text-2xl font-black text-slate-900 mb-2">{t('complaintSubmitted')}</h2>
          <p className="text-sm text-slate-500 mb-8">{t('saveDetailsText')}</p>

          <div className="space-y-4 mb-8">
            <div className="bg-trust-50 rounded-2xl p-4 border border-trust-100">
              <p className="text-xs font-semibold text-trust-500 uppercase tracking-wider mb-1">{t('grievanceIdLabel')}</p>
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
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">{t('secretPinLabel')}</p>
              <p className="text-2xl font-black text-amber-700 tracking-[0.3em]">{result.pin}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/track"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-trust-700 to-trust-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Shield className="w-4 h-4" />
              {t('trackMyComplaint')}
            </Link>
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-trust-600 font-medium transition-colors"
            >
              {t('backToHome')}
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
            {t('backToHome')}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
            🎤 {t('voiceReportTitle').split(' ')[0]} <span className="gradient-text">{t('voiceReportTitle').split(' ')[1] || ''}</span>
          </h1>
          <p className="text-slate-500">{t('voiceReportDesc').replace('{lang}', language.label)}</p>
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
                {t('descriptionLabel')}
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
                {t('proxyReportLabel')}
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
                {t('trackTitle').split(' ')[1]} Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('originalComplaint')}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{aiSummary.issueType}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('allSeverity').split(' ')[1] || 'Severity'}</span>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${severityColors[aiSummary.severity]}`}>
                    {aiSummary.severity?.toUpperCase()}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('locationLabel')}</span>
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
                {micState === 'processing' ? t('submitting') : t('submitComplaint')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
