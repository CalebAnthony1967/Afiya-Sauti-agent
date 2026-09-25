import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { MessageSquare, Send } from 'lucide-react';

export default function PatientMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setMessages(await base44.entities.SecureMessage.list('-created_date', 50) || []); }
    finally { setLoading(false); }
  };

  const send = async () => {
    if (!body.trim()) return;
    await base44.entities.SecureMessage.create({
      sender_id: 'self', recipient_id: 'clinician', body, subject: 'Patient message',
      sender_role: 'patient', recipient_role: 'clinician',
    });
    setBody('');
    load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Secure Messages</h2>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Type a secure message to your care team..." rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none" />
        <button onClick={send} className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
          <Send className="w-4 h-4" /> Send
        </button>
      </div>
      {messages.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages" />
      ) : (
        <div className="space-y-2">
          {messages.map(m => (
            <div key={m.id} className={`rounded-lg border p-4 ${m.sender_id === 'self' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
              <p className="text-sm">{m.body}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(m.created_date).toLocaleString()} · {m.sender_role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}