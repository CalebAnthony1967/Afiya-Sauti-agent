import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { ShieldCheck, Check } from 'lucide-react';

export default function MohAccreditation() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setFacilities(await base44.entities.Facility.list() || []); }
    finally { setLoading(false); }
  };

  const toggle = async (f) => {
    await base44.entities.Facility.update(f.id, {
      accredited: !f.accredited,
      accreditation_date: !f.accredited ? new Date().toISOString().split('T')[0] : null,
    });
    await base44.entities.AuditLog.create({
      actor_id: 'moh_admin', actor_role: 'moh_admin',
      action_type: 'admin_action', resource_type: 'facility', resource_id: f.id,
      signature_hash: 'accreditation_' + Date.now(),
      payload_snapshot: { accredited: !f.accredited },
    });
    load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Facility Accreditation</h2>
      {facilities.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No facilities" />
      ) : (
        <div className="space-y-2">
          {facilities.map(f => (
            <div key={f.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.facility_type} · {f.county_code} · Beds: {f.beds_occupied || 0}/{f.bed_capacity}</p>
                {f.accredited && <p className="text-xs text-green-600 mt-1">Accredited: {f.accreditation_date ? new Date(f.accreditation_date).toLocaleDateString() : ''}</p>}
              </div>
              <button onClick={() => toggle(f)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] ${f.accredited ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                <Check className="w-4 h-4" /> {f.accredited ? 'Accredited' : 'Accredit'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}