/**
 * Triage Analytics — AfiyaSauti
 * Computes aggregates from TriageSession records for dashboards & exports.
 *
 * SUPABASE ALTERNATIVE:
 * Replace client-side aggregation with Postgres views / materialized views:
 *   CREATE VIEW v_urgency_distribution AS
 *   SELECT urgency_level, COUNT(*) FROM triage_sessions GROUP BY 1;
 *   CREATE VIEW v_daily_summary AS
 *   SELECT date_trunc('day', created_at)::date AS day, urgency_level,
 *          COUNT(*) FROM triage_sessions GROUP BY 1, 2;
 * Or use Supabase RPC: supabase.rpc('get_daily_summary', { target_date })
 */

export function computeUrgencyDistribution(sessions) {
  const dist = { RED: 0, YELLOW: 0, GREEN: 0, UNCERTAIN_EDGE_TRIAGE: 0 };
  (sessions || []).forEach(s => {
    const level = s.urgency_level || 'GREEN';
    dist[level] = (dist[level] || 0) + 1;
  });
  return Object.entries(dist).map(([name, value]) => ({ name, value }));
}

export function computeDomainDistribution(sessions) {
  const dist = {};
  (sessions || []).forEach(s => {
    const d = s.domain_module || 'general';
    dist[d] = (dist[d] || 0) + 1;
  });
  return Object.entries(dist).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
}

export function computeSymptomTrends(sessions, days = 7) {
  const now = new Date();
  const trends = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const daySessions = (sessions || []).filter(s => {
      const sd = s.created_date || s.created_at;
      return sd && new Date(sd).toISOString().split('T')[0] === dateStr;
    });
    trends.push({
      date: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      total: daySessions.length,
      red: daySessions.filter(s => s.urgency_level === 'RED').length,
      yellow: daySessions.filter(s => s.urgency_level === 'YELLOW').length,
      green: daySessions.filter(s => s.urgency_level === 'GREEN').length,
      redFlags: daySessions.filter(s => s.red_flag_detected).length,
    });
  }
  return trends;
}

export function computeICD11Distribution(sessions) {
  const dist = {};
  (sessions || []).forEach(s => {
    (s.icd11_codes || []).forEach(code => {
      dist[code] = (dist[code] || 0) + 1;
    });
  });
  return Object.entries(dist)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function computeChannelDistribution(sessions) {
  const dist = {};
  (sessions || []).forEach(s => {
    const c = s.channel || 'web';
    dist[c] = (dist[c] || 0) + 1;
  });
  return Object.entries(dist).map(([name, value]) => ({ name, value }));
}

export function computeConfidenceMetrics(sessions) {
  const valid = (sessions || []).filter(s => s.confidence_score != null);
  if (valid.length === 0) return { avg: 0, min: 0, max: 0, belowThreshold: 0, count: 0 };
  const scores = valid.map(s => s.confidence_score);
  return {
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    min: Math.min(...scores),
    max: Math.max(...scores),
    belowThreshold: valid.filter(s => s.confidence_score < 0.85).length,
    count: valid.length,
  };
}

export function computeCountyDistribution(sessions) {
  const dist = {};
  (sessions || []).forEach(s => {
    // Profile county would need a join; for now use metadata if present
    const c = s.metadata?.county || 'Unknown';
    dist[c] = (dist[c] || 0) + 1;
  });
  return Object.entries(dist)
    .map(([county, count]) => ({ county, count }))
    .sort((a, b) => b.count - a.count);
}

export function computeDailySummary(sessions, date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const daySessions = (sessions || []).filter(s => {
    const sd = s.created_date || s.created_at;
    return sd && new Date(sd).toISOString().split('T')[0] === dateStr;
  });
  return {
    date: dateStr,
    total: daySessions.length,
    red: daySessions.filter(s => s.urgency_level === 'RED').length,
    yellow: daySessions.filter(s => s.urgency_level === 'YELLOW').length,
    green: daySessions.filter(s => s.urgency_level === 'GREEN').length,
    uncertain: daySessions.filter(s => s.urgency_level === 'UNCERTAIN_EDGE_TRIAGE').length,
    redFlags: daySessions.filter(s => s.red_flag_detected).length,
    escalated: daySessions.filter(s => s.status === 'escalated').length,
    completed: daySessions.filter(s => s.status === 'completed').length,
    avgConfidence: computeConfidenceMetrics(daySessions).avg,
    byDomain: computeDomainDistribution(daySessions),
    byChannel: computeChannelDistribution(daySessions),
    topICD11: computeICD11Distribution(daySessions),
  };
}

export function autoAssignPriority(session) {
  if (session.red_flag_detected || session.urgency_level === 'RED') return 'P1_CRITICAL';
  if (session.urgency_level === 'YELLOW') return 'P2_URGENT';
  if (session.urgency_level === 'UNCERTAIN_EDGE_TRIAGE') return 'P3_REVIEW';
  return 'P4_ROUTINE';
}

export function formatSummaryForExport(summary) {
  const rows = [
    ['AfiyaSauti Daily Triage Summary'],
    ['Date', summary.date],
    ['Total Sessions', summary.total],
    ['Red (Emergency)', summary.red],
    ['Yellow (Urgent)', summary.yellow],
    ['Green (Routine)', summary.green],
    ['Uncertain (Escalated)', summary.uncertain],
    ['Red Flags Detected', summary.redFlags],
    ['Escalated to Clinician', summary.escalated],
    ['Completed', summary.completed],
    ['Avg Confidence', `${(summary.avgConfidence * 100).toFixed(1)}%`],
    [],
    ['Domain Breakdown'],
    ...summary.byDomain.map(d => [d.name, d.value]),
    [],
    ['Channel Breakdown'],
    ...summary.byChannel.map(c => [c.name, c.value]),
    [],
    ['Top ICD-11 Codes'],
    ...summary.topICD11.map(c => [c.code, c.count]),
  ];
  return rows;
}

export function formatSessionsForExport(sessions) {
  const headers = ['Session ID', 'Date', 'Channel', 'Domain', 'Urgency', 'Red Flag', 'ICD-11 Codes', 'Confidence', 'Status', 'AI Response'];
  const rows = (sessions || []).map(s => [
    s.session_id || s.id,
    new Date(s.created_date || s.created_at).toLocaleString(),
    s.channel,
    s.domain_module,
    s.urgency_level,
    s.red_flag_detected ? 'YES' : 'NO',
    (s.icd11_codes || []).join('; '),
    s.confidence_score ? (s.confidence_score * 100).toFixed(0) + '%' : 'N/A',
    s.status,
    (s.ai_response || '').substring(0, 200),
  ]);
  return [headers, ...rows];
}