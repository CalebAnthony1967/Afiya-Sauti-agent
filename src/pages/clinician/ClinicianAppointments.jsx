import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { Calendar, Plus, X } from 'lucide-react';

export default function ClinicianAppointments() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reason: '', appointment_date: '' });

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setAppts(await base44.entities.Appointment.list('-appointment_date', 50) || []); }
    finally { setLoading(false); }
  };

  const create = async () => {
    await base44.entities.Appointment.create({ ...form, appointment_date: new Date(form.appointment_date).toISOString(), status: 'scheduled' });
    setForm({ reason: '', appointment_date: '' }); setShowForm(false); load();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.Appointment.update(id, { status }); load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Calendar className="w-5 h-5" /> Appointments</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'New'}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <input type="text" placeholder="Reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
          <input type="datetime-local" value={form.appointment_date} onChange={e => setForm({ ...form, appointment_date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
          <button onClick={create} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">Schedule</button>
        </div>
      )}
      {appts.length === 0 ? (
        <EmptyState icon={Calendar} title="No appointments" />
      ) : (
        <div className="space-y-2">
          {appts.map(a => (
            <div key={a.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{a.reason}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.appointment_date).toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                {['confirmed', 'completed', 'cancelled'].map(st => (
                  <button key={st} onClick={() => updateStatus(a.id, st)} className={`px-2 py-1 rounded text-xs font-medium min-h-[36px] ${a.status === st ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600'}`}>{st}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}