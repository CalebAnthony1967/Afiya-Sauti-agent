import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Activity, AlertTriangle, Building2, FileText, Heart, HeartPulse, Home,
  LogOut, MapPin, Menu, MessageSquare, Shield, ShieldCheck, Stethoscope,
  TestTube, TrendingUp, User, Users, X, Globe, BookOpen, Key, GraduationCap,
  Cpu, Monitor, LifeBuoy, BarChart, CalendarCheck, History, Mic
} from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import VoiceTranscriptionModal from '@/components/VoiceTranscriptionModal';

const NAV_GROUPS = {
  patient: [
    { label: 'Health', path: '/patient', icon: Heart },
    { label: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'Medications', path: '/patient/medications', icon: Pill },
    { label: 'Messages', path: '/patient/messages', icon: MessageSquare },
    { label: 'Consent', path: '/patient/consent', icon: ShieldCheck },
    { label: 'Triage', path: '/patient/triage', icon: Stethoscope },
  ],
  family: [
    { label: 'Shared Care', path: '/family', icon: Users },
    { label: 'Appointments', path: '/family/appointments', icon: Calendar },
    { label: 'Medications', path: '/family/medications', icon: Pill },
    { label: 'Emergency', path: '/family/emergency', icon: AlertTriangle },
  ],
  chp: [
    { label: 'Tasks', path: '/chp', icon: Home },
    { label: 'Visits', path: '/chp/visits', icon: HeartPulse },
    { label: 'Guidance', path: '/chp/guidance', icon: BookOpen },
    { label: 'Map', path: '/chp/map', icon: MapPin },
    { label: 'Triage', path: '/chp/triage', icon: Stethoscope },
  ],
  clinician: [
    { label: 'Patient Queue', path: '/clinician', icon: Activity },
    { label: 'Dashboard', path: '/clinician/dashboard', icon: TrendingUp },
    { label: 'Analytics', path: '/clinician/analytics', icon: BarChart },
    { label: 'Calendar', path: '/clinician/calendar-sync', icon: CalendarCheck },
    { label: 'Clinical Notes', path: '/clinician/scribe', icon: FileText },
    { label: 'Appointments', path: '/clinician/appointments', icon: Calendar },
    { label: 'Bed Capacity', path: '/clinician/beds', icon: Building2 },
    { label: 'Sign Notes', path: '/clinician/sign', icon: ShieldCheck },
  ],
  ngo_admin: [
    { label: 'Campaigns', path: '/ngo', icon: TrendingUp },
    { label: 'CHP Assignment', path: '/ngo/allocation', icon: Users },
    { label: 'Reports', path: '/ngo/reports', icon: FileText },
  ],
  regional_admin: [
    { label: 'Facilities', path: '/regional', icon: Building2 },
    { label: 'CHP Performance', path: '/regional/chp', icon: Activity },
    { label: 'Logistics', path: '/regional/logistics', icon: TrendingUp },
    { label: 'Compliance', path: '/regional/compliance', icon: ShieldCheck },
  ],
  moh_admin: [
    { label: 'Dashboard', path: '/moh', icon: Globe },
    { label: 'Heatmap', path: '/moh/heatmap', icon: MapPin },
    { label: 'Protocols', path: '/moh/protocols', icon: FileText },
    { label: 'Accreditation', path: '/moh/accreditation', icon: ShieldCheck },
    { label: 'Outbreaks', path: '/moh/outbreaks', icon: AlertTriangle },
  ],
  researcher: [
    { label: 'Query', path: '/research', icon: TestTube },
    { label: 'Literature', path: '/research/literature', icon: BookOpen },
    { label: 'Signals', path: '/research/signals', icon: TrendingUp },
    { label: 'Reports', path: '/research/reports', icon: FileText },
  ],
  insurance: [
    { label: 'Insurance Claims', path: '/insurance', icon: Shield },
    { label: 'Risk', path: '/insurance/risk', icon: Activity },
    { label: 'Audit', path: '/insurance/audit', icon: FileText },
  ],
  admin: [
    { label: 'Users', path: '/admin', icon: Users },
    { label: 'Facilities', path: '/admin/facilities', icon: Building2 },
    { label: 'Audit', path: '/admin/audit', icon: FileText },
    { label: 'Health', path: '/admin/health', icon: Activity },
    { label: 'Tickets', path: '/admin/tickets', icon: LifeBuoy },
  ],
  super_admin: [
    { label: 'Secure Vault', path: '/super-admin', icon: Shield },
    { label: 'Users & Roles', path: '/super-admin/users', icon: Users },
    { label: 'Audit Trail', path: '/super-admin/audit', icon: FileText },
    { label: 'AI Settings', path: '/super-admin/ai', icon: Cpu },
    { label: 'Compliance', path: '/super-admin/compliance', icon: ShieldCheck },
    { label: 'Metrics', path: '/super-admin/metrics', icon: TrendingUp },
    { label: 'Emergency', path: '/super-admin/emergency', icon: AlertTriangle },
  ],
  developer: [
    { label: 'API Access', path: '/developer', icon: Key },
    { label: 'Webhooks', path: '/developer/webhooks', icon: Globe },
    { label: 'Health Data Standards', path: '/developer/fhir', icon: FileText },
    { label: 'Test Environment', path: '/developer/sandbox', icon: Monitor },
  ],
  training: [
    { label: 'Scenarios', path: '/training', icon: GraduationCap },
    { label: 'Practice', path: '/training/practice', icon: Stethoscope },
  ],
  ambient: [
    { label: 'Overview', path: '/ambient', icon: Cpu },
    { label: 'Live Monitor', path: '/ambient/monitor', icon: Activity },
    { label: 'History', path: '/ambient/history', icon: History },
  ],
};

function Calendar(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>; }
function Pill(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>; }

export default function PortalLayout({ role, title }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transcribeModalOpen, setTranscribeModalOpen] = useState(false);
  const navItems = NAV_GROUPS[role] || [];

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Voice Transcription Modal */}
      <VoiceTranscriptionModal
        isOpen={transcribeModalOpen}
        onClose={() => setTranscribeModalOpen(false)}
      />

      {/* Desktop Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sidebar-foreground">AfiyaSauti</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[48px]"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background border-b h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg lg:text-xl font-heading font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTranscribeModalOpen(true)}
              title="Microphone Audio Transcription with gemini-3.5-transcribe"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 text-xs font-medium transition-colors min-h-[36px]"
            >
              <Mic className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
              <span className="hidden sm:inline">Voice Transcribe</span>
            </button>
            <LanguageSelector compact />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
              <User className="w-3 h-3" />
              {role.replace('_', ' ')}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}