import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import {
  HeartPulse, Check, MapPin, Clock, Plus, RefreshCw, Wifi, WifiOff,
  Home, ClipboardList, TrendingUp,
} from 'lucide-react';

/**
 * CHP Visit Tracker — Daily field visit logging with household task completion.
 * Ported from GitHub CHPFieldPortal: offline mode, sync, visit notes, task completion.
 *
 * SUPABASE ALTERNATIVE:
 * Table: chp_visits (id, chp_id, household_id, visit_type, notes, priority,
 *   visit_date, completed, sync_status, created_at)
 * RLS: policy WHERE chp_id = auth.uid()
 * Offline: use Supabase local-first with PowerSync / ElectricSQL
 */
const VISIT_TYPES = [
  { value: 'home_visit', label: 'Home Visit' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'vital_check', label: 'Vital Check' },
  { value: 'education', label: 'Health Education' },
  { value: 'medication_delivery', label: 'Medication Delivery' },
  { value: 'antenatal', label: 'Antenatal Check' },
  { value: 'child_welfare', label: 'Child Welfare' },
];

export default function VisitTracker() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({
    task_type: 'home_visit', description: '', priority: 'medium',
    due_date: new Date().toISOString().split('T')[0], household_id: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      /*
      // SUPABASE: const { data } = await supabase.from('chp_tasks')
      //   .select('*').eq('chp_id', userId).order('created_at', { ascending: false }).limit(50);
      */
      setVisits(await base44.entities.ChpTask.list('-created_date', 50) || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submitVisit = async () => {
    if (!form.description) return;
    setSyncing(true);
    try {
      /*
      // SUPABASE: await supabase.from('chp_tasks').insert({
      //   chp_id: userId, task_type: form.task_type, description: form.description,
      //   priority: form.priority, due_date: form.due_date, status: 'completed',
      //   completed_at: new Date().toISOString(), sync_status: offlineMode ? 'pending' : 'synced'
      // });
      */
      await base44.entities.ChpTask.create({
        ...form,
        chp_id: 'self',
        status: 'completed',
        completed_at: new Date().toISOString(),
        sync_status: offlineMode ? 'pending' : 'synced',
      });
      setForm({ task_type: 'home_visit', description: '', priority: 'medium', due_date: new Date().toISOString().split('T')[0], household_id: '' });
      setShowForm(false);
      load();
    } finally { setSyncing(false); }
  };

  const markComplete = async (task) => {
    await base44.entities.ChpTask.update(task.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      sync_status: 'synced',
    });
    load();
  };

  const syncAll = async () => {
    setSyncing(true);
    try {
      const pending = visits.filter(v => v.sync_status === 'pending');
      for (const v of pending) {
        await base44.entities.ChpTask.update(v.id, { sync_status: 'synced' });
      }
      setOfflineMode(false);
      load();
    } finally { setSyncing(false); }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => {
    const d = v.completed_at || v.created_date;
    return d && new Date(d).toISOString().split('T')[0] === today;
  });
  const pendingSync = visits.filter(v => v.sync_status === 'pending').length;
  const completedCount = visits.filter(v => v.status === 'completed').length;

  if (loading) return <LoadingState message="Loading visit log..." />;

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HeartPulse className="w-5 h-5" /> Daily Field Visit Tracker
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setOfflineMode(!offlineMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] ${offlineMode ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'}`}>
            {offlineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            {offlineMode ? 'Offline' : 'Online'}
          </button>
          <button onClick={syncAll} disabled={syncing || pendingSync === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border text-sm min-h-[44px] disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync {pendingSync > 0 && `(${pendingSync})`}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><ClipboardList className="w-3.5 h-3.5" /> Today's Visits</div>
          <p className="text-xl font-bold">{todayVisits.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Check className="w-3.5 h-3.5" /> Completed</div>
          <p className="text-xl font-bold text-green-600">{completedCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><TrendingUp className="w-3.5 h-3.5" /> Pending Sync</div>
          <p className="text-xl font-bold text-amber-600">{pendingSync}</p>
        </div>
      </div>

      {/* New visit button */}
      <button onClick={() => setShowForm(!showForm)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[48px]">
        <Plus className="w-4 h-4" /> Log New Visit
      </button>

      {/* Visit form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.task_type} onChange={e => setForm({ ...form, task_type: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]">
              {VISIT_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]">
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <input type="text" placeholder="Household ID / Name" value={form.household_id}
            onChange={e => setForm({ ...form, household_id: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Visit notes — observations, actions taken, follow-up needed..."
            rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none" />
          <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
          <button onClick={submitVisit} disabled={syncing || !form.description}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[48px] disabled:opacity-50">
            {syncing ? <LoadingState message="Saving..." /> : <><Check className="w-4 h-4" /> Record Visit</>}
          </button>
        </div>
      )}

      {/* Visit history */}
      {visits.length === 0 ? (
        <EmptyState icon={Home} title="No visits logged" description="Start logging your daily field visits here." />
      ) : (
        <div className="space-y-2">
          {visits.map(v => (
            <div key={v.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      v.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      v.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      v.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{v.priority}</span>
                    <span className="text-xs text-muted-foreground capitalize">{(v.task_type || 'visit').replace(/_/g, ' ')}</span>
                    {v.sync_status === 'pending' && (
                      <span className="text-xs text-amber-600 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Pending sync</span>
                    )}
                  </div>
                  <p className="text-sm">{v.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {v.due_date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(v.due_date).toLocaleDateString()}</span>}
                    {v.completed_at && <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> {new Date(v.completed_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  v.status === 'completed' ? 'bg-green-100 text-green-700' :
                  v.status === 'escalated' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{v.status}</span>
              </div>
              {v.status !== 'completed' && (
                <button onClick={() => markComplete(v)}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium min-h-[40px]">
                  <Check className="w-4 h-4" /> Mark Complete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}