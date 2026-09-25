import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { Cpu, Power, PowerOff, Activity } from 'lucide-react';

export default function SuperAdminAI() {
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const [l, m] = await Promise.all([
        base44.entities.AgentActivityLog.list('-created_date', 50),
        base44.entities.AIInferenceMetric.list('-created_date', 50),
      ]);
      setLogs(l || []);
      setAgents(m || []);
    } finally { setLoading(false); }
  };

  const agentNames = ['triage_agent', 'scribe_agent', 'chp_guide_agent', 'moh_protocol_agent', 'research_agent', 'insurance_agent', 'training_agent', 'community_intel_agent', 'admin_assist_agent', 'super_admin_agent', 'developer_agent'];

  const toggleAgent = async (name, disable) => {
    await base44.entities.AuditLog.create({
      actor_id: 'super_admin', actor_role: 'super_admin',
      action_type: 'admin_action', resource_type: 'ai_agent', resource_id: name,
      signature_hash: 'agent_toggle_' + Date.now(),
      payload_snapshot: { action: disable ? 'disable' : 'enable', agent: name },
    });
    alert(`${name} ${disable ? 'disabled' : 'enabled'} — logged.`);
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Cpu className="w-5 h-5" /> AI Agent Control</h2>
      <p className="text-sm text-muted-foreground">Review, limit, temporarily disable, or permanently reconfigure any AI agent or RAG collection.</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {agentNames.map(name => {
          const count = agents.filter(a => a.agent_name === name).length || logs.filter(l => l.agent_name === name).length;
          return (
            <div key={name} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm capitalize">{name.replace('_', ' ')}</p>
                <span className="text-xs text-muted-foreground">{count} calls</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleAgent(name, true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium min-h-[36px]">
                  <PowerOff className="w-3 h-3" /> Disable
                </button>
                <button onClick={() => toggleAgent(name, false)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium min-h-[36px]">
                  <Power className="w-3 h-3" /> Enable
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Activity className="w-4 h-4" /> Recent AI Activity</h3>
        {logs.length === 0 ? (
          <EmptyState icon={Activity} title="No AI activity logged" />
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.map(l => (
              <div key={l.id} className="bg-white rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs capitalize">{l.agent_name?.replace('_', ' ')}</span>
                  <span className="text-xs text-muted-foreground">{l.created_date ? new Date(l.created_date).toLocaleString() : ''}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{l.agent_action}</p>
                {l.guardrail_triggered && <p className="text-xs text-red-600 mt-1">⚠ Guardrail triggered</p>}
                {l.confidence_score != null && <p className="text-xs text-muted-foreground mt-0.5">Confidence: {(l.confidence_score * 100).toFixed(0)}%</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}