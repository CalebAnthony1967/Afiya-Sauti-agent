import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Adherence Tracker — medication adherence logging per IMCI/WHO protocols.
 * Records taken/missed events and computes adherence rate.
 *
 * SUPABASE ALTERNATIVE:
 *   INSERT INTO adherence_events (profile_id, regimen_id, taken, scheduled_time, recorded_time, channel)
 *   VALUES ($1, $2, true, $3, now(), 'app');
 *
 *   SELECT
 *     COUNT(*) FILTER (WHERE taken) * 100.0 / COUNT(*) AS adherence_rate
 *   FROM adherence_events WHERE regimen_id = $1;
 */
export default function AdherenceTracker({ regimen, profileId = 'self' }) {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayTaken, setTodayTaken] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [regimen.id]);

  const loadEvents = async () => {
    try {
      const data = await base44.entities.AdherenceEvent.filter(
        { regimen_id: regimen.id }, '-recorded_time', 30
      ) || [];
      setEvents(data);
      const today = new Date().toDateString();
      const todayEvent = data.find(e =>
        e.taken && e.recorded_time && new Date(e.recorded_time).toDateString() === today
      );
      setTodayTaken(!!todayEvent);
    } catch (e) { console.error(e); }
  };

  const markTaken = async () => {
    if (todayTaken) return;
    setLoading(true);
    try {
      await base44.entities.AdherenceEvent.create({
        profile_id: profileId,
        regimen_id: regimen.id,
        taken: true,
        scheduled_time: new Date().toISOString(),
        recorded_time: new Date().toISOString(),
        channel: 'app',
        notes: 'Marked taken via patient portal',
      });
      setTodayTaken(true);
      loadEvents();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const takenCount = events.filter(e => e.taken).length;
  const adherenceRate = events.length > 0 ? Math.round((takenCount / events.length) * 100) : 0;

  const startDate = regimen.start_date ? new Date(regimen.start_date) : new Date();
  const refillDue = regimen.end_date ? new Date(regimen.end_date) : null;
  const daysToRefill = refillDue ? Math.ceil((refillDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{regimen.medication_name} ({regimen.dosage})</h4>
          <p className="text-xs text-slate-500">{regimen.frequency} · {regimen.route}</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
          regimen.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
        }`}>
          {regimen.active ? t('patient.active') : 'INACTIVE'}
        </span>
      </div>

      {regimen.prescribed_by && (
        <p className="text-xs text-slate-600">Prescribed by: {regimen.prescribed_by}</p>
      )}

      {regimen.notes && (
        <p className="text-xs text-slate-500 italic">{regimen.notes}</p>
      )}

      {/* Today's dose */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">Today's Dose:</span>
        {todayTaken ? (
          <span className="text-emerald-600 font-medium flex items-center gap-1 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t('patient.taken')}
          </span>
        ) : (
          <button
            onClick={markTaken}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold disabled:opacity-50"
          >
            <Circle className="w-3.5 h-3.5" /> {t('patient.markTaken')}
          </button>
        )}
      </div>

      {/* Adherence stats */}
      {events.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {t('patient.adherence')}: {adherenceRate}%
          </span>
          {daysToRefill != null && (
            <span className={`font-mono ${daysToRefill <= 7 ? 'text-amber-600' : 'text-slate-500'}`}>
              {t('patient.refillIn')} {daysToRefill}d
            </span>
          )}
        </div>
      )}
    </div>
  );
}