import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState, EmptyState } from '@/components/States';
import { invokeAgent } from '@/lib/aiAgents';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export default function MohOutbreaks() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    (async () => {
      try { setSignals(await base44.entities.OutbreakSignal.list('-detected_at', 50) || []); }
      finally { setLoading(false); }
    })();
    invokeAgent('moh_protocol_agent', 'Summarize current outbreak signals and recommend actions.').then(setAiSummary).catch(() => {});
  }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.OutbreakSignal.update(id, { status });
    setSignals(s => s.map(x => x.id === id ? { ...x, status } : x));
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Outbreak Detection</h2>

      {aiSummary && (
        <AIRecommendation title="Outbreak Analysis" content={typeof aiSummary === 'string' ? aiSummary : aiSummary.assessment || JSON.stringify(aiSummary)} agentName="moh_protocol_agent" confidence={0.85} citations={[{ source: 'WHO', title: 'Outbreak Surveillance' }]} />
      )}

      {signals.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No outbreak signals" description="All clear — no anomalies detected." />
      ) : (
        <div className="space-y-2">
          {signals.map(s => (
            <div key={s.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.severity === 'outbreak' ? 'bg-red-100 text-red-700' :
                      s.severity === 'alert' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{s.severity}</span>
                    <span className="text-xs text-muted-foreground capitalize">{s.signal_type}</span>
                    <span className="text-xs text-muted-foreground">{s.county_code}</span>
                  </div>
                  <p className="text-sm">Cases: {s.case_count} (baseline: {s.baseline_count})</p>
                  {s.psi_drift != null && <p className="text-xs text-muted-foreground mt-1">PSI Drift: {s.psi_drift.toFixed(3)}</p>}
                  {s.ai_summary && <p className="text-xs text-slate-600 mt-1">{s.ai_summary}</p>}
                </div>
                <select value={s.status} onChange={e => updateStatus(s.id, e.target.value)} className="rounded-lg border px-2 py-1 text-xs min-h-[36px]">
                  <option value="detected">Detected</option>
                  <option value="investigating">Investigating</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}