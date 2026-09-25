import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { FileText, FileDown } from 'lucide-react';

export default function NgoReports() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setTasks(await base44.entities.ChpTask.list('-created_date', 200) || []); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState />;

  const completed = tasks.filter(t => t.status === 'completed').length;
  const escalated = tasks.filter(t => t.status === 'escalated').length;
  const completionRate = tasks.length ? Math.round(completed / tasks.length * 100) : 0;

  const exportReport = () => {
    const report = `# NGO Grant Report\n\nDate: ${new Date().toLocaleString()}\n\n## Summary\n- Total Tasks: ${tasks.length}\n- Completed: ${completed}\n- Escalated: ${escalated}\n- Completion Rate: ${completionRate}%\n`;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ngo-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Grant Reports</h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-4"><p className="text-2xl font-bold">{tasks.length}</p><p className="text-xs text-muted-foreground">Total Tasks</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-2xl font-bold text-green-600">{completed}</p><p className="text-xs text-muted-foreground">Completed</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-2xl font-bold text-amber-600">{completionRate}%</p><p className="text-xs text-muted-foreground">Completion Rate</p></div>
      </div>
      <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
        <FileDown className="w-4 h-4" /> Export Grant Report
      </button>
    </div>
  );
}