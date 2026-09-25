import React, { useState, useEffect } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  Eye,
  EyeOff,
  Activity,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { AmbientEdgeNodeState } from '../../types';
import { edgeSimulator } from '../../services/edgeSimulator';

export const AmbientNodeInterface: React.FC = () => {
  const [nodeState, setNodeState] = useState<AmbientEdgeNodeState>(edgeSimulator.getState());
  const [voiceAlertPlaying, setVoiceAlertPlaying] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNodeState({ ...edgeSimulator.getState() });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const toggleMic = () => {
    const updated = edgeSimulator.setMute('mic', !nodeState.micMuted);
    setNodeState(updated);
  };

  const toggleRadar = () => {
    const updated = edgeSimulator.setMute('radar', !nodeState.radarMuted);
    setNodeState(updated);
  };

  const triggerTachypneaEmergency = () => {
    // Simulate acute pediatric tachypnea
    const alert = edgeSimulator.simulateAnomaly('TACHYPNEA_PEDIATRIC');
    setNodeState({ ...edgeSimulator.getState() });
    setVoiceAlertPlaying('Onyo la dharura: Mtoto anapumua kwa kasi kubwa. Tafadhali tembelea hospitali sasa!');
    setTimeout(() => setVoiceAlertPlaying(null), 7000);
  };

  const resetNormalVitals = () => {
    edgeSimulator.setTelemetry({
      respiratoryRate: 18,
      heartRate: 72,
      coughCount24h: 1,
      presenceDetected: true,
      lastReadingTime: new Date().toISOString()
    });
    setNodeState({ ...edgeSimulator.getState(), nodeStatus: 'PASSIVE_MONITORING' });
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">In-Home Ambient Node Interface (Simulated Hardware)</h2>
                <span className="px-2 py-0.5 rounded text-[11px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Edge Node ID: {nodeState.nodeId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                60 GHz FMCW mmWave Radar & Acoustic On-Device Feature Extractor | Sovereign Household Hardware
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetNormalVitals}
              className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Reset Normal Vitals
            </button>
            <button
              onClick={triggerTachypneaEmergency}
              className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Tachypnea Alarm</span>
            </button>
          </div>
        </div>

        {voiceAlertPlaying && (
          <div className="mt-3 p-3 bg-rose-950/90 border border-rose-800 text-rose-200 text-xs rounded-lg flex items-center gap-2.5 animate-pulse">
            <Volume2 className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <div className="font-bold">Vernacular Audio Alert Broadcasting on Edge Speaker:</div>
              <div>"{voiceAlertPlaying}"</div>
            </div>
          </div>
        )}
      </div>

      {/* Simulated Physical Device Screen (OLED / E-Paper Style) */}
      <div className="max-w-2xl mx-auto bg-black border-4 border-slate-700 rounded-3xl p-6 shadow-2xl space-y-6 text-white font-sans">
        {/* Hardware Status Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                nodeState.nodeStatus === 'EMERGENCY_ALARM'
                  ? 'bg-rose-500 animate-ping'
                  : nodeState.nodeStatus === 'VOICE_ACTIVE'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            ></span>
            <span className="font-mono uppercase font-bold tracking-wider text-[11px]">
              STATUS: {nodeState.nodeStatus}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
            <span>LANG: {nodeState.preferredLanguage.toUpperCase()}</span>
            <span>BATTERY: {nodeState.batteryPercent}%</span>
            <span>WIFI: 92%</span>
          </div>
        </div>

        {/* Live Radar Telemetry Display */}
        <div className="grid grid-cols-3 gap-4 text-center py-4">
          {/* Respiratory Rate */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Respiration Rate</span>
            <div
              className={`text-4xl font-black font-mono ${
                nodeState.telemetry.respiratoryRate > 35 ? 'text-rose-500 animate-bounce' : 'text-cyan-400'
              }`}
            >
              {nodeState.telemetry.respiratoryRate}
            </div>
            <span className="text-[10px] text-slate-500">breaths / min</span>
          </div>

          {/* Heart Rate */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Heart Rate</span>
            <div className="text-4xl font-black font-mono text-rose-400">{nodeState.telemetry.heartRate}</div>
            <span className="text-[10px] text-slate-500">bpm (micro-Doppler)</span>
          </div>

          {/* Cough Count */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Cough Count (24h)</span>
            <div className="text-4xl font-black font-mono text-amber-400">{nodeState.telemetry.coughCount24h}</div>
            <span className="text-[10px] text-slate-500">acoustic events</span>
          </div>
        </div>

        {/* Privacy Hardware Switches (Physical Mute) */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hardware Privacy Cutoffs (Local Sovereign Control)
            </span>
            <span className="text-[10px] font-mono text-slate-500">NO CLOUD RAW AUDIO</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Mic Switch */}
            <button
              onClick={toggleMic}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                nodeState.micMuted
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {nodeState.micMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                <span>Microphone</span>
              </div>
              <span className="font-mono text-[10px]">{nodeState.micMuted ? 'CUT' : 'ACTIVE'}</span>
            </button>

            {/* Radar Switch */}
            <button
              onClick={toggleRadar}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                nodeState.radarMuted
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {nodeState.radarMuted ? <EyeOff className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                <span>Radar Sensing</span>
              </div>
              <span className="font-mono text-[10px]">{nodeState.radarMuted ? 'CUT' : 'ACTIVE'}</span>
            </button>
          </div>
        </div>

        {/* Device Information Footer */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
          <span>TFLite Micro ON-DEVICE INFERENCE</span>
          <span>ENTROPY: 0.18 • CONFIDENCE: 96%</span>
        </div>
      </div>
    </div>
  );
};
