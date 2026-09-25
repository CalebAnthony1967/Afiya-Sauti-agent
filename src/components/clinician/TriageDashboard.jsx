import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import UrgencyBadge from '@/components/UrgencyBadge';
import { LoadingState, EmptyState } from '@/components/States';
import {
  computeUrgencyDistribution, computeSymptomTrends, computeDomainDistribution,
  computeConfidenceMetrics, autoAssignPriority,
} from '@/lib/triageAnalytics';
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Activity, AlertTriangle, TrendingUp, Gauge, ListChecks, RefreshCw } from 'lucide-react';

const URGENCY_COLORS = { RED: '#ef4444', YELLOW: '#f59e0b', GREEN: '#22c55e', UNCERTAIN_EDGE_TRIAGE: '#f97316' };
const PRIORITY_LABELS = {
  P1_CRITICAL: { label: 'P1 — Critical', class: 'bg-red-100 text-red-700 border-red-300' },
  P2_URGENT: { label: 'P2 — Urgent', class: 'bg-amber-100 text-amber-700 border-amber-300' },
  P3_REVIEW: { label: 'P3 — Review', class: 'bg-orange-100 text-orange-700 border-orange-300' },
  P4_ROUTINE: { label: 'P4 — Routine', class: 'bg-green-100 text-green-700 border-green-300' },
};

export default function TriageDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      /*
      // SUPABASE: const { data } = await supabase.from('triage_sessions')
      //   .select('*').order('created_at', { ascending: false }).limit(200);
      */
      setSessions(await base44.entities.TriageSession.list('-created_date', 200) || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState message="Loading triage dashboard..." />;

  const urgencyDist = computeUrgencyDistribution(sessions);
  const trends = computeSymptomTrends(sessions, 7);
  const domainDist = computeDomainDistribution(sessions);
  const confidence = computeConfidenceMetrics(sessions);
  const redFlags = sessions.filter(s => s.red_flag_detected);
  const recentSorted = [...sessions]
    .map(s => ({ ...s, priority: autoAssignPriority(s) }))
    .sort((a, b) => {
      const order = { P1_CRITICAL: 0, P2_URGENT: 1, P3_REVIEW: 2, P4_ROUTINE: 3 };
      return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
    })
    .slice(0, 15);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" /> High-Level Triage Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time symptom pattern visualization with automatic priority assignment
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border text-sm min-h-[44px]">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Total Sessions" value={sessions.length} color="text-blue-600 bg-blue-50" />
        <StatCard icon={AlertTriangle} label="Red Flags" value={redFlags.length} color="text-red-600 bg-red-50" />
        <StatCard icon={Gauge} label="Avg Confidence" value={`${(confidence.avg * 100).toFixed(0)}%`} color="text-emerald-600 bg-emerald-50" />
        <StatCard icon={TrendingUp} label="Below Threshold" value={confidence.belowThreshold} color="text-amber-600 bg-amber-50" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Urgency distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold mb-3">Urgency Distribution</h3>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={urgencyDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {urgencyDist.map((entry) => (
                    <Cell key={entry.name} fill={URGENCY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Symptom trends */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold mb-3">7-Day Symptom Pattern Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="red" stroke="#ef4444" name="Red" strokeWidth={2} />
              <Line type="monotone" dataKey="yellow" stroke="#f59e0b" name="Yellow" strokeWidth={2} />
              <Line type="monotone" dataKey="green" stroke="#22c55e" name="Green" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold mb-3">Cases by Clinical Domain</h3>
        {domainDist.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={domainDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Auto-priority queue */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <ListChecks className="w-4 h-4" /> Auto-Assigned Priority Queue
        </h3>
        {recentSorted.length === 0 ? (
          <EmptyState icon={ListChecks} title="No sessions" description="Triage sessions will appear here with auto-assigned priorities." />
        ) : (
          <div className="space-y-2">
            {recentSorted.map(s => {
              const pri = PRIORITY_LABELS[s.priority];
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${pri.class}`}>{pri.label}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{s.symptoms_text || s.ai_response || 'No description'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.channel} · {s.domain_module?.replace(/_/g, ' ')} · {new Date(s.created_date).toLocaleString()}
                    </p>
                  </div>
                  <UrgencyBadge level={s.urgency_level} size="sm" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}