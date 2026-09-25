import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AIRecommendation from '@/components/AIRecommendation';
import UrgencyBadge from '@/components/UrgencyBadge';
import { LoadingState, EmptyState } from '@/components/States';
import { invokeAgent } from '@/lib/aiAgents';
import { Home, Check, AlertTriangle, ArrowUpRight, RefreshCw, MapPin } from 'lucide-react';

export default function ChpHome() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiHelp, setAiHelp] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      /*
      // SUPABASE: supabase.from('chp_tasks').select('*').eq('chp_id', userId).order('priority')
      */
      setTasks(await base44.entities.ChpTask.list('-created_date', 50) || []);
    } finally { setLoading(false); }
  };

  const complete = async (task) => {
    await base44.entities.ChpTask.update(task.id, { status: 'completed', completed_at: new Date().toISOString() });
    load();
  };

  const escalate = async (task) => {
    await base44.entities.ChpTask.update(task.id, { status: 'escalated' });
    load();
  };

  const getGuidance = async (task) => {
    setSelectedTask(task);
    setAiLoading(true);
    try {
      const result = await invokeAgent('chp_guide_agent', `Condition: ${task.task_type}. Description: ${task.description}. Provide step-by-step IMCI guidance.`);
      setAiHelp(result);
    } finally { setAiLoading(false); }
  };

  if (loading) return <LoadingState message="Loading tasks..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Home className="w-5 h-5" /> Task List</h2>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border text-sm min-h-[44px]">
          <RefreshCw className="w-4 h-4" /> Sync
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState icon={Home} title="No tasks assigned" description="New tasks will appear here." />
      ) : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      t.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      t.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{t.priority}</span>
                    <span className="text-xs text-muted-foreground capitalize">{t.task_type.replace('_', ' ')}</span>
                    {t.sync_status === 'pending' && <span className="text-xs text-amber-600">● Offline</span>}
                  </div>
                  <p className="text-sm">{t.description}</p>
                  {t.due_date && <p className="text-xs text-muted-foreground mt-1">Due: {new Date(t.due_date).toLocaleDateString()}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  t.status === 'completed' ? 'bg-green-100 text-green-700' :
                  t.status === 'escalated' ? 'bg-red-100 text-red-700' :
                  t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{t.status}</span>
              </div>
              {t.status !== 'completed' && t.status !== 'escalated' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => getGuidance(t)} className="flex-1 px-3 py-2 rounded-lg bg-violet-100 text-violet-700 text-sm font-medium min-h-[44px]">AI Guidance</button>
                  <button onClick={() => complete(t)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium min-h-[44px]"><Check className="w-4 h-4" /> Done</button>
                  <button onClick={() => escalate(t)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium min-h-[44px]"><ArrowUpRight className="w-4 h-4" /> Escalate</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedTask && aiLoading && <LoadingState message="Getting grounded guidance..." />}
      {selectedTask && aiHelp && !aiLoading && (
        <AIRecommendation
          title="CHP Guidance"
          content={typeof aiHelp === 'string' ? aiHelp : aiHelp.assessment || JSON.stringify(aiHelp)}
          agentName="chp_guide_agent"
          confidence={0.9}
          citations={[{ source: 'IMCI', title: 'Kenya MoH CHV Manual' }]}
        />
      )}
    </div>
  );
}