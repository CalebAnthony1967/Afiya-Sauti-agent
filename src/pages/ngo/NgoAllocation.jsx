import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState, EmptyState } from '@/components/States';
import { invokeAgent } from '@/lib/aiAgents';
import { Users, TrendingUp } from 'lucide-react';

export default function NgoAllocation() {
  const [profiles, setProfiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, t] = await Promise.all([
          base44.entities.Profile.list('-created_date', 100),
          base44.entities.ChpTask.list('-created_date', 100),
        ]);
        setProfiles(p || []); setTasks(t || []);
      } finally { setLoading(false); }
    })();
    invokeAgent('admin_assist_agent', 'Suggest CHP allocation based on current workload distribution.').then(setAiSuggestion).catch(() => {});
  }, []);

  if (loading) return <LoadingState />;

  const chps = profiles.filter(p => p.role === 'chp');
  const workload = chps.map(c => ({
    chp: c,
    tasks: tasks.filter(t => t.chp_id === c.id).length,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="w-5 h-5" /> CHP Allocation</h2>
      {aiSuggestion && (
        <AIRecommendation title="Allocation Suggestion" content={typeof aiSuggestion === 'string' ? aiSuggestion : aiSuggestion.assessment || JSON.stringify(aiSuggestion)} agentName="admin_assist_agent" confidence={0.8} />
      )}
      {chps.length === 0 ? (
        <EmptyState icon={Users} title="No CHPs" />
      ) : (
        <div className="space-y-2">
          {workload.map(w => (
            <div key={w.chp.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{w.chp.full_name}</p>
                <p className="text-xs text-muted-foreground">{w.chp.county_code || 'No county'} · {w.chp.community_unit_id || 'No unit'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{w.tasks}</p>
                <p className="text-xs text-muted-foreground">tasks</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}