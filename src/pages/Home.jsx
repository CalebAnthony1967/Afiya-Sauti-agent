import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, HeartPulse, Users, Stethoscope, Globe, TestTube,
  Shield, GraduationCap, Cpu, Monitor, LifeBuoy, MapPin, TrendingUp,
  ArrowRight, AlertTriangle, Sparkles, Activity, Radio, Lock,
  Languages, Wifi, ChevronDown, FlaskConical, Key, Mic
} from 'lucide-react';
import IngestionChannels from '@/components/ingestion/IngestionChannels';
import LanguageSelector from '@/components/LanguageSelector';
import VoiceTranscriptionModal from '@/components/VoiceTranscriptionModal';
import { useLanguage } from '@/lib/LanguageContext';

const PORTALS = [
  { role: 'patient', labelKey: 'portal.patient', desc: 'Personal health record, symptom check, medications & adherence', icon: Heart, path: '/patient', color: 'from-rose-400 to-pink-500' },
  { role: 'family', labelKey: 'portal.family', desc: 'Shared view of consenting patient', icon: Users, path: '/family', color: 'from-pink-400 to-rose-400' },
  { role: 'chp', labelKey: 'portal.chp', desc: 'Field visits, household check-ins, offline guidance', icon: HeartPulse, path: '/chp', color: 'from-emerald-400 to-teal-500' },
  { role: 'clinician', labelKey: 'portal.clinician', desc: 'Triage queue, AI scribe, clinical signing, alerts', icon: Stethoscope, path: '/clinician', color: 'from-blue-400 to-indigo-500' },
  { role: 'ngo_admin', labelKey: 'portal.ngo', desc: 'Campaigns, CHP allocation, reports', icon: TrendingUp, path: '/ngo', color: 'from-teal-400 to-cyan-500' },
  { role: 'regional_admin', labelKey: 'portal.regional', desc: 'Facilities, CHP metrics, logistics', icon: MapPin, path: '/regional', color: 'from-cyan-400 to-blue-400' },
  { role: 'moh_admin', labelKey: 'portal.moh', desc: 'Heatmaps, protocols, outbreak signals', icon: Globe, path: '/moh', color: 'from-indigo-400 to-purple-500' },
  { role: 'researcher', labelKey: 'portal.research', desc: 'RAG queries, literature, signals', icon: TestTube, path: '/research', color: 'from-purple-400 to-violet-500' },
  { role: 'insurance', labelKey: 'portal.insurance', desc: 'Pre-claim verification, risk scoring', icon: Shield, path: '/insurance', color: 'from-amber-400 to-orange-400' },
  { role: 'training', labelKey: 'portal.training', desc: 'Practice scenarios with feedback', icon: GraduationCap, path: '/training', color: 'from-orange-400 to-red-400' },
  { role: 'admin', labelKey: 'portal.admin', desc: 'Users, facilities, audit, system health', icon: LifeBuoy, path: '/admin', color: 'from-slate-400 to-slate-500' },
  { role: 'super_admin', labelKey: 'portal.superAdmin', desc: 'Ultimate control, audit chain, emergency', icon: AlertTriangle, path: '/super-admin', color: 'from-red-400 to-rose-500' },
  { role: 'developer', labelKey: 'portal.developer', desc: 'API keys, webhooks, FHIR docs', icon: Key, path: '/developer', color: 'from-zinc-400 to-slate-400' },
  { role: 'ambient', labelKey: 'portal.ambient', desc: 'Edge device telemetry & privacy controls', icon: Cpu, path: '/ambient', color: 'from-violet-400 to-purple-500' },
  { role: 'community_intel', labelKey: 'portal.community', desc: 'Anonymised local health insights', icon: Monitor, path: '/community', color: 'from-green-400 to-emerald-500' },
];

