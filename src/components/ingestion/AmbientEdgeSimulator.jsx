import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { buildFhirObservation } from '@/lib/fhir';
import { evaluateConfidenceGate } from '@/lib/safety';
import { Cpu, Radio, Mic, Wifi, AlertTriangle, Activity, Wind, Heart, Volume2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Ambient Edge Node Simulator — FMCW radar + mic array.
 * Simulates passive in-home monitoring with on-device privacy.
 * Persists VitalTelemetry with FHIR R4 payload.
 * Vernacular voice alerts in 9 Kenyan languages.
 *
 * SUPABASE ALTERNATIVE:
 *   INSERT INTO vital_telemetry (telemetry_id, household_id, device_id,
 *     respiratory_rate, heart_rate, cough_count_1min, confidence_score,
 *     input_entropy, flagged_anomaly, system_state, fhir_payload, timestamp)
 *   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now());
 *   -- TimescaleDB hypertable auto-partitions by timestamp
 */
const VERNACULAR_ALERTS = {
  sw: 'Tahadhari ya AfiyaSauti: Mfumo umegundua kupumua kwa kasi na kukohoa mara kwa mara. Tafadhali pumzika na uwasiliane na mhudumu wa afya wa jamii (CHP).',
  en: 'AfiyaSauti Alert: Fast breathing and frequent cough detected. Please rest and contact your Community Health Promoter (CHP).',
  ki: 'Mũkaana wa AfiyaSauti: Nĩtwona mĩhũmũ ya kũhũha na kũkorora mũno. Hurũka na wĩte mwarimũ wa ũgima wa mwĩrĩ (CHP).',
  luo: 'Koko mar AfiyaSauti: Muma oyudo yueyo matek gi nyuok mang\'eny. Yie iywe kendo iluong jachiw kony mar ngima (CHP).',
  luy: 'AfiyaSauti Indasio: Omubiri kulolekhele khukhuma amabeka nende khukholola. Khwitsilile khupumule oye omurambi we bilwale (CHP).',
  kal: 'Kanyalilisyetab AfiyaSauti: Kekas kasesutab korosto ak kootik che chang\'. Itegeeny ak ikuut chito nebo kalyet (CHP).',
  kam: 'Mukano wa AfiyaSauti: Kwoneka kuveva muki na kukolola kwingi. No nginya uthumue na utavie mundu wa uima wa mwii (CHP).',
  gus: 'Eng\'ana ya AfiyaSauti: Tokanyora ogosika kwo obwoya n\'ogokorora gokong\'u. Sasimoka erio orore omwimanyi bwo oborwaire (CHP).',
  mer: 'Mũkaana jwa AfiyaSauti: Twona kũũmĩa kwa mĩhũmũ na gĩkororo kĩingĩ. Hurũka na wĩte mũtetheria wa ũgima bwa mwĩrĩ (CHP).',
};

const LANG_OPTIONS = [
  { code: 'sw', label: 'Kiswahili' }, { code: 'en', label: 'English' },
  { code: 'ki', label: 'Kikuyu' }, { code: 'luo', label: 'Dholuo' },
  { code: 'luy', label: 'Luluhya' }, { code: 'kal', label: 'Kalenjin' },
  { code: 'kam', label: 'Kikamba' }, { code: 'gus', label: 'Ekegusii' },
  { code: 'mer', label: 'Kimeru' },
];

