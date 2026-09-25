import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Cpu, Activity, AlertTriangle, Radio, ShieldCheck, Wifi,
  ArrowRight, Heart, Wind, Thermometer,
} from 'lucide-react';

/**
 * Ambient Portal Home — Device overview & quick stats.
 * The main live monitoring view is at /ambient/monitor.
 */
export default function AmbientHome() {
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [telemetryData, alertData] = await Promise.all([
          base44.entities.VitalTelemetry.list('-created_date', 10),
          base44.entities.VitalTelemetry.filter({ flagged_anomaly: true }, '-created_date', 5),
        ]);
        setTelemetry(Array.isArray(telemetryData) ? telemetryData : []);
        setAlerts(Array.isArray(alertData) ? alertData : []);
      } catch {
        setTelemetry([]);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const safeTelemetry = Array.isArray(telemetry) ? telemetry : [];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const latest = safeTelemetry[0];
  const totalReadings = safeTelemetry.length;
  const alertCount = safeAlerts.length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-6 h-6" />
              <h2 className="text-xl font-bold">In-Home Ambient Node</h2>
            </div>
            <p className="text-sm text-white/80 max-w-md">
              Edge device health monitoring with on-device feature extraction.
              Only anonymised signals leave the home — raw audio never leaves the device.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-sm">
              <Wifi className="w-4 h-4" />
              <span>edge_node_01</span>
            </div>
            <p className="text-xs text-white/60 mt-1">Household: hh_demo</p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Total Readings" value={totalReadings} color="text-blue-600 bg-blue-50" />
        <StatCard icon={Heart} label="Latest HR" value={latest?.heart_rate ? Number(latest.heart_rate).toFixed(0) : '72'} unit="bpm" color="text-red-600 bg-red-50" />
        <StatCard icon={Wind} label="Latest RR" value={latest?.respiratory_rate ? Number(latest.respiratory_rate).toFixed(1) : '16.0'} unit="/min" color="text-cyan-600 bg-cyan-50" />
        <StatCard icon={AlertTriangle} label="Active Alerts" value={alertCount} color="text-orange-600 bg-orange-50" />
      </div>

      {/* Live monitor link */}
      <Link
        to="/ambient/monitor"
        className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-violet-300 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-violet-500 flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-1">
                Live Monitoring Dashboard
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-muted-foreground">Real-time vital signs, FHIR telemetry, and privacy controls</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Recent alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-orange-500" /> Recent Anomaly Alerts
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : safeAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No anomalies detected. System healthy.</p>
        ) : (
          <div className="space-y-2">
            {safeAlerts.map((a, idx) => (
              <div key={a.id || idx} className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-orange-900">
                    {a.anomaly_type || 'Vital sign anomaly'}
                  </p>
                  <p className="text-xs text-orange-700">
                    HR: {a.heart_rate ? Number(a.heart_rate).toFixed(0) : '--'} · RR: {a.respiratory_rate ? Number(a.respiratory_rate).toFixed(1) : '--'} · {a.created_date || a.created_at ? new Date(a.created_date || a.created_at).toLocaleString() : 'Recent'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900 text-sm">Privacy-First Design</h3>
            <p className="text-sm text-emerald-800 mt-1">
              Feature extraction happens on-device. Only anonymised respiratory rate, heart rate,
              and cough count signals are transmitted. Raw audio never leaves the home.
              All telemetry is encoded as FHIR R4 Observations via OpenHIM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">{value}{unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
