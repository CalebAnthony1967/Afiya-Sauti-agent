import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState, EmptyState } from '@/components/States';
import { invokeAgent } from '@/lib/aiAgents';
import { Shield, Check, X } from 'lucide-react';

export default function InsuranceHome() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const [verifying, setVerifying] = useState(null);

  useEffect(() => {
    (async () => {
      try { setSessions(await base44.entities.TriageSession.list('-created_date', 50) || []); }
      finally { setLoading(false); }
    })();
  }, []);

  const verify = async (session) => {
    setVerifying(session.id);
    try {
      const res = await invokeAgent('insurance_agent', `Verify pre-claim for session: ${session.ai_response || session.symptoms_text}. Urgency: ${session.urgency_level}. Check against guidelines.`, {
        responseSchema: {
          type: 'object',
          properties: {
            verification_status: { type: 'string', enum: ['eligible', 'needs_review', 'ineligible'] },
            notes: { type: 'string' },
            confidence: { type: 'number' },
            citations: { type: 'array', items: { type: 'object' } },
          },
        },
      });
      setAiResult({ sessionId: session.id, ...res });
    } finally { setVerifying(null); }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Shield className="w-5 h-5" /> Pre-Claim Verification</h2>
      <p className="text-sm text-muted-foreground">AI-assisted verification against guidelines. Human review always required.</p>
      {sessions.length === 0 ? (
        <EmptyState icon={Shield} title="No claims to verify" />
      ) : (
        <div className="space-y-2">
          {sessions.map(s => (
            <div key={s.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.ai_response?.substring(0, 80) || s.symptoms_text?.substring(0, 80)}...</p>
                  <p className="text-xs text-muted-foreground mt-1">Urgency: {s.urgency_level} · {s.created_date ? new Date(s.created_date).toLocaleDateString() : ''}</p>
                </div>
                <button onClick={() => verify(s)} disabled={verifying === s.id} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-100 text-violet-700 text-sm font-medium min-h-[44px] disabled:opacity-50">
                  {verifying === s.id ? <LoadingState message="Verifying..." /> : 'AI Verify'}
                </button>
              </div>
              {aiResult?.sessionId === s.id && (
                <AIRecommendation
                  title={`Verification: ${aiResult.verification_status}`}
                  content={aiResult.notes}
                  confidence={aiResult.confidence}
                  agentName="insurance_agent"
                  citations={aiResult.citations || [{ source: 'WHO Guidelines', title: 'Coverage Criteria' }]}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}