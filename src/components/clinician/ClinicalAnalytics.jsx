import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import {
  computeICD11Distribution, computeChannelDistribution, computeConfidenceMetrics,
  computeSymptomTrends, computeDomainDistribution,
} from '@/lib/triageAnalytics';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { TrendingUp, Activity, MapPin, FileBarChart, RefreshCw } from 'lucide-react';

const CHANNEL_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ClinicalAnalytics() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      /*
      // SUPABASE: const { data } = await supabase.from('triage_sessions')
      //   .select('*, profiles(county_code)')
      //   .order('created_at', { ascending: false }).limit(500);
      // Or use a materialized view: supabase.rpc('get_clinical_analytics', { days: 30 })
      */
      setSessions(await base44.entities.TriageSession.list('-created_date', 500) || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState message="Loading clinical analytics..." />;

  const icd11Dist = computeICD11Distribution(sessions);
  const channelDist = computeChannelDistribution(sessions);
  const confidence = computeConfidenceMetrics(sessions);
  const trends = computeSymptomTrends(sessions, 14);
  const domainDist = computeDomainDistribution(sessions);

  // Outcome rates
  const total = sessions.length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  const escalated = sessions.filter(s => s.status === 'escalated').length;
  const redFlags = sessions.filter(s => s.red_flag_detected).length;
  const humanOverrides = sessions.filter(s => s.human_override).length;

  // Radar data for domain analysis
  const radarData = domainDist.map(d => ({ domain: d.name, cases: d.value }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileBarChart className="w-5 h-5" /> Clinical Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Patient symptom patterns & triage outcomes — regional health trend tracking
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border text-sm min-h-[44px]">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Outcome metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard label="Total Cases" value={total} icon={Activity} color="text-blue-600 bg-blue-50" />
        <MetricCard label="Completed" value={completed} icon={Activity} color="text-green-600 bg-green-50" />
        <MetricCard label="Escalated" value={escalated} icon={TrendingUp} color="text-orange-600 bg-orange-50" />
        <MetricCard label="Red Flags" value={redFlags} icon={Activity} color="text-red-600 bg-red-50" />
        <MetricCard label="Human Overrides" value={humanOverrides} icon={Activity} color="text-purple-600 bg-purple-50" />
      </div>

      {total === 0 ? (
        <EmptyState icon={FileBarChart} title="No analytics data" description="Triage data will populate analytics as sessions are created." />
      ) : (
        <>
          {/* 14-day trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold mb-3">14-Day Triage Outcome Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="red" stroke="#ef4444" fill="url(#redGrad)" name="Red (Emergency)" />
                <Area type="monotone" dataKey="yellow" stroke="#f59e0b" fill="url(#yellowGrad)" name="Yellow (Urgent)" />
                <Area type="monotone" dataKey="green" stroke="#22c55e" fill="url(#greenGrad)" name="Green (Routine)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ICD-11 distribution */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Top ICD-11 Code Distribution</h3>
              {icd11Dist.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No ICD-11 data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={icd11Dist} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="code" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Channel distribution */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Ingestion Channel Distribution</h3>
              {channelDist.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No channel data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={channelDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {channelDist.map((_, i) => (
                        <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Domain radar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold mb-3">Clinical Domain Coverage Analysis</h3>
            {radarData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No domain data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis tick={{ fontSize: 10 }} />
                  <Radar name="Cases" dataKey="cases" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Confidence metrics */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold mb-3">AI Confidence Metrics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-emerald-600">{(confidence.avg * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Average Confidence</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-green-600">{(confidence.max * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Maximum</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-amber-600">{(confidence.min * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Minimum</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-red-600">{confidence.belowThreshold}</p>
                <p className="text-xs text-muted-foreground">Below 85% Threshold</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}