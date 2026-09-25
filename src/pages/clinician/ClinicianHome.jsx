import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import UrgencyBadge from '@/components/UrgencyBadge';
import { LoadingState, EmptyState } from '@/components/States';
import { Activity, Send, ArrowUpRight, Clock } from 'lucide-react';

export default function ClinicianHome() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.TriageSession.list('-created_date', 50);
      // Sort by urgency: RED > YELLOW > GREEN
      const order = { RED: 0, YELLOW: 1, GREEN: 2, UNCERTAIN_EDGE_TRIAGE: 0 };
      setSessions((data || []).sort((a, b) => (order[a.urgency_level] ?? 3) - (order[b.urgency_level] ?? 3)));
    } finally { setLoading(false); }
  };

  const dispatchChp = async (session) => {
    await base44.entities.ChpDispatch.create({
      session_id: session.id,
      chp_id: session.profile_id,
      reason: session.ai_response || 'Triage escalation',
      red_flag: session.red_flag_detected,
      first_aid_instructions: session.red_flag_details || 'Provide standard first aid',
      dispatch_status: 'sent',
      dispatched_at: new Date().toISOString(),
    });
    alert('CHP dispatched successfully.');
  };

  if (loading) return <LoadingState message="Loading triage queue..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Activity className="w-5 h-5" /> Intake Queue (eCHIS-style)</h2>
      <p className="text-sm text-muted-foreground">Sorted by urgency. Red cases first.</p>

      {sessions.length === 0 ? (
        <EmptyState icon={Activity} title="Queue empty" description="Triage sessions will appear here sorted by urgency." />
      ) : (
        <div className="space-y-2">
          {sessions.map(s => (
            <div key={s.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <UrgencyBadge level={s.urgency_level} size="sm" />
                    <span className="text-xs text-muted-foreground capitalize">{s.domain_module?.replace('_', ' ')}</span>
                    <span className="text-xs text-muted-foreground">· {s.channel}</span>
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{new Date(s.created_date).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-slate-700">{s.ai_response || s.symptoms_text}</p>
                  {s.icd11_codes?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">ICD-11: {s.icd11_codes.join(', ')}</p>
                  )}
                  {s.confidence_score != null && (
                    <p className="text-xs text-muted-foreground mt-1">Confidence: {(s.confidence_score * 100).toFixed(0)}%</p>
                  )}
                </div>
                <button onClick={() => dispatchChp(s)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium min-h-[44px]">
                  <Send className="w-4 h-4" /> Dispatch CHP
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}