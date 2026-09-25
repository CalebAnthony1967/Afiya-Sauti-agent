import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { FileText } from 'lucide-react';

export default function InsuranceAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setLogs((await base44.entities.AuditLog.list('-created_date', 100) || []).filter(l => l.actor_role === 'insurance' || l.resource_type === 'triage_session')); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Query Audit Log</h2>
      {logs.length === 0 ? (
        <EmptyState icon={FileText} title="No queries logged" />
      ) : (
        <div className="space-y-1">
          {logs.map(l => (
            <div key={l.id} className="bg-white rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-xs px-2 py-0.5 rounded-full bg-slate-100">{l.action_type}</span>
                <span className="text-xs text-muted-foreground">{l.created_date ? new Date(l.created_date).toLocaleString() : ''}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{l.resource_type}/{l.resource_id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}