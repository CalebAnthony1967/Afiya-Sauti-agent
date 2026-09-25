import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { FileText, Search } from 'lucide-react';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setLogs(await base44.entities.AuditLog.list('-created_date', 100) || []); }
    finally { setLoading(false); }
  };

  const filtered = logs.filter(l =>
    !filter || l.action_type?.includes(filter) || l.actor_id?.includes(filter) || l.resource_type?.includes(filter)
  );

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Audit Log</h2>
      <div className="flex gap-2">
        <Search className="w-4 h-4 text-muted-foreground mt-3" />
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by action, actor, resource..." className="flex-1 rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No audit entries" />
      ) : (
        <div className="space-y-1">
          {filtered.map(l => (
            <div key={l.id} className="bg-white rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs px-2 py-0.5 rounded-full bg-slate-100">{l.action_type}</span>
                <span className="text-xs text-muted-foreground">{l.created_date ? new Date(l.created_date).toLocaleString() : ''}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Actor: {l.actor_id} · {l.resource_type}/{l.resource_id}</p>
              <p className="text-xs text-slate-500 mt-0.5">Hash: {l.signature_hash?.substring(0, 24)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}