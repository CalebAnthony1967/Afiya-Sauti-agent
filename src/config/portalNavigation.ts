import {
  User,
  Users,
  HeartHandshake,
  Stethoscope,
  Building,
  MapPin,
  Landmark,
  Microscope,
  FileCheck,
  GraduationCap,
  Settings,
  ShieldAlert,
  Terminal,
  Cpu,
  Globe,
  Activity,
  Calendar,
  Pill,
  MessageSquare,
  Shield,
  FileText,
  AlertTriangle,
  ClipboardList,
  BookOpen,
  Map,
  Bed,
  CheckCircle,
  Megaphone,
  BarChart3,
  Truck,
  Flame,
  Key,
  Webhook,
  Code2,
  Lock,
  Sliders,
  Database,
  Ticket,
  ShieldCheck
} from 'lucide-react';

export interface PortalNavItem {
  id: string;
  label: string;
  icon: any;
  description?: string;
}

export interface PortalMeta {
  role: string;
  label: string;
  desc: string;
  icon: any;
  color: string;
  defaultTab: string;
  tabs: PortalNavItem[];
}

export const PORTALS_DIRECTORY: PortalMeta[] = [
  {
    role: 'patient',
    label: 'Patient Portal',
    desc: 'Personal health record, triage, medications',
    icon: User,
    color: 'bg-rose-500',
    defaultTab: 'health',
    tabs: [
      { id: 'health', label: 'Health', icon: Activity, description: 'Personal health timeline and triage' },
      { id: 'appointments', label: 'Appointments', icon: Calendar, description: 'Clinic visits and scheduling' },
      { id: 'medications', label: 'Medications', icon: Pill, description: 'Active prescriptions and reminders' },
      { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Direct clinical messaging' },
      { id: 'consent', label: 'Consent', icon: Shield, description: 'Kenya DPA 2019 privacy & rights' },
      { id: 'triage', label: 'Triage', icon: AlertTriangle, description: 'Self-guided symptom check' }
    ]
  },
  {
    role: 'family',
    label: 'Family / Caregiver',
    desc: 'Shared view of consenting patient',
    icon: Users,
    color: 'bg-pink-500',
    defaultTab: 'shared_care',
    tabs: [
      { id: 'shared_care', label: 'Shared Care', icon: Users, description: 'Consented family dependents' },
      { id: 'appointments', label: 'Appointments', icon: Calendar, description: 'Family clinical appointments' },
      { id: 'medications', label: 'Medications', icon: Pill, description: 'Family medication adherence' },
      { id: 'emergency', label: 'Emergency', icon: AlertTriangle, description: 'Rapid ambulance and dispatch' }
    ]
  },
  {
    role: 'chp',
    label: 'CHP Field Portal',
    desc: 'Field tasks, visits, offline guidance',
    icon: HeartHandshake,
    color: 'bg-emerald-500',
    defaultTab: 'tasks',
    tabs: [
      { id: 'tasks', label: 'Tasks', icon: ClipboardList, description: 'Priority field assignments' },
      { id: 'visits', label: 'Visits', icon: HeartHandshake, description: 'Household visits & eCHIS sync' },
      { id: 'guidance', label: 'Guidance', icon: BookOpen, description: 'IMCI protocol library & AI assistant' },
      { id: 'map', label: 'Map', icon: Map, description: 'Catchment community unit map' },
      { id: 'triage', label: 'Triage', icon: AlertTriangle, description: 'Field symptom assessment' }
    ]
  },
  {
    role: 'clinician',
    label: 'Hospital / Clinic',
    desc: 'Triage queue, scribe, signing',
    icon: Stethoscope,
    color: 'bg-blue-500',
    defaultTab: 'triage_queue',
    tabs: [
      { id: 'triage_queue', label: 'Triage Queue', icon: Activity, description: 'eCHIS intake sorted by urgency' },
      { id: 'scribe', label: 'Scribe', icon: FileText, description: 'Ambient clinical SOAP notes' },
      { id: 'appointments', label: 'Appointments', icon: Calendar, description: 'Outpatient consultation queue' },
      { id: 'beds', label: 'Beds', icon: Bed, description: 'Ward capacity & bed tracking' },
      { id: 'sign', label: 'Sign', icon: CheckCircle, description: 'Cryptographic SHA-256 signing' }
    ]
  },
  {
    role: 'ngo_admin',
    label: 'NGO / Organisation',
    desc: 'Campaigns, CHP allocation, reports',
    icon: Megaphone,
    color: 'bg-teal-500',
    defaultTab: 'campaigns',
    tabs: [
      { id: 'campaigns', label: 'Campaigns', icon: Megaphone, description: 'Public health field interventions' },
      { id: 'allocation', label: 'CHP Allocation', icon: Users, description: 'Sub-county promoter assignment' },
      { id: 'reports', label: 'Reports', icon: BarChart3, description: 'Programme impact & coverage reports' }
    ]
  },
  {
    role: 'regional_admin',
    label: 'Regional Admin',
    desc: 'Facilities, CHP metrics, logistics',
    icon: MapPin,
    color: 'bg-cyan-500',
    defaultTab: 'facilities',
    tabs: [
      { id: 'facilities', label: 'Facilities', icon: Building, description: 'County health facilities directory' },
      { id: 'chp_metrics', label: 'CHP Metrics', icon: Activity, description: 'Promoter performance & response' },
      { id: 'logistics', label: 'Logistics', icon: Truck, description: 'Essential medicine supply monitoring' },
      { id: 'compliance', label: 'Compliance', icon: Shield, description: 'County statutory standards' }
    ]
  },
  {
    role: 'moh_admin',
    label: 'Ministry of Health',
    desc: 'Heatmaps, protocols, outbreaks',
    icon: Landmark,
    color: 'bg-indigo-500',
    defaultTab: 'dashboard',
    tabs: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'National epidemiological overview' },
      { id: 'heatmap', label: 'Heatmap', icon: Map, description: '47-county syndromic surveillance GIS' },
      { id: 'protocols', label: 'Protocols', icon: BookOpen, description: 'Kenya Clinical Guidelines (IMCI)' },
      { id: 'accreditation', label: 'Accreditation', icon: Shield, description: 'DHA 2023 digital health certification' },
      { id: 'outbreaks', label: 'Outbreaks', icon: Flame, description: 'Epidemic threshold & early alert' }
    ]
  },
  {
    role: 'researcher',
    label: 'Research & Epidemiology',
    desc: 'RAG queries, literature, signals',
    icon: Microscope,
    color: 'bg-purple-500',
    defaultTab: 'query',
    tabs: [
      { id: 'query', label: 'Query', icon: Microscope, description: 'De-identified clinical RAG search' },
      { id: 'literature', label: 'Literature', icon: BookOpen, description: 'MoH & WHO guideline library' },
      { id: 'signals', label: 'Signals', icon: Activity, description: 'Syndromic early warning anomalies' },
      { id: 'reports', label: 'Reports', icon: FileText, description: 'FHIR R4 dataset export' }
    ]
  },
  {
    role: 'insurance',
    label: 'Insurance / Payer',
    desc: 'Pre-claim verification, risk',
    icon: FileCheck,
    color: 'bg-amber-500',
    defaultTab: 'pre_claims',
    tabs: [
      { id: 'pre_claims', label: 'Pre-claims', icon: FileCheck, description: 'SHA / NHIF pre-authorizations' },
      { id: 'risk', label: 'Risk', icon: Activity, description: 'Actuarial risk & anomaly scoring' },
      { id: 'audit', label: 'Audit', icon: Shield, description: 'Clinical integrity audit trail' }
    ]
  },
  {
    role: 'training',
    label: 'Training & Simulation',
    desc: 'Practice scenarios, feedback',
    icon: GraduationCap,
    color: 'bg-orange-500',
    defaultTab: 'scenarios',
    tabs: [
      { id: 'scenarios', label: 'Scenarios', icon: GraduationCap, description: 'Clinical case study library' },
      { id: 'practice', label: 'Practice', icon: AlertTriangle, description: 'Interactive triage decision simulator' }
    ]
  },
  {
    role: 'admin',
    label: 'Admin Portal',
    desc: 'Users, facilities, audit, health',
    icon: Settings,
    color: 'bg-slate-500',
    defaultTab: 'users',
    tabs: [
      { id: 'users', label: 'Users', icon: Users, description: 'System user directory & roles' },
      { id: 'facilities', label: 'Facilities', icon: Building, description: 'Master facility list management' },
      { id: 'audit', label: 'Audit', icon: Shield, description: 'System administrative event log' },
      { id: 'health', label: 'Health', icon: Activity, description: 'Service uptime & gateway status' },
      { id: 'tickets', label: 'Tickets', icon: Ticket, description: 'Clinical feedback & support' }
    ]
  },
  {
    role: 'super_admin',
    label: 'Super Admin (Vault)',
    desc: 'Ultimate control, audit chain, emergency',
    icon: ShieldAlert,
    color: 'bg-red-600',
    defaultTab: 'vault',
    tabs: [
      { id: 'vault', label: 'Vault', icon: Lock, description: 'HSM keys & cryptographic shredding' },
      { id: 'users', label: 'Users & Roles', icon: Users, description: 'RBAC privileges & revocations' },
      { id: 'audit', label: 'Audit Chain', icon: Shield, description: 'Tamper-evident Merkle hash chain' },
      { id: 'ai', label: 'AI Control', icon: Sliders, description: 'Confidence & entropy safety gates' },
      { id: 'compliance', label: 'Compliance', icon: ShieldCheck, description: 'Kenya DPA 2019 & DHA 2023 audit' },
      { id: 'metrics', label: 'Metrics', icon: BarChart3, description: 'Channel throughput & latency' },
      { id: 'emergency', label: 'Emergency', icon: Flame, description: 'Kill-switch & emergency broadcast' }
    ]
  },
  {
    role: 'developer',
    label: 'Developer / Integration',
    desc: 'API keys, webhooks, FHIR docs',
    icon: Terminal,
    color: 'bg-zinc-500',
    defaultTab: 'api_keys',
    tabs: [
      { id: 'api_keys', label: 'API Keys', icon: Key, description: 'Scoped API credentials' },
      { id: 'webhooks', label: 'Webhooks', icon: Webhook, description: 'eCHIS & OpenMRS event hooks' },
      { id: 'fhir', label: 'FHIR Docs', icon: Code2, description: 'HL7 FHIR R4 schema guide' },
      { id: 'sandbox', label: 'Sandbox', icon: Terminal, description: 'Interactive API sandbox' }
    ]
  },
  {
    role: 'ambient',
    label: 'In-Home Ambient Node',
    desc: 'Edge device status & privacy',
    icon: Cpu,
    color: 'bg-violet-500',
    defaultTab: 'status',
    tabs: [
      { id: 'status', label: 'Status', icon: Cpu, description: '60 GHz FMCW radar & acoustic array' },
      { id: 'telemetry', label: 'Telemetry', icon: Activity, description: 'Live contact-free vital telemetry' },
      { id: 'privacy', label: 'Privacy Switches', icon: Lock, description: 'Hardware mic & radar cutoffs' }
    ]
  },
  {
    role: 'community_intel',
    label: 'Community Intelligence',
    desc: 'Anonymised local insights',
    icon: Globe,
    color: 'bg-green-500',
    defaultTab: 'insights',
    tabs: [
      { id: 'insights', label: 'Insights', icon: Globe, description: 'De-identified syndromic patterns' },
      { id: 'trends', label: 'Trends', icon: BarChart3, description: 'Seasonal respiratory & febrile trends' },
      { id: 'advisories', label: 'Advisories', icon: Megaphone, description: 'Community health bulletins' }
    ]
  }
];
