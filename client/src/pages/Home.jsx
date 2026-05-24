import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, FileText, Search, Shield, ArrowRight, Users, CheckCircle2, Lock, Zap } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Mic,
      title: 'Voice First',
      desc: 'Speak in your language. AI converts your voice to a structured complaint.',
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Lock,
      title: '100% Anonymous',
      desc: 'No login required. Get an anonymous ID and PIN to track your complaint.',
      color: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
    },
    {
      icon: Shield,
      title: 'Tamper-Proof',
      desc: 'Every action is logged with SHA-256 hash chains. Nobody can alter records.',
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Users,
      title: 'Community Validated',
      desc: 'Neighbors can confirm issues, adding urgency and credibility.',
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Complaints Filed' },
    { value: '87%', label: 'Resolution Rate' },
    { value: '48hrs', label: 'Avg. Response Time' },
    { value: '500+', label: 'Wards Covered' },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-trust-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-trust-50 border border-trust-200 text-trust-700 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                India's Voice-First Civic Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
                Your Voice
                <span className="gradient-text"> Matters.</span>
                <br />
                Your Identity
                <span className="gradient-text-gold"> Doesn't.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                Report civic issues anonymously in your local language.
                Track progress with tamper-proof transparency.
                Let your community rally behind real problems.
              </p>
            </motion.div>

            {/* ── CTA Buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/voice-report"
                className="btn-shine group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-trust-700 to-trust-500 text-white font-semibold text-lg shadow-lg shadow-trust-500/25 hover:shadow-xl hover:shadow-trust-500/30 hover:-translate-y-0.5 transition-all duration-300"
                id="cta-voice-report"
              >
                <Mic className="w-6 h-6" />
                Report by Voice
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/text-report"
                className="btn-shine group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-700 font-semibold text-lg shadow-md border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                id="cta-text-report"
              >
                <FileText className="w-5 h-5 text-trust-600" />
                Report by Text
              </Link>

              <Link
                to="/community"
                className="btn-shine group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-700 font-semibold text-lg shadow-md border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                id="cta-community"
              >
                <Users className="w-5 h-5 text-trust-600" />
                Community Feed
              </Link>

              <Link
                to="/track"
                className="btn-shine group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-700 font-semibold text-lg shadow-md border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                id="cta-track"
              >
                <Search className="w-5 h-5 text-emerald-600" />
                Track Complaint
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 -mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 sm:p-8"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <p className="text-2xl sm:text-3xl font-black gradient-text">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            Built for <span className="gradient-text">Trust & Transparency</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Every feature designed to protect citizens and hold authorities accountable.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-card p-6 group cursor-default"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Speak or Type', desc: 'Describe your issue by voice or text in any language.', icon: Mic },
            { step: '02', title: 'Get Your ID', desc: 'Receive an anonymous Grievance ID and PIN instantly.', icon: Shield },
            { step: '03', title: 'Track Progress', desc: 'Watch real-time updates with proof of action taken.', icon: CheckCircle2 },
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="text-center"
            >
              <div className="relative inline-flex">
                <div className="w-16 h-16 rounded-2xl bg-trust-50 flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="w-8 h-8 text-trust-600" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-trust-600 to-trust-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-trust-600" />
            <span className="font-bold gradient-text">TrustLayer</span>
          </div>
          <p className="text-xs text-slate-400">
            Voice-First Anonymous Grievance System · Built for India's Citizens
          </p>
        </div>
      </footer>
    </div>
  );
}
