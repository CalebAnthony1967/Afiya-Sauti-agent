import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { LifeBuoy, Plus, X } from 'lucide-react';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium', category: 'technical' });

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setTickets(await base44.entities.SupportTicket.list('-created_date', 50) || []); }
    finally { setLoading(false); }
  };

  const create = async () => {
    await base44.entities.SupportTicket.create({ ...form, submitted_by: 'self', status: 'open' });
    setForm({ subject: '', description: '', priority: 'medium', category: 'technical' });
    setShowForm(false); load();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.SupportTicket.update(id, { status, resolved_at: status === 'resolved' ? new Date().toISOString() : undefined });
    load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><LifeBuoy className="w-5 h-5" /> Support Tickets</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'New'}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
              <option value="technical">Technical</option><option value="access">Access</option><option value="data">Data</option><option value="billing">Billing</option>
            </select>
          </div>
          <button onClick={create} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">Create Ticket</button>
        </div>
      )}
      {tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No tickets" />
      ) : (
        <div className="space-y-2">
          {tickets.map(t => (
            <div key={t.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{t.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                </div>
                <div className="flex gap-1">
                  {['open', 'in_progress', 'resolved'].map(st => (
                    <button key={st} onClick={() => updateStatus(t.id, st)} className={`px-2 py-1 rounded text-xs font-medium min-h-[36px] ${t.status === st ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-600'}`}>{st.replace('_', ' ')}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}