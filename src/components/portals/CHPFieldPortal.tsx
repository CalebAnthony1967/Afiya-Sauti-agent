import React, { useState } from 'react';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  BookOpen,
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  User,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { INITIAL_CHP_TASKS } from '../../data/mockData';
import { CHPTask } from '../../types';

export const CHPFieldPortal: React.FC = () => {
  const [tasks, setTasks] = useState<CHPTask[]>(INITIAL_CHP_TASKS);
  const [selectedTask, setSelectedTask] = useState<CHPTask>(INITIAL_CHP_TASKS[0]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');
  const [visitNotes, setVisitNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.taskId === taskId
          ? {
              ...t,
              status: 'COMPLETED',
              completedAt: new Date().toISOString(),
              notes: visitNotes || 'Visit completed successfully per MoH IMCI guidelines.'
            }
          : t
      )
    );
    setActionSuccess(`Task ${taskId} completed and saved to eCHIS local log.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleEscalateTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.taskId === taskId
          ? {
              ...t,
              status: 'ESCALATED',
              priority: 'CRITICAL_RED_FLAG',
              notes: 'Escalated to Sub-County Referral Facility (Level 4)'
            }
          : t
      )
    );
    setActionSuccess(`Emergency referral dispatched for Task ${taskId}. Facility alerted.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const triggerSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      setActionSuccess('Conflict-free sync with MoH eCHIS central server completed.');
      setTimeout(() => setActionSuccess(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* CHP Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">eCHIS Community Health Promoter (CHP) Field Portal</h2>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  Unit: Soweto East
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as: <span className="text-white font-medium">Faith Wanjiku (CHP-041)</span> | Sub-County: Kibra, Nairobi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOfflineMode(!offlineMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                offlineMode
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
              }`}
              title="Toggle simulated offline connectivity mode"
            >
              {offlineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{offlineMode ? 'Simulated Offline' : 'Online'}</span>
            </button>

            <button
              onClick={triggerSync}
              disabled={syncStatus === 'syncing'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              title="Sync cached tasks with eCHIS central server"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync Tasks'}</span>
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Task Queue */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-teal-400" />
                Assigned Visit Queue ({tasks.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Offline Cached</span>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.taskId}
                  onClick={() => setSelectedTask(task)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedTask?.taskId === task.taskId
                      ? 'bg-slate-800 border-teal-500 shadow-sm'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.priority === 'CRITICAL_RED_FLAG'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                          : task.priority === 'URGENT'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {task.priority.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{task.status}</span>
                  </div>

                  <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">{task.reason}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                    <MapPin className="w-3 h-3 text-teal-400" />
                    <span>{task.villageName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle & Right Col: Active Visit Workspace */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTask ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[11px] font-mono text-teal-400">{selectedTask.taskId}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{selectedTask.reason}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Location: {selectedTask.villageName} ({selectedTask.subCounty})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEscalateTask(selectedTask.taskId)}
                    className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Escalate to Level 4</span>
                  </button>
                  <button
                    onClick={() => handleCompleteTask(selectedTask.taskId)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Complete</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Grounded Guidance */}
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-teal-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Kenya MoH Clinical Protocol Guidance
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedTask.guidanceProtocol}</span>
                </div>

                <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-white">Recommended Action:</strong> {selectedTask.recommendedAction}
                  </p>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800 text-[11px] space-y-1">
                    <p className="font-semibold text-slate-200">IMCI Danger Signs Checklist to Verify On-Site:</p>
                    <p>1. Check if child is able to drink or breastfeed</p>
                    <p>2. Count respiratory rate for a full 60 seconds with IMCI timer</p>
                    <p>3. Inspect for lower chest wall indrawing and stridor in a calm state</p>
                    <p>4. Check palm and conjunctiva for severe pallor (Malaria / Anemia)</p>
                  </div>
                </div>
              </div>

              {/* Visit Observations Form */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">CHP Clinical Visit Observations & Resolution Notes:</label>
                <textarea
                  rows={3}
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="Record observed respiratory rate, caregiver counselling provided, and whether pre-referral treatment was administered..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              Select a task from the queue to view clinical guidance and visit forms.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
