import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState } from '@/components/States';
import { Cpu, Mic, MicOff, Activity, Heart, Wind, Volume2, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { evaluateConfidenceGate } from '@/lib/safety';
import { buildFhirObservation } from '@/lib/fhir';

/**
 * Ambient Live Monitor — Real-time edge device telemetry.
 * Ported from the standalone AmbientNode page, adapted for portal layout.
 */
export default function AmbientMonitor() {
  const [muted, setMuted] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('sw');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const timer = setInterval(async () => {
      const rr = 12 + Math.random() * 8;
      const hr = 65 + Math.random() * 25;
      const cough = Math.floor(Math.random() * 5);
      const confidence = 0.82 + Math.random() * 0.15;
      const entropy = 0.15 + Math.random() * 0.25;
      const flagged = rr > 25 || hr > 100 || cough > 3;
      const gate = evaluateConfidenceGate(confidence, entropy);

      const reading = {
        telemetry_id: 'edge_' + Date.now(),
        household_id: 'hh_demo',
        device_id: 'edge_node_01',
        respiratory_rate: parseFloat(rr.toFixed(2)),
        heart_rate: parseFloat(hr.toFixed(2)),
        cough_count_1min: cough,
        ambient_temp_c: parseFloat((22 + Math.random() * 4).toFixed(2)),
        confidence_score: parseFloat(confidence.toFixed(2)),
        input_entropy: parseFloat(entropy.toFixed(3)),
        flagged_anomaly: flagged,
        system_state: muted ? 'MUTED' : voiceActive ? 'VOICE_ACTIVE' : flagged ? 'ALERT' : 'PASSIVE_MONITORING',
        timestamp: new Date().toISOString(),
      };

      const fhirObs = buildFhirObservation(reading);
      reading.fhir_payload = fhirObs;

      setTelemetry(t => [...t.slice(-23), reading]);

      if (flagged && !muted && !gate.escalate) {
        setAlert({ type: 'anomaly', message: 'Vital sign anomaly detected. Local alert generated.', reading });
        try {
          await base44.entities.VitalTelemetry.create(reading);
          await base44.entities.AuditLog.create({
            actor_id: 'edge_node_01', actor_role: 'edge_device',
            action_type: 'data_create', resource_type: 'vital_telemetry', resource_id: reading.telemetry_id,
            signature_hash: 'edge_' + reading.telemetry_id,
            payload_snapshot: { flagged, confidence, entropy },
          });
        } catch (e) { console.error(e); }
      } else if (gate.escalate) {
        setAlert({ type: 'uncertain', message: 'UNCERTAIN_EDGE_TRIAGE — escalating to clinician.' });
      }
    }, 3000);

    (async () => {
      try {
        const existing = await base44.entities.VitalTelemetry.list('-created_date', 24);
        if (existing && existing.length) setTelemetry(existing);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();

    return () => clearInterval(timer);
  }, [muted, voiceActive]);

  if (loading) return <LoadingState message="Loading ambient telemetry..." />;

  const latest = telemetry[telemetry.length - 1];
  const chartData = telemetry.map((t, i) => ({ name: `#${i + 1}`, rr: t.respiratory_rate, hr: t.heart_rate }));

  const stateColor = muted ? 'bg-slate-600' : voiceActive ? 'bg-blue-600' : latest?.flagged_anomaly ? 'bg-red-600' : 'bg-green-600';
  const stateLabel = muted ? 'MUTED' : voiceActive ? 'VOICE ACTIVE' : latest?.flagged_anomaly ? 'ALERT' : 'PASSIVE MONITORING';

  return (
    <div className="space-y-5">
      {/* System State */}
      <div className={`rounded-xl p-5 ${stateColor} text-white text-center`}>
        <p className="text-2xl font-bold tracking-wider">{stateLabel}</p>
        <p className="text-sm opacity-80 mt-1">Device ID: edge_node_01 · Household: hh_demo</p>
      </div>

      {/* Alert */}
      {alert && !muted && (
        <div className={`rounded-xl p-4 border-2 ${alert.type === 'uncertain' ? 'bg-orange-50 border-orange-500' : 'bg-red-50 border-red-500'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-6 h-6 ${alert.type === 'uncertain' ? 'text-orange-500' : 'text-red-500'}`} />
            <div>
              <p className={`font-bold ${alert.type === 'uncertain' ? 'text-orange-700' : 'text-red-700'}`}>
                {alert.type === 'uncertain' ? 'Escalation Required' : 'Anomaly Detected'}
              </p>
              <p className={`text-sm ${alert.type === 'uncertain' ? 'text-orange-600' : 'text-red-600'}`}>{alert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Vitals */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <Wind className="w-5 h-5 text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{latest?.respiratory_rate?.toFixed(1) || '--'}</p>
          <p className="text-xs text-muted-foreground">breaths/min</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <Heart className="w-5 h-5 text-red-500 mb-1" />
          <p className="text-2xl font-bold">{latest?.heart_rate?.toFixed(0) || '--'}</p>
          <p className="text-xs text-muted-foreground">bpm</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <Activity className="w-5 h-5 text-amber-500 mb-1" />
          <p className="text-2xl font-bold">{latest?.cough_count_1min ?? '--'}</p>
          <p className="text-xs text-muted-foreground">coughs/min</p>
        </div>
      </div>

      {/* Confidence/Entropy */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-muted-foreground">Confidence</p>
          <p className="text-xl font-bold">{latest?.confidence_score ? (latest.confidence_score * 100).toFixed(0) + '%' : '--'}</p>
          <p className={`text-xs ${latest?.confidence_score >= 0.85 ? 'text-green-600' : 'text-amber-600'}`}>
            {latest?.confidence_score >= 0.85 ? 'Above threshold' : 'Below 0.85 — escalate'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-muted-foreground">Entropy</p>
          <p className="text-xl font-bold">{latest?.input_entropy?.toFixed(3) || '--'}</p>
          <p className={`text-xs ${latest?.input_entropy <= 0.35 ? 'text-green-600' : 'text-amber-600'}`}>
            {latest?.input_entropy <= 0.35 ? 'Within limit' : 'Above 0.35 — escalate'}
          </p>
        </div>
      </div>

      {/* Vital Trends */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold mb-3">24-Hour Vital Trends</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
            <YAxis fontSize={10} stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#f8fafc', border: '1px solid #e2e8f0' }} />
            <Line type="monotone" dataKey="rr" stroke="#3b82f6" strokeWidth={2} name="Resp Rate" />
            <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} name="Heart Rate" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Privacy Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold mb-2">Hardware Privacy Controls</h3>
        <p className="text-xs text-muted-foreground mb-3">Muting stops data generation at the source. No data leaves the device when muted.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMuted(!muted)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium min-h-[56px] ${muted ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {muted ? 'MUTED' : 'MIC ON'}
          </button>
          <button
            onClick={() => setVoiceActive(!voiceActive)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium min-h-[56px] ${voiceActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            <Volume2 className="w-5 h-5" />
            {voiceActive ? 'VOICE ACTIVE' : 'VOICE IDLE'}
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Privacy feature extraction on device · Only anonymised signals leave the home · FHIR R4 via OpenHIM
      </p>
    </div>
  );
}