import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { Building2, Plus, X } from 'lucide-react';

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', facility_type: 'dispensary', county_code: '', sub_county: '', bed_capacity: 0 });

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setFacilities(await base44.entities.Facility.list() || []); }
    finally { setLoading(false); }
  };

  const create = async () => {
    if (!form.name || !form.county_code) return;
    await base44.entities.Facility.create({ ...form, active: true });
    setForm({ name: '', facility_type: 'dispensary', county_code: '', sub_county: '', bed_capacity: 0 });
    setShowForm(false); load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Building2 className="w-5 h-5" /> Facilities</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'Add'}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <input type="text" placeholder="Facility name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
          <select value={form.facility_type} onChange={e => setForm({ ...form, facility_type: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]">
            <option value="dispensary">Dispensary</option>
            <option value="health_center">Health Center</option>
            <option value="county_hospital">County Hospital</option>
            <option value="referral_hospital">Referral Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="ngo_site">NGO Site</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="County code" value={form.county_code} onChange={e => setForm({ ...form, county_code: e.target.value })} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
            <input type="text" placeholder="Sub-county" value={form.sub_county} onChange={e => setForm({ ...form, sub_county: e.target.value })} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
          </div>
          <input type="number" placeholder="Bed capacity" value={form.bed_capacity} onChange={e => setForm({ ...form, bed_capacity: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
          <button onClick={create} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">Add Facility</button>
        </div>
      )}
      {facilities.length === 0 ? (
        <EmptyState icon={Building2} title="No facilities" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {facilities.map(f => (
            <div key={f.id} className="bg-white rounded-lg border p-4">
              <p className="font-medium text-sm">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.facility_type} · {f.county_code}</p>
              <p className="text-xs text-muted-foreground mt-1">Beds: {f.beds_occupied || 0}/{f.bed_capacity} · {f.accredited ? '✓ Accredited' : 'Not accredited'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}