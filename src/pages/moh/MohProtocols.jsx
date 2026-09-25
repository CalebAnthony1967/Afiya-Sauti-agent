import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState, EmptyState } from '@/components/States';
import { invokeAgent } from '@/lib/aiAgents';
import { FileText, Plus, X, Send, Globe } from 'lucide-react';

export default function MohProtocols() {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', domain_module: 'general', content_text: '', source: 'moh_kenya' });
  const [aiImpact, setAiImpact] = useState(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setProtocols(await base44.entities.Protocol.list('-created_date', 50) || []); }
    finally { setLoading(false); }
  };

  const create = async () => {
    if (!form.title) return;
    const proto = await base44.entities.Protocol.create({
      ...form, published_by: 'self', status: 'published',
      published_at: new Date().toISOString(),
    });
    // Generate AI impact summary
    try {
      const res = await invokeAgent('moh_protocol_agent', `Summarize the impact of this protocol: ${form.title} - ${form.description}`);
      await base44.entities.Protocol.update(proto.id, { ai_impact_summary: typeof res === 'string' ? res : res.assessment || JSON.stringify(res) });
    } catch (e) { console.error(e); }
    setForm({ title: '', description: '', domain_module: 'general', content_text: '', source: 'moh_kenya' });
    setShowForm(false); load();
  };

  const distribute = async (p) => {
    await base44.entities.Protocol.update(p.id, { push_sent: true });
    await base44.entities.AuditLog.create({
      actor_id: 'moh_admin', actor_role: 'moh_admin',
      action_type: 'admin_action', resource_type: 'protocol', resource_id: p.id,
      signature_hash: 'protocol_push_' + Date.now(),
      payload_snapshot: { action: 'push_distribution' },
    });
    alert('Protocol pushed to facilities and CHPs.');
    load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Protocol Distribution</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'New Protocol'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <input type="text" placeholder="Protocol title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.domain_module} onChange={e => setForm({ ...form, domain_module: e.target.value })} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
              <option value="maternal_child">Maternal & Child</option>
              <option value="ncd">NCD</option>
              <option value="infectious">Infectious</option>
              <option value="mental_health">Mental Health</option>
              <option value="emergency">Emergency</option>
              <option value="general">General</option>
            </select>
            <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
              <option value="moh_kenya">MoH Kenya</option>
              <option value="who">WHO</option>
              <option value="imci">IMCI</option>
              <option value="approved_guideline">Approved Guideline</option>
            </select>
          </div>
          <textarea placeholder="Protocol content" value={form.content_text} onChange={e => setForm({ ...form, content_text: e.target.value })} rows={4} className="w-full rounded-lg border px-3 py-2 text-sm resize-none" />
          <button onClick={create} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">Publish Protocol</button>
        </div>
      )}

      {protocols.length === 0 ? (
        <EmptyState icon={FileText} title="No protocols" />
      ) : (
        <div className="space-y-2">
          {protocols.map(p => (
            <div key={p.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.source} · {p.domain_module} · v{p.version_number || '1.0'}</p>
                  {p.ai_impact_summary && (
                    <AIRecommendation title="Impact Summary" content={p.ai_impact_summary} agentName="moh_protocol_agent" confidence={0.9} />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{p.status}</span>
                  {p.status === 'published' && !p.push_sent && (
                    <button onClick={() => distribute(p)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium min-h-[36px]">
                      <Send className="w-3 h-3" /> Push
                    </button>
                  )}
                  {p.push_sent && <span className="text-xs text-green-600 flex items-center gap-1"><Globe className="w-3 h-3" /> Distributed</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}