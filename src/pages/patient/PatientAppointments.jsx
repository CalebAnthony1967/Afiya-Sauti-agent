import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { Calendar, Plus, X } from 'lucide-react';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reason: '', appointment_date: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Appointment.list('-appointment_date', 50);
      setAppointments(data || []);
    } finally { setLoading(false); }
  };

  const create = async () => {
    if (!form.reason || !form.appointment_date) return;
    await base44.entities.Appointment.create({
      ...form,
      appointment_date: new Date(form.appointment_date).toISOString(),
      status: 'scheduled',
    });
    setForm({ reason: '', appointment_date: '' });
    setShowForm(false);
    load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Appointments
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <input
            type="text" placeholder="Reason for visit"
            value={form.reason}
            onChange={e => setForm({ ...form, reason: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]"
          />
          <input
            type="datetime-local"
            value={form.appointment_date}
            onChange={e => setForm({ ...form, appointment_date: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]"
          />
          <button onClick={create} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
            Schedule Appointment
          </button>
        </div>
      )}

      {appointments.length === 0 ? (
        <EmptyState icon={Calendar} title="No appointments" description="Schedule a new appointment to get started." />
      ) : (
        <div className="space-y-2">
          {appointments.map(a => (
            <div key={a.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{a.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(a.appointment_date).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  a.status === 'completed' ? 'bg-green-100 text-green-700' :
                  a.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}