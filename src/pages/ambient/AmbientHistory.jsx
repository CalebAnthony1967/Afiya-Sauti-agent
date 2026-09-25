import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { History, AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

export default function AmbientHistory() {
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setTelemetry(await base44.entities.VitalTelemetry.list('-created_date', 50) || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState message="Loading telemetry history..." />;

  const flagged = telemetry.filter(t => t.flagged_anomaly);
  const chartData = telemetry.slice().reverse().map((t, i) => ({
    name: `#${i + 1}`,
    rr: t.respiratory_rate,
    hr: t.heart_rate,
    cough: t.cough_count_1min,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <History className="w-5 h-5" /> Telemetry History
        </h2>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border text-sm min-h-[44px]">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold">{telemetry.length}</p>
          <p className="text-xs text-muted-foreground">Total Readings</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{flagged.length}</p>
          <p className="text-xs text-muted-foreground">Anomalies</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{telemetry.length - flagged.length}</p>
          <p className="text-xs text-muted-foreground">Normal</p>
        </div>
      </div>

      {/* Trend chart */}
      {telemetry.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold mb-3">Vital Sign Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="rr" stroke="#3b82f6" strokeWidth={2} name="Resp Rate" />
              <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} name="Heart Rate" />
              <Line type="monotone" dataKey="cough" stroke="#f59e0b" strokeWidth={2} name="Coughs/min" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History table */}
      {telemetry.length === 0 ? (
        <EmptyState icon={History} title="No telemetry recorded" description="Ambient node readings will appear here once monitoring begins." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Time</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">RR</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">HR</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Cough</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Conf.</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.slice(0, 20).map(t => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(t.created_date).toLocaleString()}</td>
                  <td className="px-4 py-2">{t.respiratory_rate?.toFixed(1)}</td>
                  <td className="px-4 py-2">{t.heart_rate?.toFixed(0)}</td>
                  <td className="px-4 py-2">{t.cough_count_1min}</td>
                  <td className="px-4 py-2">{t.confidence_score ? (t.confidence_score * 100).toFixed(0) + '%' : '--'}</td>
                  <td className="px-4 py-2">
                    {t.flagged_anomaly ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Anomaly
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}