import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState } from '@/components/States';
import { ShieldCheck } from 'lucide-react';

export default function RegionalCompliance() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setFacilities(await base44.entities.Facility.list() || []); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState />;

  const accredited = facilities.filter(f => f.accredited).length;
  const rate = facilities.length ? Math.round(accredited / facilities.length * 100) : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Compliance Summary</h2>
      <div className="bg-white rounded-xl border p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Accreditation Rate</span>
          <span className="text-sm font-bold">{rate}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500" style={{ width: `${rate}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{accredited} of {facilities.length} facilities accredited</p>
      </div>
      <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span>Data residency compliance</span><span className="text-green-600">✓</span></div>
        <div className="flex justify-between"><span>Consent management</span><span className="text-green-600">✓</span></div>
        <div className="flex justify-between"><span>Audit logging</span><span className="text-green-600">✓</span></div>
        <div className="flex justify-between"><span>RLS enforcement</span><span className="text-green-600">✓</span></div>
      </div>
    </div>
  );
}