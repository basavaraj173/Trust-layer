import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, MapPin, FileText, CheckCircle2, Copy, Shield, AlertTriangle, X, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function TextReport() {
  const { submitComplaint, language, t } = useApp();

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isProxy, setIsProxy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
    URL.revokeObjectURL(previews[idx]);
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe your complaint');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('type', 'text');
      formData.append('originalText', description.trim());
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      formData.append('isProxy', isProxy);
      formData.append('language', language.code);
      images.forEach(img => formData.append('images', img));

      const data = await submitComplaint(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <button onClick={() => copyToClipboard(result.grievanceId)} className="p-1.5 rounded-lg hover:bg-trust-100 transition-colors">
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
            <Link to="/track" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-trust-700 to-trust-500 text-white font-semibold shadow-md">
              <Shield className="w-4 h-4" /> {t('trackMyComplaint')}
            </Link>
            <Link to="/" className="text-sm text-slate-500 hover:text-trust-600 font-medium">{t('backToHome')}</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-trust-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t('backToHome')}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
            📝 {t('textReportTitle').split(' ')[0]} <span className="gradient-text">{t('textReportTitle').split(' ')[1] || ''}</span>
          </h1>
          <p className="text-slate-500">{t('textReportDesc')}</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 sm:p-8 mt-8 space-y-6"
        >
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <FileText className="w-4 h-4 text-trust-600" /> {t('descriptionLabel')} *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-trust-400 focus:ring-2 focus:ring-trust-100 outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none transition-all"
              id="complaint-description"
            />
            <p className="text-xs text-slate-400 mt-1">{description.length} characters</p>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <MapPin className="w-4 h-4 text-trust-600" /> {t('locationLabel')}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('locationPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-trust-400 focus:ring-2 focus:ring-trust-100 outline-none text-sm text-slate-700 placeholder:text-slate-400 transition-all"
              id="complaint-location"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Image className="w-4 h-4 text-trust-600" /> {t('uploadImagesLabel')}
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-trust-300 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="image-upload"
              />
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">{t('dragImagesText')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('maxImagesLimit')}</p>
            </div>

            {/* Image Previews */}
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={src} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proxy toggle */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-trust-700 to-trust-500 text-white font-semibold text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            id="submit-text-complaint"
          >
            {loading ? t('submitting') : t('submitComplaint')}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
