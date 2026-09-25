import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState, EmptyState } from '@/components/States';
import { invokeAgent } from '@/lib/aiAgents';
import { Building2, Activity, TrendingUp, ShieldCheck } from 'lucide-react';

export default function RegionalHome() {
  const [facilities, setFacilities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [f, t] = await Promise.all([
          base44.entities.Facility.list(),
          base44.entities.ChpTask.list('-created_date', 100),
        ]);
        setFacilities(f || []); setTasks(t || []);
      } finally { setLoading(false); }
    })();
    invokeAgent('admin_assist_agent', 'Summarize regional facility performance and highlight anomalies.').then(setAiSummary).catch(() => {});
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Building2 className="w-5 h-5" /> Regional Overview</h2>
      {aiSummary && (
        <AIRecommendation title="Performance Summary" content={typeof aiSummary === 'string' ? aiSummary : aiSummary.assessment || JSON.stringify(aiSummary)} agentName="admin_assist_agent" confidence={0.85} citations={[{ source: 'Regional Data', title: 'Aggregated Metrics' }]} />
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4"><Building2 className="w-5 h-5 text-blue-600 mb-1" /><p className="text-2xl font-bold">{facilities.length}</p><p className="text-xs text-muted-foreground">Facilities</p></div>
        <div className="bg-white rounded-xl border p-4"><Activity className="w-5 h-5 text-green-600 mb-1" /><p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p><p className="text-xs text-muted-foreground">Tasks Done</p></div>
        <div className="bg-white rounded-xl border p-4"><TrendingUp className="w-5 h-5 text-amber-600 mb-1" /><p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
        <div className="bg-white rounded-xl border p-4"><ShieldCheck className="w-5 h-5 text-violet-600 mb-1" /><p className="text-2xl font-bold">{facilities.filter(f => f.accredited).length}</p><p className="text-xs text-muted-foreground">Accredited</p></div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Facilities</h3>
        {facilities.length === 0 ? <EmptyState icon={Building2} title="No facilities" /> : (
          <div className="space-y-1">
            {facilities.map(f => (
              <div key={f.id} className="bg-white rounded-lg border p-3 text-sm flex justify-between">
                <span>{f.name} · {f.facility_type}</span>
                <span className="text-xs text-muted-foreground">Beds: {f.beds_occupied || 0}/{f.bed_capacity}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}