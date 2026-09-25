import React from 'react';
import {
  Activity,
  ShieldCheck,
  Globe2,
  Smartphone,
  Lock,
  FileCode,
  Radio,
  Sliders,
  Sparkles,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { KenyanLanguage, SystemPortal } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../services/clinicalModules';

interface NavbarProps {
  currentPortal: SystemPortal;
  onSelectPortal: (portal: SystemPortal) => void;
  currentLanguage: KenyanLanguage;
  onSelectLanguage: (lang: KenyanLanguage) => void;
  aiInferenceActive: boolean;
  onOpenSimulators: () => void;
  onOpenAudit: () => void;
  onOpenFHIR: () => void;
  onOpenArch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPortal,
  onSelectPortal,
  currentLanguage,
  onSelectLanguage,
  aiInferenceActive,
  onOpenSimulators,
  onOpenAudit,
  onOpenFHIR,
  onOpenArch
}) => {
  const portalLabels: Record<SystemPortal, { name: string; tag: string }> = {
    patient: { name: 'Patient Portal', tag: 'Self-Service' },
    family: { name: 'Family / Caregiver', tag: 'Consented View' },
    chp_field: { name: 'CHP Field Portal', tag: 'eCHIS Offline' },
    hospital_clinic: { name: 'Hospital & Clinic', tag: 'eCHIS Triage & SOAP' },
    moh_government: { name: 'Ministry of Health', tag: '47 Counties GIS' },
    regional_admin: { name: 'Regional Admin', tag: 'County Oversight' },
    ngo: { name: 'NGO & Programmes', tag: 'Impact Tracking' },
    research_epi: { name: 'Research & Epi', tag: 'Surveillance RAG' },
    insurance_payer: { name: 'Insurance & Payers', tag: 'Claim Verification' },
    training_sim: { name: 'Training & Sim', tag: 'Clinical Scenarios' },
    community_intel: { name: 'Community Intel', tag: 'Local Trends' },
    admin: { name: 'Admin Portal', tag: 'Day-to-Day Ops' },
    super_admin: { name: 'Super Admin Vault', tag: 'Cryptographic HSM' },
    developer: { name: 'Developer & FHIR', tag: 'Integration APIs' },
    ambient_node: { name: 'Ambient Edge Node', tag: 'Hardware Screen' }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Top Banner - Regulatory & Emergency AI Guard */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Republic of Kenya
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Data Protection Act 2019 & Digital Health Act 2023 Compliant</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-mono text-[11px]">HMAC-SHA-256 Salted Identity</span>
        </div>

        <div className="flex items-center gap-3">
          {aiInferenceActive ? (
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI Active (Grounded RAG MoH/WHO)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded text-[11px] font-semibold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>AI INFERENCE PAUSED: Manual Fallback Mode</span>
            </div>
          )}

          <button
            onClick={onOpenArch}
            className="text-slate-300 hover:text-white hover:underline flex items-center gap-1 text-[11px]"
            title="View Architecture Specification and Deployment Checklist"
          >
            <FileText className="w-3 h-3" />
            <span>Architecture & Ops</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 font-bold text-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AfiyaSauti
                <span className="text-xs px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono font-normal">
                  v2.4 Production
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">Trusted Clinical AI, Ambient Radar & Public Health</p>
          </div>
        </div>

        {/* Portal Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium hidden md:inline">Portal:</label>
          <div className="relative">
            <select
              value={currentPortal}
              onChange={(e) => onSelectPortal(e.target.value as SystemPortal)}
              className="bg-slate-800 hover:bg-slate-750 text-white text-sm font-medium border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-8 cursor-pointer"
            >
              <optgroup label="Clinical & Frontline Portals">
                <option value="patient">Patient Self-Service</option>
                <option value="family">Family / Caregiver</option>
                <option value="chp_field">CHP Field Portal (eCHIS)</option>
                <option value="hospital_clinic">Hospital / Clinic (eCHIS Triage & SOAP)</option>
              </optgroup>
              <optgroup label="Government & Oversight">
                <option value="moh_government">Ministry of Health (47 Counties GIS)</option>
                <option value="regional_admin">Regional Admin Oversight</option>
                <option value="ngo">NGO & Programme Management</option>
                <option value="community_intel">Community Health Intelligence</option>
              </optgroup>
              <optgroup label="Research, Payer & Training">
                <option value="research_epi">Research & Epidemiology RAG</option>
                <option value="insurance_payer">Insurance & Pre-Claim Verification</option>
                <option value="training_sim">Training & Clinical Simulation</option>
              </optgroup>
              <optgroup label="Core Infrastructure & Edge">
                <option value="admin">System Admin</option>
                <option value="super_admin">🔐 Super Admin Vault (HSM & Audit)</option>
                <option value="developer">Developer & FHIR R4 Sandbox</option>
                <option value="ambient_node">📟 In-Home Ambient Node Screen</option>
              </optgroup>
            </select>
          </div>

          <span className="hidden lg:inline-flex text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {portalLabels[currentPortal]?.tag}
          </span>
        </div>

        {/* Language & Tools Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher (9 Kenyan Languages) */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1">
            <Globe2 className="w-4 h-4 text-teal-400" />
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as KenyanLanguage)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
              title="Select Kenyan Language (Supports Code-Switching)"
            >
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-100">
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Channels Simulator Button */}
          <button
            onClick={onOpenSimulators}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            title="Launch WhatsApp, USSD *384#, and IVR Simulators"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate</span> Channels
          </button>

          {/* Cryptographic Audit Log Inspector */}
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Verify SHA-256 Audit Trail Integrity"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Audit Chain</span>
          </button>

          {/* FHIR R4 Bundle */}
          <button
            onClick={onOpenFHIR}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Export FHIR R4 Bundle (Right to Portability)"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">FHIR R4</span>
          </button>
        </div>
      </div>
    </header>
  );
};
