import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldAlert,
  Search,
  MessageCircle,
  Phone,
  Radio,
  Cpu,
  ShieldCheck,
  FileCode,
  Lock,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { PORTALS_DIRECTORY, PortalMeta } from '../../config/portalNavigation';
import { KenyanLanguage } from '../../types';

interface PortalDirectoryProps {
  onSelectPortal: (role: string) => void;
  onOpenSimulators: () => void;
  onOpenAudit: () => void;
  onOpenFHIR: () => void;
  onOpenArch: () => void;
  currentLanguage: KenyanLanguage;
  onSelectLanguage: (lang: KenyanLanguage) => void;
  aiInferenceActive: boolean;
}

export const PortalDirectory: React.FC<PortalDirectoryProps> = ({
  onSelectPortal,
  onOpenSimulators,
  onOpenAudit,
  onOpenFHIR,
  onOpenArch,
  currentLanguage,
  onSelectLanguage,
  aiInferenceActive
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPortals = PORTALS_DIRECTORY.filter(
    (p) =>
      p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <span className="font-bold text-xl">AS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">AfiyaSauti</h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MoH Kenya • DHA 2023
                </span>
                {aiInferenceActive ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Grounded RAG Active
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
                    Manual Fallback
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300">
                Trusted Healthcare AI Assistant — Kenya (DPA 2019 & DHA 2023)
              </p>
            </div>
          </div>

          {/* Quick Simulation & Utility Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenSimulators}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition-all min-h-[40px] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Simulate Channels (WhatsApp / USSD / IVR)</span>
            </button>

            <button
              onClick={onOpenAudit}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all min-h-[40px] cursor-pointer"
              title="Inspect cryptographic SHA-256 audit ledger"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Chain</span>
            </button>

            <button
              onClick={onOpenFHIR}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all min-h-[40px] cursor-pointer"
              title="View HL7 FHIR R4 Bundle"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>FHIR R4</span>
            </button>

            <button
              onClick={onOpenArch}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all min-h-[40px] cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>System Specs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Select your portal</h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Multi-channel triage, ambient monitoring, and national health intelligence. Every portal is
              assisted by grounded AI — humans remain in control.
            </p>
          </div>

          {/* Search Filter */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter portals..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 shadow-sm"
            />
          </div>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPortals.map((portal) => {
            const Icon = portal.icon;
            return (
              <button
                key={portal.role}
                onClick={() => onSelectPortal(portal.role)}
                className="group text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-lg ${portal.color} flex items-center justify-center mb-3 shadow-sm`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>{portal.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 leading-normal">{portal.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>{portal.tabs.length} modules</span>
                  <span className="font-medium text-emerald-600 group-hover:underline flex items-center gap-0.5">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Clinical Safety Notice */}
        <div className="mt-10 rounded-xl bg-amber-50 border border-amber-200 p-5 shadow-sm">
          <div className="flex gap-3.5 items-start">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 text-sm">Clinical Safety Notice</h3>
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                AfiyaSauti never issues a definitive diagnosis or prescription. All AI suggestions are
                evidence-grounded recommendations requiring human review by licensed medical practitioners or
                Community Health Promoters (CHPs). In life-threatening emergencies, call 999 or proceed to
                the nearest health facility immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Channel Ingestion Strip */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Simulated Citizen Ingestion Channels (Kenya Production Gateways)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div
              onClick={onOpenSimulators}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                WA
              </div>
              <div>
                <p className="font-medium text-slate-800">WhatsApp Business</p>
                <p className="text-slate-500 text-[11px]">+254 700 000000</p>
              </div>
            </div>

            <div
              onClick={onOpenSimulators}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                *#
              </div>
              <div>
                <p className="font-medium text-slate-800">Feature Phone USSD</p>
                <p className="text-slate-500 text-[11px]">*384# Session Machine</p>
              </div>
            </div>

            <div
              onClick={onOpenSimulators}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                IVR
              </div>
              <div>
                <p className="font-medium text-slate-800">Interactive Voice (IVR)</p>
                <p className="text-slate-500 text-[11px]">9 Kenyan Languages</p>
              </div>
            </div>

            <div
              onClick={() => onSelectPortal('ambient')}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                60G
              </div>
              <div>
                <p className="font-medium text-slate-800">Ambient Edge Node</p>
                <p className="text-slate-500 text-[11px]">FMCW Radar + Mic Array</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            AfiyaSauti Production System • Republic of Kenya Digital Health Act 2023 & Data Protection Act 2019
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={onOpenArch} className="hover:text-slate-800 underline cursor-pointer">
              System Architecture
            </button>
            <span>•</span>
            <button onClick={onOpenAudit} className="hover:text-slate-800 underline cursor-pointer">
              Merkle Audit Log
            </button>
            <span>•</span>
            <button onClick={onOpenFHIR} className="hover:text-slate-800 underline cursor-pointer">
              HL7 FHIR R4
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