const FEATURES = [
  { icon: Activity, title: 'Multi-Channel Triage', desc: 'WhatsApp, USSD, IVR & web intake with grounded MoH Kenya protocols', color: 'text-teal-600 bg-teal-50' },
  { icon: Radio, title: 'Ambient Monitoring', desc: 'In-home edge nodes with on-device feature extraction — privacy-first', color: 'text-violet-600 bg-violet-50' },
  { icon: Stethoscope, title: 'Clinician-in-Loop', desc: 'AI drafts, humans sign. Every SOAP note cryptographically locked', color: 'text-blue-600 bg-blue-50' },
  { icon: Lock, title: 'Privacy by Design', desc: 'Kenya DPA 2019 compliant. HMAC-anonymized, granular consent, key shredding', color: 'text-emerald-600 bg-emerald-50' },
];

const STATS = [
  { value: 9, label: 'African Languages', icon: Languages },
  { value: 15, label: 'Role Portals', icon: Users },
  { value: 4, label: 'Ingestion Channels', icon: Wifi },
  { value: 6, label: 'Clinical Domains', icon: Activity },
];

export default function Home() {
  const { t } = useLanguage();
  const portalsRef = useRef(null);
  const [transcribeModalOpen, setTranscribeModalOpen] = useState(false);

  const scrollToPortals = () => {
    setTimeout(() => {
      portalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-teal-50/30 to-white text-slate-800 overflow-x-hidden">
      <VoiceTranscriptionModal
        isOpen={transcribeModalOpen}
        onClose={() => setTranscribeModalOpen(false)}
      />
      {/* ═══ Hero Section ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated light gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-teal-200/40 blur-3xl"
            animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-violet-200/30 blur-3xl"
            animate={{ x: [0, -60, 0], y: [0, -50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,118,110,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Top bar with language selector and Voice Transcribe */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">AfiyaSauti</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setTranscribeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 text-xs font-semibold transition-all shadow-sm min-h-[36px]"
            >
              <Mic className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
              <span>Voice Transcribe</span>
            </button>
            <LanguageSelector />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 border border-teal-200 text-teal-700 text-sm mb-6"
          >
            <Sparkles className="w-4 h-4" />
            {t('home.badge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-slate-900"
          >
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-violet-600 bg-clip-text text-transparent">
              AfiyaSauti
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-2"
          >
            {t('home.tagline')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-sm text-slate-500 max-w-xl mx-auto mb-8"
          >
            {t('home.selectPortalDesc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={scrollToPortals}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-base hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              {t('home.enterPortal')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/simulator"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-base hover:bg-slate-50 transition-all"
            >
              <FlaskConical className="w-5 h-5 text-teal-500" />
              Test Intake Simulator
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-1 text-slate-400"
            >
              <span className="text-xs">Explore</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Stats Bar ═══ */}
      <section className="relative z-10 bg-white/60 border-y border-slate-100 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-800">{stat.value}+</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">{t('home.features')}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              From the household to the Ministry of Health — every layer connected, every decision grounded.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-teal-200 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Portal Selection ═══ */}
      <section ref={portalsRef} className="relative z-10 py-20 bg-gradient-to-b from-transparent to-teal-50/40">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">{t('home.selectPortal')}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">{t('home.selectPortalDesc')}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {PORTALS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.role}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.05 }}
                >
                  <Link
                    to={p.path}
                    className="group block h-full bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-teal-200 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-3 shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold flex items-center gap-1 text-slate-900">
                      {t(p.labelKey)}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-teal-500" />
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{p.desc}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Safety Notice ═══ */}
      <section className="relative z-10 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 text-base">{t('safety.notice')}</h3>
                <p className="text-sm text-amber-700 mt-1">{t('safety.noticeText')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Ingestion Channels ═══ */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <IngestionChannels />
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-800">AfiyaSauti</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Kenya DPA 2019</span>
              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> FHIR R4</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> WHO / MoH Kenya</span>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            © 2026 AfiyaSauti. Built for Kenya's health system. Privacy by design.
          </p>
        </div>
      </footer>
    </div>
  );
}