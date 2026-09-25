import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import TriageInterface from '@/components/TriageInterface';
import UrgencyBadge from '@/components/UrgencyBadge';
import { LoadingState, EmptyState } from '@/components/States';
import PatientIdentityCard from '@/components/patient/PatientIdentityCard';
import HealthTimeline from '@/components/patient/HealthTimeline';
import {
  Heart, Calendar, Pill, Activity, Stethoscope, Clock,
  HeartPulse, ArrowRight, Sparkles, FileDown, TrendingUp,
} from 'lucide-react';
import { buildFhirBundle, buildFhirDiagnosticReport } from '@/lib/fhir';

export default function PatientHome() {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [soapNotes, setSoapNotes] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [chpDispatches, setChpDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, s, a, m, soap, tele, dispatches] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.TriageSession.list('-created_date', 10),
        base44.entities.Appointment.list('-appointment_date', 5),
        base44.entities.MedicationRegimen.filter({ active: true }, '-created_date', 10),
        base44.entities.ClinicalSoapNote.list('-created_date', 5),
        base44.entities.VitalTelemetry.list('-created_date', 5),
        base44.entities.ChpDispatch.list('-dispatched_at', 3),
      ]);
      setProfile(p);
      setSessions(s || []);
      setAppointments(a || []);
      setMedications(m || []);
      setSoapNotes(soap || []);
      setTelemetry(tele || []);
      setChpDispatches(dispatches || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Build unified health timeline from all event sources
  const timelineEvents = useMemo(() => {
    const events = [];

    sessions.forEach(s => events.push({
      id: s.id, type: 'triage', timestamp: s.created_date,
      title: `${s.channel?.toUpperCase()} Triage — ${s.domain_module?.replace(/_/g, ' ')}`,
      description: s.ai_response || s.symptoms_text || 'Session recorded',
      urgency: s.urgency_level, confidence: s.confidence_score,
      badge: s.status?.toUpperCase(),
      meta: s.icd11_codes?.length ? `ICD-11: ${s.icd11_codes.join(', ')}` : null,
    }));

    telemetry.forEach(t => events.push({
      id: t.id, type: 'ambient', timestamp: t.created_date,
      title: 'Ambient Monitoring Reading',
      description: t.flagged_anomaly
        ? `Anomaly: ${t.anomaly_type || 'vital sign deviation'}`
        : 'Normal vital signs recorded',
      badge: t.flagged_anomaly ? 'ANOMALY' : 'NORMAL',
      meta: `RR ${t.respiratory_rate} | HR ${t.heart_rate} | Cough ${t.cough_count_1min}`,
    }));

    soapNotes.forEach(n => events.push({
      id: n.id, type: 'soap', timestamp: n.created_date,
      title: n.signed ? 'Signed SOAP Note' : 'Draft Clinical Note',
      description: n.assessment || n.subjective || 'Clinical note recorded',
      badge: n.signed ? 'SIGNED' : 'DRAFT',
      meta: n.icd11_codes?.length ? `ICD-11: ${n.icd11_codes.join(', ')}` : null,
    }));

    appointments.forEach(a => events.push({
      id: a.id, type: 'appointment', timestamp: a.appointment_date,
      title: a.reason || 'Appointment',
      description: `Status: ${a.status}`,
      badge: a.status?.toUpperCase(),
    }));

    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);
  }, [sessions, telemetry, soapNotes, appointments]);

  const exportFHIR = () => {
    const resources = sessions.map(buildFhirDiagnosticReport);
    const bundle = buildFhirBundle(resources);
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/fhir+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afiyaSauti_fhir_record_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState message="Loading your health record..." />;

  const upcomingAppointments = appointments.filter(a =>
    a.status === 'scheduled' || a.status === 'confirmed'
  );

  return (
    <div className="space-y-6">
      {/* Identity Card */}
      <PatientIdentityCard profile={profile} onExportFHIR={exportFHIR} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Triage Sessions" value={sessions.length} color="bg-teal-50 text-teal-600" />
        <StatCard icon={Calendar} label="Appointments" value={upcomingAppointments.length} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Pill} label="Active Meds" value={medications.length} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={HeartPulse} label="Ambient Readings" value={telemetry.length} color="bg-violet-50 text-violet-600" />
      </div>

      {/* Quick Triage */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-teal-500" /> Quick Symptom Triage
        </h3>
        <TriageInterface compact />
      </div>

      {/* Main grid: Timeline + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthTimeline events={timelineEvents} />
        </div>

        <div className="space-y-4">
          {/* Upcoming Appointments */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-500" /> Upcoming Appointments
            </h3>
            {upcomingAppointments.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No upcoming appointments</p>
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.map(a => (
                  <div key={a.id} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <p className="text-xs font-semibold text-slate-900">{a.reason || 'Appointment'}</p>
                    <p className="text-xs text-slate-500">{new Date(a.appointment_date).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/patient/appointments" className="mt-3 flex items-center gap-1 text-xs text-teal-500 hover:text-teal-300">
              Manage appointments <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Assigned CHP */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-500" /> Your Care Team
            </h3>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-900">Community Health Promoter</p>
              <p className="text-xs text-slate-500 mt-0.5">Assigned to your household</p>
              <div className="mt-2 text-xs text-teal-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active on eCHIS Field Network</span>
              </div>
            </div>
            {chpDispatches.length > 0 && (
              <div className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{chpDispatches.length} CHP dispatch(es) on record</span>
              </div>
            )}
          </div>

          {/* Cross-Portal Navigation */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-teal-500" /> Connected Services
            </h3>
            <div className="space-y-2">
              <CrossPortalLink to="/ambient" icon={HeartPulse} label="Ambient Monitoring" desc="View in-home vitals" color="text-violet-400" />
              <CrossPortalLink to="/family" icon={Heart} label="Family Access" desc="Share with caregiver" color="text-pink-400" />
              <CrossPortalLink to="/patient/consent" icon={FileDown} label="Privacy & Consent" desc="Manage data rights" color="text-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function CrossPortalLink({ to, icon: Icon, label, desc, color }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 transition-colors group">
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-900">{label}</p>
        <p className="text-[11px] text-slate-500">{desc}</p>
      </div>
      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}