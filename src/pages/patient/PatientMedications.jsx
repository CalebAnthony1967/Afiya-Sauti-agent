import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import AdherenceTracker from '@/components/patient/AdherenceTracker';
import { Pill, Plus, X, Stethoscope } from 'lucide-react';

export default function PatientMedications() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    medication_name: '', dosage: '', frequency: '', route: 'oral',
    start_date: '', end_date: '', prescribed_by: '', notes: '',
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setMeds(await base44.entities.MedicationRegimen.list('-created_date', 50) || []); }
    finally { setLoading(false); }
  };

  const create = async () => {
    if (!form.medication_name || !form.dosage) return;
    await base44.entities.MedicationRegimen.create({
      ...form,
      active: true,
      profile_id: 'self',
      start_date: form.start_date || new Date().toISOString().split('T')[0],
    });
    setForm({ medication_name: '', dosage: '', frequency: '', route: 'oral', start_date: '', end_date: '', prescribed_by: '', notes: '' });
    setShowForm(false);
    load();
  };

  if (loading) return <LoadingState message="Loading medications..." />;

  const activeMeds = meds.filter(m => m.active);
  const inactiveMeds = meds.filter(m => !m.active);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Medications & Adherence</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeMeds.length} active regimen(s). Signed by certified clinician — AI provides adherence reminders only.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-900 text-sm font-medium min-h-[44px]"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Medication'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold">New Medication Regimen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Medication name (e.g. Amlodipine)" value={form.medication_name}
              onChange={e => setForm({ ...form, medication_name: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
            <input type="text" placeholder="Dosage (e.g. 5mg)" value={form.dosage}
              onChange={e => setForm({ ...form, dosage: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
            <input type="text" placeholder="Frequency (e.g. 1x daily morning)" value={form.frequency}
              onChange={e => setForm({ ...form, frequency: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
            <input type="text" placeholder="Prescribed by (e.g. Dr. A. Omondi)" value={form.prescribed_by}
              onChange={e => setForm({ ...form, prescribed_by: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
            <select value={form.route} onChange={e => setForm({ ...form, route: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]">
              <option value="oral">Oral</option>
              <option value="topical">Topical</option>
              <option value="injection">Injection</option>
              <option value="inhalation">Inhalation</option>
              <option value="sublingual">Sublingual</option>
              <option value="other">Other</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" placeholder="Start date" value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
              <input type="date" placeholder="End date (optional)" value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
            </div>
          </div>
          <textarea placeholder="Notes (e.g. take after meals)" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none" />
          <button onClick={create}
            className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
            Save Medication Regimen
          </button>
        </div>
      )}

      {/* Active Medications with Adherence */}
      {activeMeds.length === 0 && !showForm ? (
        <EmptyState icon={Pill} title="No active medications" description="Add your prescribed medications to track adherence and get reminders." />
      ) : (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-500" /> Active Regimens & Adherence Tracking
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMeds.map(m => (
              <AdherenceTracker key={m.id} regimen={m} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Medications */}
      {inactiveMeds.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Inactive Regimens</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inactiveMeds.map(m => (
              <div key={m.id} className="bg-white rounded-lg border border-slate-200 p-4 opacity-60">
                <p className="font-medium text-sm">{m.medication_name}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.dosage} · {m.frequency} · {m.route}</p>
                {m.start_date && <p className="text-xs text-muted-foreground mt-1">Started: {new Date(m.start_date).toLocaleDateString()}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}