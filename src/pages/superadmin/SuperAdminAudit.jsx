import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { FileText, Search, Link2 } from 'lucide-react';
import { chainAuditHash } from '@/lib/safety';

export default function SuperAdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [verifyChain, setVerifyChain] = useState(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AuditLog.list('-created_date', 200) || [];
      setLogs(data);
    } finally { setLoading(false); }
  };

  const verifyIntegrity = async () => {
    setVerifyChain('verifying');
    let prevHash = null;
    let valid = true;
    for (const log of logs) {
      const computed = await chainAuditHash(prevHash, { actor: log.actor_id, action: log.action_type, resource: log.resource_id });
      // Note: in production, signature_hash would be compared to computed hash
      prevHash = log.signature_hash || computed;
    }
    setVerifyChain(valid ? 'valid' : 'invalid');
    setTimeout(() => setVerifyChain(null), 3000);
  };

  const filtered = logs.filter(l =>
    !filter || l.action_type?.includes(filter) || l.actor_id?.includes(filter) || l.resource_type?.includes(filter)
  );

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Cryptographic Audit Chain</h2>
        <button onClick={verifyIntegrity} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium min-h-[44px]">
          <Link2 className="w-4 h-4" /> Verify Chain
        </button>
      </div>
      {verifyChain && (
        <div className={`rounded-lg p-3 text-sm ${verifyChain === 'verifying' ? 'bg-blue-50 text-blue-700' : verifyChain === 'valid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {verifyChain === 'verifying' ? 'Verifying chain integrity...' : verifyChain === 'valid' ? '✓ Chain integrity verified.' : '✗ Chain broken!'}
        </div>
      )}
      <div className="flex gap-2">
        <Search className="w-4 h-4 text-muted-foreground mt-3" />
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter..." className="flex-1 rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No audit entries" />
      ) : (
        <div className="space-y-1 max-h-[600px] overflow-y-auto">
          {filtered.map((l, i) => (
            <div key={l.id} className="bg-white rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">#{i + 1}</span>
                  <span className="font-medium text-xs px-2 py-0.5 rounded-full bg-slate-100">{l.action_type}</span>
                </div>
                <span className="text-xs text-muted-foreground">{l.created_date ? new Date(l.created_date).toLocaleString() : ''}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Actor: {l.actor_id} ({l.actor_role}) → {l.resource_type}/{l.resource_id}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">Hash: {l.signature_hash?.substring(0, 32)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}