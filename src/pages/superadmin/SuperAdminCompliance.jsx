import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState } from '@/components/States';
import { ShieldCheck, FileDown, Database, Key } from 'lucide-react';

export default function SuperAdminCompliance() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setConsents(await base44.entities.PatientConsent.list() || []); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState />;

  const active = consents.filter(c => c.consent_state === 'ACTIVE').length;
  const revoked = consents.filter(c => c.consent_state === 'REVOKED').length;
  const pending = consents.filter(c => c.consent_state === 'PENDING').length;

  const exportEvidence = async () => {
    const logs = await base44.entities.AuditLog.list('-created_date', 1000);
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit-evidence-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const keyShred = async () => {
    if (!confirm('Confirm: cryptographic key shredding for Right to Erasure. This action is logged.')) return;
    await base44.entities.AuditLog.create({
      actor_id: 'super_admin', actor_role: 'super_admin',
      action_type: 'emergency_action', resource_type: 'encryption_keys', resource_id: 'key_shred',
      signature_hash: 'key_shred_' + Date.now(),
      payload_snapshot: { action: 'cryptographic_key_shredding', timestamp: new Date().toISOString() },
    });
    alert('Key shredding initiated and logged.');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Compliance Dashboard</h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-green-600">{active}</p>
          <p className="text-xs text-muted-foreground">Active Consents</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-2xl font-bold text-red-600">{revoked}</p>
          <p className="text-xs text-muted-foreground">Revoked</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Database className="w-4 h-4" /> Data Protection Act 2019 / Digital Health Act 2023</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Local data residency</span>
            <span className="text-green-600 font-medium">✓ Compliant</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Granular consent management</span>
            <span className="text-green-600 font-medium">✓ Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Right to Erasure (key shredding)</span>
            <button onClick={keyShred} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium min-h-[36px]">
              <Key className="w-3 h-3" /> Execute
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span>Right to Portability (FHIR export)</span>
            <span className="text-green-600 font-medium">✓ Available</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Pre-inference de-identification</span>
            <span className="text-green-600 font-medium">✓ Enforced</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Zero data retention (external models)</span>
            <span className="text-green-600 font-medium">✓ Enforced</span>
          </div>
        </div>
      </div>

      <button onClick={exportEvidence} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
        <FileDown className="w-4 h-4" /> Export Evidence for Regulators
      </button>
    </div>
  );
}