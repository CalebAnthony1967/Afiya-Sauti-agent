import React from 'react';
import { Clock, Stethoscope, Calendar, HeartPulse, FileText, Radio } from 'lucide-react';
import UrgencyBadge from '@/components/UrgencyBadge';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Health Timeline — unified chronological view of patient clinical events.
 * Merges triage sessions, ambient telemetry, SOAP notes, and appointments.
 *
 * SUPABASE ALTERNATIVE:
 *   SELECT * FROM (
 *     SELECT 'triage' AS type, created_at, urgency_level, domain_module,
 *            ai_response, channel, id FROM triage_sessions WHERE profile_id = $1
 *     UNION ALL
 *     SELECT 'ambient' AS type, timestamp, NULL, NULL,
 *            anomaly_type, NULL, id FROM vital_telemetry WHERE household_id = $2
 *     UNION ALL
 *     SELECT 'soap' AS type, created_at, NULL, NULL,
 *            assessment, NULL, id FROM clinical_soap_notes WHERE profile_id = $1
 *   ) events ORDER BY created_at DESC LIMIT 20;
 */
const EVENT_CONFIG = {
  triage: { icon: Stethoscope, color: 'bg-teal-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ambient: { icon: Radio, color: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  soap: { icon: FileText, color: 'bg-emerald-500', badge: 'bg-slate-100 text-slate-600' },
  appointment: { icon: Calendar, color: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  clinician: { icon: HeartPulse, color: 'bg-emerald-500', badge: 'bg-slate-100 text-slate-600' },
};

export default function HealthTimeline({ events = [], loading = false }) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-500" /> {t('patient.timeline')}
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-500" /> {t('patient.timeline')}
        </h3>
        <p className="text-sm text-slate-500 text-center py-6">No clinical events yet. Your symptom checks and visits will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-teal-500" /> {t('patient.timeline')}
      </h3>
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-100">
        {events.map((event, i) => {
          const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.triage;
          const Icon = config.icon;
          return (
            <div key={event.id || i} className="relative pl-8">
              <div className={`absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full ${config.color} border-2 border-white`} />
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{event.timestamp ? new Date(event.timestamp).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</span>
                  {event.badge && (
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${config.badge}`}>
                      {event.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {event.title}
                </h4>
                {event.description && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{event.description}</p>
                )}
                {event.urgency && (
                  <div className="mt-2 flex items-center gap-2">
                    <UrgencyBadge level={event.urgency} size="sm" />
                    {event.confidence && (
                      <span className="text-[11px] font-mono text-teal-600">Confidence: {(event.confidence * 100).toFixed(0)}%</span>
                    )}
                  </div>
                )}
                {event.meta && (
                  <div className="mt-2 text-[11px] font-mono text-slate-400">{event.meta}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}