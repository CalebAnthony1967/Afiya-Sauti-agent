import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { Activity } from 'lucide-react';

export default function RegionalChp() {
  const [profiles, setProfiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, t] = await Promise.all([
          base44.entities.Profile.list('-created_date', 100),
          base44.entities.ChpTask.list('-created_date', 200),
        ]);
        setProfiles(p || []); setTasks(t || []);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState />;

  const chps = profiles.filter(p => p.role === 'chp');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Activity className="w-5 h-5" /> CHP Performance Metrics</h2>
      {chps.length === 0 ? <EmptyState icon={Activity} title="No CHPs" /> : (
        <div className="space-y-2">
          {chps.map(c => {
            const chpTasks = tasks.filter(t => t.chp_id === c.id);
            const completed = chpTasks.filter(t => t.status === 'completed').length;
            const rate = chpTasks.length ? Math.round(completed / chpTasks.length * 100) : 0;
            return (
              <div key={c.id} className="bg-white rounded-lg border p-4">
                <div className="flex justify-between mb-2">
                  <p className="font-medium text-sm">{c.full_name}</p>
                  <span className="text-sm font-bold">{rate}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${rate > 70 ? 'bg-green-500' : rate > 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{completed}/{chpTasks.length} tasks completed</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}