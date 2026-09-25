import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState, EmptyState } from '@/components/States';
import { invokeAgent } from '@/lib/aiAgents';
import { TrendingUp, Users, FileText, Plus, X } from 'lucide-react';

export default function NgoHome() {
  const [tasks, setTasks] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', priority: 'medium', task_type: 'visit' });

  useEffect(() => {
    (async () => {
      try {
        const [t, p] = await Promise.all([
          base44.entities.ChpTask.list('-created_date', 50),
          base44.entities.Profile.list('-created_date', 50),
        ]);
        setTasks(t || []); setProfiles(p || []);
      } finally { setLoading(false); }
    })();
    invokeAgent('admin_assist_agent', 'Summarize current NGO campaign status and CHP workload distribution.').then(setAiSummary).catch(() => {});
  }, []);

  const createCampaign = async () => {
    if (!form.description) return;
    await base44.entities.ChpTask.create({ ...form, chp_id: 'ngo_campaign', status: 'assigned' });
    setForm({ description: '', priority: 'medium', task_type: 'visit' });
    setShowForm(false);
    setTasks(await base44.entities.ChpTask.list('-created_date', 50) || []);
  };

  if (loading) return <LoadingState />;

  const chps = profiles.filter(p => p.role === 'chp');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Campaigns</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'New Campaign'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <textarea placeholder="Campaign description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
            <select value={form.task_type} onChange={e => setForm({ ...form, task_type: e.target.value })} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
              <option value="visit">Visit</option><option value="education">Education</option><option value="follow_up">Follow-up</option>
            </select>
          </div>
          <button onClick={createCampaign} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">Create Campaign</button>
        </div>
      )}

      {aiSummary && (
        <AIRecommendation title="Campaign Summary" content={typeof aiSummary === 'string' ? aiSummary : aiSummary.assessment || JSON.stringify(aiSummary)} agentName="admin_assist_agent" confidence={0.85} />
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-4"><p className="text-2xl font-bold">{tasks.length}</p><p className="text-xs text-muted-foreground">Active Tasks</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-2xl font-bold">{chps.length}</p><p className="text-xs text-muted-foreground">CHPs</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
      </div>

      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Recent Campaign Tasks</h3>
        {tasks.length === 0 ? <EmptyState icon={FileText} title="No tasks" /> : (
          <div className="space-y-1">
            {tasks.slice(0, 10).map(t => (
              <div key={t.id} className="bg-white rounded-lg border p-3 text-sm flex justify-between">
                <span>{t.description}</span>
                <span className="text-xs text-muted-foreground">{t.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}