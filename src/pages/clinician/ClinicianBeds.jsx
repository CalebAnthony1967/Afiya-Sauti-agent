import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { Building2 } from 'lucide-react';

export default function ClinicianBeds() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setFacilities(await base44.entities.Facility.list() || []); }
    finally { setLoading(false); }
  };

  const updateBeds = async (f, delta) => {
    const newOcc = Math.max(0, Math.min(f.bed_capacity, (f.beds_occupied || 0) + delta));
    await base44.entities.Facility.update(f.id, { beds_occupied: newOcc });
    load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Building2 className="w-5 h-5" /> Bed Management</h2>
      {facilities.length === 0 ? (
        <EmptyState icon={Building2} title="No facilities" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {facilities.map(f => {
            const pct = f.bed_capacity ? ((f.beds_occupied || 0) / f.bed_capacity) * 100 : 0;
            return (
              <div key={f.id} className="bg-white rounded-lg border p-4">
                <p className="font-medium text-sm">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.facility_type} · {f.county_code}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Beds: {f.beds_occupied || 0} / {f.bed_capacity}</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateBeds(f, -1)} className="flex-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm min-h-[44px]">− Admit Out</button>
                  <button onClick={() => updateBeds(f, 1)} className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm min-h-[44px]">+ Admit</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}