import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, Plus, X } from 'lucide-react';

export default function DeveloperWebhooks() {
  const [webhooks, setWebhooks] = useState([
    { id: '1', url: 'https://example.com/webhook/triage', events: ['triage.completed', 'red_flag.detected'], active: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ url: '', events: 'triage.completed' });

  const add = () => {
    if (!form.url) return;
    setWebhooks(w => [...w, { id: Date.now().toString(), url: form.url, events: form.events.split(','), active: true }]);
    setForm({ url: '', events: 'triage.completed' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Globe className="w-5 h-5" /> Webhook Configuration</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'Add Webhook'}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <input type="text" placeholder="Webhook URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
          <input type="text" placeholder="Events (comma-separated)" value={form.events} onChange={e => setForm({ ...form, events: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
          <button onClick={add} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">Add Webhook</button>
        </div>
      )}
      <div className="space-y-2">
        {webhooks.map(w => (
          <div key={w.id} className="bg-white rounded-lg border p-4">
            <p className="text-sm font-medium font-mono">{w.url}</p>
            <p className="text-xs text-muted-foreground mt-1">Events: {w.events.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}