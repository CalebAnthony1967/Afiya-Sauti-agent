import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { TrendingUp } from 'lucide-react';

export default function ResearchSignals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setSignals(await base44.entities.OutbreakSignal.list('-detected_at', 50) || []); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Outbreak Signal Review</h2>
      {signals.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No signals detected" />
      ) : (
        <div className="space-y-2">
          {signals.map(s => (
            <div key={s.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.severity === 'outbreak' ? 'bg-red-100 text-red-700' : s.severity === 'alert' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{s.severity}</span>
                <span className="text-xs text-muted-foreground capitalize">{s.signal_type} · {s.county_code}</span>
              </div>
              <p className="text-sm">Cases: {s.case_count} · Baseline: {s.baseline_count} · PSI: {s.psi_drift?.toFixed(3) || 'N/A'}</p>
              <p className="text-xs text-muted-foreground mt-1">Status: {s.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}