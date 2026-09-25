import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AIRecommendation from '@/components/AIRecommendation';
import UrgencyBadge from '@/components/UrgencyBadge';
import { LoadingState, EmptyState } from '@/components/States';
import { invokeAgent } from '@/lib/aiAgents';
import { Users, Calendar, Pill, AlertTriangle, Heart } from 'lucide-react';

export default function FamilyHome() {
  const [sessions, setSessions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiExplain, setAiExplain] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, a, m] = await Promise.all([
          base44.entities.TriageSession.list('-created_date', 10),
          base44.entities.Appointment.list('-appointment_date', 10),
          base44.entities.MedicationRegimen.list('-created_date', 10),
        ]);
        setSessions(s || []); setAppointments(a || []); setMeds(m || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const explain = async (text) => {
    const res = await invokeAgent('community_intel_agent', `Explain this care instruction in plain language: ${text}`);
    setAiExplain(res);
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="w-5 h-5" /> Shared Care View</h2>
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
        You are viewing a consenting patient's record. All access is audited.
      </div>

      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Heart className="w-4 h-4" /> Shared Timeline</h3>
        {sessions.length === 0 ? <EmptyState icon={Heart} title="No sessions" /> : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-1"><UrgencyBadge level={s.urgency_level} size="sm" /><span className="text-xs text-muted-foreground">{new Date(s.created_date).toLocaleDateString()}</span></div>
                <p className="text-sm">{s.ai_response?.substring(0, 120) || 'Session recorded'}...</p>
                <button onClick={() => explain(s.ai_response)} className="mt-2 text-xs text-violet-600 font-medium">Explain</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> Appointments</h3>
        {appointments.length === 0 ? <EmptyState icon={Calendar} title="No appointments" /> : (
          <div className="space-y-1">
            {appointments.map(a => <div key={a.id} className="bg-white rounded-lg border p-3 text-sm">{a.reason} — {new Date(a.appointment_date).toLocaleString()}</div>)}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Pill className="w-4 h-4" /> Medications</h3>
        {meds.length === 0 ? <EmptyState icon={Pill} title="No medications" /> : (
          <div className="space-y-1">
            {meds.map(m => <div key={m.id} className="bg-white rounded-lg border p-3 text-sm">{m.medication_name} — {m.dosage}, {m.frequency}</div>)}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Emergency Contacts</h3>
        <div className="bg-white rounded-lg border p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Emergency Services</span><span className="font-medium">999</span></div>
          <div className="flex justify-between"><span>Nearest Hospital</span><span className="font-medium">Contact care team</span></div>
          <div className="flex justify-between"><span>Assigned CHP</span><span className="font-medium">Via app messaging</span></div>
        </div>
      </div>

      {aiExplain && (
        <AIRecommendation title="Care Explanation" content={typeof aiExplain === 'string' ? aiExplain : aiExplain.assessment || JSON.stringify(aiExplain)} agentName="community_intel_agent" confidence={0.9} />
      )}
    </div>
  );
}