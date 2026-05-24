import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import VoiceReport from './pages/VoiceReport';
import TextReport from './pages/TextReport';
import Track from './pages/Track';
import CommunityDashboard from './pages/CommunityDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintDetail from './pages/ComplaintDetail';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/voice-report" element={<VoiceReport />} />
          <Route path="/text-report" element={<TextReport />} />
          <Route path="/track" element={<Track />} />
          <Route path="/community" element={<CommunityDashboard />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints/:id" element={<ComplaintDetail />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