export default function AmbientEdgeSimulator() {
  const { t } = useLanguage();
  const [active, setActive] = useState(false);
  const [readings, setReadings] = useState(null);
  const [history, setHistory] = useState([]);
  const [anomaly, setAnomaly] = useState(false);
  const [muted, setMuted] = useState(false);
  const [language, setLanguage] = useState('sw');
  const intervalRef = useRef(null);

  const generateReading = () => {
    const rr = 12 + Math.random() * 8;
    const hr = 60 + Math.random() * 25;
    const cough = Math.floor(Math.random() * 4);
    const temp = 22 + Math.random() * 4;
    const confidence = 0.82 + Math.random() * 0.15;
    const entropy = Math.random() * 0.4;
    const flagged = rr > 22 || hr > 100 || cough > 3 || confidence < 0.85;
    return { respiratory_rate: rr, heart_rate: hr, cough_count_1min: cough, ambient_temp_c: temp, confidence_score: confidence, input_entropy: entropy, flagged_anomaly: flagged, timestamp: new Date().toISOString() };
  };

  const persistReading = async (r) => {
    const fhirPayload = buildFhirObservation({ telemetry_id: crypto.randomUUID(), household_id: 'demo-household', device_id: 'edge-node-001', ...r });
    try {
      await base44.entities.VitalTelemetry.create({
        telemetry_id: crypto.randomUUID(),
        household_id: 'demo-household',
        device_id: 'edge-node-001',
        ...r,
        flagged_anomaly: r.flagged_anomaly,
        anomaly_type: r.flagged_anomaly ? 'elevated_vitals' : null,
        system_state: r.flagged_anomaly ? 'ALERT' : (muted ? 'MUTED' : 'PASSIVE_MONITORING'),
        fhir_payload: fhirPayload,
      });
    } catch { /* demo mode */ }
  };

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      const r = generateReading();
      setReadings(r);
      setHistory(h => [...h.slice(-9), r]);
      setAnomaly(r.flagged_anomaly);
      persistReading(r);
    }, 2500);
    return () => clearInterval(intervalRef.current);
  }, [active, muted]);

  return (
    <div className="flex flex-col gap-4">
      {/* Device header */}
      <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? 'bg-violet-500' : 'bg-slate-300'}`}>
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Edge Node #001</p>
            <p className="text-xs text-slate-500">FMCW Radar + Mic Array</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Wifi className={`w-4 h-4 ${active ? 'text-violet-500' : 'text-slate-400'}`} />
          <span className={active ? 'text-violet-600' : 'text-slate-400'}>{active ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button onClick={() => setActive(a => !a)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium min-h-[44px] ${active ? 'bg-red-500 text-white' : 'bg-violet-500 text-white'}`}>
          {active ? t('ambient.stopMonitoring') : t('ambient.startMonitoring')}
        </button>
        <button onClick={() => setMuted(m => !m)} disabled={!active}
          className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] ${muted ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'} disabled:opacity-40`}>
          <Mic className="w-4 h-4 inline mr-1" />{muted ? t('ambient.muted') : t('ambient.micOn')}
        </button>
      </div>

      {/* Language selector for vernacular alerts */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="text-xs text-slate-500">Voice alert language:</span>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}
          className="flex-1 text-xs rounded-lg border border-slate-300 px-2 py-1.5 bg-white text-slate-700">
          {LANG_OPTIONS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      {/* Radar visualization */}
      <div className="relative h-40 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
        {active ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="absolute rounded-full border border-violet-400/40 animate-ping"
                  style={{ width: `${50 + i * 40}px`, height: `${50 + i * 40}px`, animationDelay: `${i * 400}ms`, animationDuration: '2s' }} />
              ))}
            </div>
            <Radio className="w-8 h-8 text-violet-500 relative z-10" />
            <div className="absolute bottom-2 left-3 text-xs text-violet-500/70 font-mono">FMCW 60GHz • On-device processing</div>
          </>
        ) : (
          <p className="text-slate-400 text-sm">Monitoring inactive</p>
        )}
      </div>

      {/* Live readings */}
      {readings && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Wind className="w-3.5 h-3.5" /> Respiratory</div>
            <p className={`text-lg font-bold ${readings.respiratory_rate > 22 ? 'text-red-600' : 'text-slate-900'}`}>{readings.respiratory_rate.toFixed(1)} <span className="text-xs font-normal text-slate-400">br/min</span></p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Heart className="w-3.5 h-3.5" /> Heart Rate</div>
            <p className={`text-lg font-bold ${readings.heart_rate > 100 ? 'text-red-600' : 'text-slate-900'}`}>{readings.heart_rate.toFixed(0)} <span className="text-xs font-normal text-slate-400">bpm</span></p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1"><Activity className="w-3.5 h-3.5" /> Cough (1min)</div>
            <p className={`text-lg font-bold ${readings.cough_count_1min > 3 ? 'text-red-600' : 'text-slate-900'}`}>{readings.cough_count_1min}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">Confidence</div>
            <p className={`text-lg font-bold ${readings.confidence_score < 0.85 ? 'text-amber-600' : 'text-slate-900'}`}>{(readings.confidence_score * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Anomaly alert with vernacular voice message */}
      {anomaly && active && (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Anomaly Detected</p>
            <p className="text-xs text-red-600 mt-0.5">Vital signs outside normal range. Telemetry saved with FHIR R4. CHP alert queued.</p>
            <div className="mt-2 pt-2 border-t border-red-200">
              <p className="text-xs font-medium text-red-700 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Voice Alert ({LANG_OPTIONS.find(l => l.code === language)?.label}):
              </p>
              <p className="text-xs text-red-800 mt-1 italic">"{VERNACULAR_ALERTS[language] || VERNACULAR_ALERTS.sw}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <p className="text-xs text-slate-400 text-center">
        🔒 {t('ambient.privacyNote')}
      </p>
    </div>
  );
}