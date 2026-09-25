import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import UrgencyBadge from '@/components/UrgencyBadge';
import { AlertTriangle, Bell, X, Send, CheckCircle, Volume2 } from 'lucide-react';

/**
 * Critical Alert System — Real-time monitoring of triage sessions.
 * Subscribes to TriageSession events and immediately alerts clinicians
 * when the AI flags a symptom as a critical emergency (red_flag_detected).
 *
 * SUPABASE ALTERNATIVE:
 * Use Supabase Realtime: supabase.channel('critical-alerts')
 *   .on('postgres_changes', { event: 'INSERT', schema: 'public',
 *     table: 'triage_sessions', filter: 'red_flag_detected=eq.true' },
 *     payload => handleAlert(payload.new))
 *   .subscribe();
 *
 * Also create a Postgres trigger to insert into secure_messages:
 *   CREATE FUNCTION notify_clinician() RETURNS TRIGGER AS $$
 *   BEGIN
 *     IF NEW.red_flag_detected THEN
 *       INSERT INTO secure_messages (sender_id, recipient_id, subject, body)
 *       VALUES ('system', 'clinician_on_call', 'CRITICAL ALERT', NEW.ai_response);
 *     END IF;
 *     RETURN NEW;
 *   END; $$ LANGUAGE plpgsql;
 *   CREATE TRIGGER triage_critical_alert AFTER INSERT ON triage_sessions
 *   FOR EACH ROW WHEN (NEW.red_flag_detected) EXECUTE FUNCTION notify_clinician();
 */
export default function CriticalAlertSystem() {
  const [alerts, setAlerts] = useState([]);
  const [acknowledged, setAcknowledged] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const audioRef = useRef(null);

  // Load existing red-flag sessions on mount
  useEffect(() => {
    (async () => {
      try {
        const existing = await base44.entities.TriageSession.filter({ red_flag_detected: true }, '-created_date', 10);
        if (existing && existing.length > 0) {
          setAlerts(existing);
        }
      } catch { /* demo mode */ }
    })();
  }, []);

  // Real-time subscription for new critical alerts
  useEffect(() => {
    const unsubscribe = base44.entities.TriageSession.subscribe((event) => {
      if (event.type === 'create' && event.data.red_flag_detected) {
        setAlerts(prev => [event.data, ...prev].slice(0, 20));
        if (soundEnabled) playAlertSound();
        // Create a SecureMessage to notify clinicians
        notifyClinicians(event.data);
      }
    });
    return unsubscribe;
  }, [soundEnabled]);

  const playAlertSound = () => {
    try {
      // Use Web Audio API for a simple alert beep
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
    osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* audio not available */ }
  };

  const notifyClinicians = async (session) => {
    try {
      /*
      // SUPABASE: await supabase.from('secure_messages').insert({
      //   sender_id: 'system', recipient_id: 'clinician_on_call',
      //   subject: 'CRITICAL: Red Flag Triage Alert',
      //   body: `Session ${session.id}: ${session.ai_response}`
      // });
      */
      await base44.entities.SecureMessage.create({
        sender_id: 'system',
        recipient_id: 'clinician_on_call',
        subject: 'CRITICAL: Red Flag Triage Alert',
        body: `Urgency: ${session.urgency_level}. ${session.ai_response || session.symptoms_text || 'Emergency detected'}. Channel: ${session.channel}. Review immediately.`,
        sender_role: 'system',
        recipient_role: 'clinician',
      });
    } catch { /* demo mode */ }
  };

  const acknowledge = (alertId) => {
    setAcknowledged(prev => new Set([...prev, alertId]));
  };

  const dismiss = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setAcknowledged(prev => { const n = new Set(prev); n.delete(alertId); return n; });
  };

  const dispatchChp = async (session) => {
    try {
      await base44.entities.ChpDispatch.create({
        session_id: session.id,
        chp_id: session.profile_id,
        reason: session.ai_response || 'Critical triage escalation',
        red_flag: true,
        first_aid_instructions: session.red_flag_details || 'Provide standard emergency first aid',
        dispatch_status: 'sent',
        dispatched_at: new Date().toISOString(),
      });
      acknowledge(session.id);
      alert('CHP dispatched for critical case.');
    } catch (e) { alert('Dispatch failed: ' + e.message); }
  };

  const unacknowledged = alerts.filter(a => !acknowledged.has(a.id));
  const hasActiveAlerts = unacknowledged.length > 0;

  return (
    <div className="space-y-3">
      {/* Alert banner */}
      {hasActiveAlerts && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4 animate-pulse-once">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-6 h-6 text-red-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unacknowledged.length}
                </span>
              </div>
              <h3 className="font-bold text-red-700">CRITICAL ALERT — {unacknowledged.length} Emergency{unacknowledged.length > 1 ? 'ies' : ''} Need Review</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-lg bg-red-100 text-red-600" title={soundEnabled ? 'Mute' : 'Unmute'}>
                <Volume2 className="w-4 h-4" />
              </button>
              <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg bg-red-100 text-red-600">
                {expanded ? <X className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert list */}
      {expanded && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert_item => {
            const isAck = acknowledged.has(alert_item.id);
            return (
              <div key={alert_item.id} className={`rounded-lg border-2 p-4 ${isAck ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-red-400 bg-red-50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${isAck ? 'text-slate-400' : 'text-red-600'}`} />
                      <UrgencyBadge level={alert_item.urgency_level} size="sm" />
                      <span className="text-xs text-muted-foreground">{new Date(alert_item.created_date).toLocaleString()}</span>
                      {isAck && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Acknowledged</span>}
                    </div>
                    {alert_item.red_flag_details && (
                      <p className="text-xs font-mono text-red-600 mb-1">{alert_item.red_flag_details}</p>
                    )}
                    <p className="text-sm text-slate-700">{alert_item.ai_response || alert_item.symptoms_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Channel: {alert_item.channel} · Domain: {alert_item.domain_module?.replace(/_/g, ' ')}
                      {alert_item.confidence_score && ` · Confidence: ${(alert_item.confidence_score * 100).toFixed(0)}%`}
                    </p>
                  </div>
                  {!isAck && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => dispatchChp(alert_item)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium min-h-[40px]">
                        <Send className="w-4 h-4" /> Dispatch CHP
                      </button>
                      <button onClick={() => acknowledge(alert_item.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium min-h-[40px]">
                        <CheckCircle className="w-4 h-4" /> Acknowledge
                      </button>
                    </div>
                  )}
                  {isAck && (
                    <button onClick={() => dismiss(alert_item.id)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-200">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {alerts.length === 0 && !hasActiveAlerts && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-sm text-muted-foreground">No critical alerts. Monitoring in real-time...</p>
        </div>
      )}
    </div>
  );
}