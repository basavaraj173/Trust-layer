import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { translations } from '../utils/translations';

const AppContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const LANGUAGES = [
  { code: 'en', label: 'English', speechCode: 'en-IN' },
  { code: 'hi', label: 'हिंदी', speechCode: 'hi-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ta', label: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', label: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'mr', label: 'मराठी', speechCode: 'mr-IN' },
  { code: 'bn', label: 'বাংলা', speechCode: 'bn-IN' },
];

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('trustlayer_admin_token'));
  const [loading, setLoading] = useState(false);

  const t = useCallback((key) => {
    const langCode = language?.code || 'en';
    const langDict = translations[langCode] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  }, [language]);

  // ── API Methods ──
  const submitComplaint = useCallback(async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/complaints`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackComplaint = useCallback(async (grievanceId, pin) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/complaints/track`, { grievanceId, pin });
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const summarizeText = useCallback(async (text) => {
    const res = await axios.post(`${API_BASE}/complaints/summarize`, { text });
    return res.data.summary;
  }, []);

  const adminLogin = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/login`, { username, password });
      if (res.data.token) {
        setAdminToken(res.data.token);
        localStorage.setItem('trustlayer_admin_token', res.data.token);
      }
      return res.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const adminLogout = useCallback(() => {
    setAdminToken(null);
    localStorage.removeItem('trustlayer_admin_token');
  }, []);

  const getAdminStats = useCallback(async () => {
    const res = await axios.get(`${API_BASE}/admin/stats`);
    return res.data.stats;
  }, []);

  const getAdminComplaints = useCallback(async (params = {}) => {
    const res = await axios.get(`${API_BASE}/admin/complaints`, { params });
    return res.data;
  }, []);

  const getComplaintDetail = useCallback(async (id) => {
    const res = await axios.get(`${API_BASE}/admin/complaints/${id}`);
    return res.data;
  }, []);

  const verifyComplaint = useCallback(async (id) => {
    const res = await axios.put(`${API_BASE}/admin/complaints/${id}/verify`);
    return res.data;
  }, []);

  const assignOfficer = useCallback(async (id, officer) => {
    const res = await axios.put(`${API_BASE}/admin/complaints/${id}/assign`, { officer });
    return res.data;
  }, []);

  const updateStatus = useCallback(async (id, status, note) => {
    const res = await axios.put(`${API_BASE}/admin/complaints/${id}/status`, { status, note });
    return res.data;
  }, []);

  const addNote = useCallback(async (id, text) => {
    const res = await axios.put(`${API_BASE}/admin/complaints/${id}/note`, { text });
    return res.data;
  }, []);

  const uploadProof = useCallback(async (id, formData) => {
    const res = await axios.put(`${API_BASE}/admin/complaints/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }, []);

  const validateComplaint = useCallback(async (grievanceId, formData) => {
    const res = await axios.post(`${API_BASE}/validations/${grievanceId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }, []);

  const value = {
    language,
    setLanguage,
    languages: LANGUAGES,
    t,
    adminToken,
    loading,
    setLoading,
    submitComplaint,
    trackComplaint,
    summarizeText,
    adminLogin,
    adminLogout,
    getAdminStats,
    getAdminComplaints,
    getComplaintDetail,
    verifyComplaint,
    assignOfficer,
    updateStatus,
    addNote,
    uploadProof,
    validateComplaint,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
