import React, { useState } from 'react';
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Lock,
  FileCode,
  Layers,
  MessageCircle,
  Globe,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Home
} from 'lucide-react';
import { PORTALS_DIRECTORY, PortalMeta } from '../../config/portalNavigation';
import { KenyanLanguage } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../services/clinicalModules';

interface PortalLayoutProps {
  currentRole: string;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onBackToDirectory: () => void;
  onSelectPortal: (role: string) => void;
  onOpenSimulators: () => void;
  onOpenAudit: () => void;
  onOpenFHIR: () => void;
  onOpenArch: () => void;
  currentLanguage: KenyanLanguage;
  onSelectLanguage: (lang: KenyanLanguage) => void;
  aiInferenceActive: boolean;
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  onBackToDirectory,
  onSelectPortal,
  onOpenSimulators,
  onOpenAudit,
  onOpenFHIR,
  onOpenArch,
  currentLanguage,
  onSelectLanguage,
  aiInferenceActive,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  const currentPortal =
    PORTALS_DIRECTORY.find((p) => p.role === currentRole) || PORTALS_DIRECTORY[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Top: Logo & Title */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
            <button
              onClick={onBackToDirectory}
              className="flex items-center gap-2 text-left cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                AS
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">
                  AfiyaSauti
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Kenya MoH / DHA</span>
              </div>
            </button>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Portal Badge */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-md ${currentPortal.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}
              >
                {React.createElement(currentPortal.icon, { className: 'w-4 h-4' })}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">{currentPortal.label}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentPortal.desc}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links for Current Portal */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
            {currentPortal.tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] cursor-pointer text-left ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <div className="flex-1 truncate">
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom Sidebar: Return to Portal Directory / Sign Out */}
          <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50/50">
            <button
              onClick={onBackToDirectory}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors min-h-[40px] cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>All 15 Portals</span>
            </button>

            <button
              onClick={onBackToDirectory}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors min-h-[40px] cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Switch Session / Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-6 shadow-sm">
          {/* Left: Mobile Toggle & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base lg:text-lg font-bold text-slate-900 leading-none">
                  {currentPortal.label}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200">
                  {currentRole.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Module:{' '}
                <span className="font-medium text-slate-700">
                  {currentPortal.tabs.find((t) => t.id === activeTab)?.label || activeTab}
                </span>
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Portal Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer min-h-[36px]"
              >
                <span>Switch Portal</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {portalDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPortalDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 max-h-96 overflow-y-auto">
                    <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Select Healthcare Portal
                    </div>
                    {PORTALS_DIRECTORY.map((p) => (
                      <button
                        key={p.role}
                        onClick={() => {
                          onSelectPortal(p.role);
                          setPortalDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-slate-50 cursor-pointer ${
                          p.role === currentRole ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                        <span className="flex-1 truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as KenyanLanguage)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer min-h-[36px]"
            >
              {Object.values(SUPPORTED_LANGUAGES).map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>

            {/* Channel Simulators Button */}
            <button
              onClick={onOpenSimulators}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all cursor-pointer min-h-[36px] shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulators</span>
            </button>

            {/* Audit Inspector Button */}
            <button
              onClick={onOpenAudit}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors"
              title="Audit Chain Inspector"
            >
              <Lock className="w-4 h-4 text-emerald-600" />
            </button>

            {/* FHIR Viewer Button */}
            <button
              onClick={onOpenFHIR}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors"
              title="HL7 FHIR R4 Bundle"
            >
              <FileCode className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </header>

        {/* Sub-tab Navigation Banner on Mobile / Tablets if needed */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 overflow-x-auto flex gap-1.5">
          {currentPortal.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
