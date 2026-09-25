import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState, EmptyState } from '@/components/States';
import { invokeAgent } from '@/lib/aiAgents';
import { Key, Plus, X, Copy, Code } from 'lucide-react';
import { saltedSha256, generateSalt } from '@/lib/safety';

export default function DeveloperHome() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ key_name: '', webhook_url: '' });
  const [newKey, setNewKey] = useState(null);
  const [aiCode, setAiCode] = useState(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setKeys(await base44.entities.ApiKey.list('-created_date', 50) || []); }
    finally { setLoading(false); }
  };

  const create = async () => {
    if (!form.key_name) return;
    // Generate API key
    const rawKey = 'ask_' + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
    const salt = generateSalt();
    const hash = await saltedSha256(rawKey, salt);
    const key = await base44.entities.ApiKey.create({
      key_name: form.key_name,
      key_prefix: rawKey.substring(0, 8),
      key_hash: hash,
      owner_id: 'self',
      scopes: ['triage:read', 'triage:write', 'fhir:read'],
      rate_limit_per_min: 60,
      webhook_url: form.webhook_url || null,
      active: true,
    });
    setNewKey(rawKey);
    setForm({ key_name: '', webhook_url: '' });
    setShowForm(false);
    load();
  };

  const toggleKey = async (k) => {
    await base44.entities.ApiKey.update(k.id, { active: !k.active });
    load();
  };

  const getCodeSample = async () => {
    const res = await invokeAgent('developer_agent', 'Generate a JavaScript code sample for calling the AfiyaSauti triage API with FHIR R4 output.');
    setAiCode(res);
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Key className="w-5 h-5" /> API Key Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'New Key'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <input type="text" placeholder="Key name" value={form.key_name} onChange={e => setForm({ ...form, key_name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
          <input type="text" placeholder="Webhook URL (optional)" value={form.webhook_url} onChange={e => setForm({ ...form, webhook_url: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
          <button onClick={create} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">Generate Key</button>
        </div>
      )}

      {newKey && (
        <div className="rounded-lg bg-green-50 border border-green-300 p-4">
          <p className="text-sm font-medium text-green-800">Your new API key (copy now — won't be shown again):</p>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 text-xs bg-white rounded px-3 py-2 border font-mono break-all">{newKey}</code>
            <button onClick={() => navigator.clipboard.writeText(newKey)} className="p-2 rounded-lg bg-green-100 text-green-700 min-h-[44px] min-w-[44px]"><Copy className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {keys.length === 0 ? (
        <EmptyState icon={Key} title="No API keys" />
      ) : (
        <div className="space-y-2">
          {keys.map(k => (
            <div key={k.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{k.key_name}</p>
                <p className="text-xs text-muted-foreground font-mono">{k.key_prefix}... · scopes: {(k.scopes || []).join(', ')}</p>
                {k.webhook_url && <p className="text-xs text-muted-foreground mt-1">Webhook: {k.webhook_url}</p>}
              </div>
              <button onClick={() => toggleKey(k)} className={`px-3 py-2 rounded-lg text-xs font-medium min-h-[36px] ${k.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{k.active ? 'Active' : 'Revoked'}</button>
            </div>
          ))}
        </div>
      )}

      <button onClick={getCodeSample} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-100 text-violet-700 text-sm font-medium min-h-[44px]">
        <Code className="w-4 h-4" /> Generate Code Sample
      </button>
      {aiCode && (
        <AIRecommendation title="Code Sample" content={typeof aiCode === 'string' ? `\`\`\`javascript\n${aiCode}\n\`\`\`` : JSON.stringify(aiCode)} agentName="developer_agent" confidence={0.95} />
      )}
    </div>
  );
}