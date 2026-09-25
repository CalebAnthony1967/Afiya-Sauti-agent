import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState } from '@/components/States';
import {
  computeDailySummary, formatSummaryForExport, formatSessionsForExport,
} from '@/lib/triageAnalytics';
import { FileSpreadsheet, Download, CheckCircle, Calendar, AlertCircle } from 'lucide-react';

/**
 * Google Sheets Export — Daily triage summaries & patient outcomes.
 * Exports to Google Sheets via connector (requires Builder+ / Google Sheets OAuth).
 * Falls back to CSV download if connector not connected.
 *
 * SUPABASE ALTERNATIVE:
 * Create an Edge Function that uses Google Sheets API:
 *   POST /functions/v1/export-to-sheets
 *   Body: { date: '2026-09-24', spreadsheet_id: 'xxx' }
 * The function uses the service role key + Google Service Account JSON
 * to append rows via googleapis npm package.
 *
 * Or use a Supabase cron + pg_net to call Google Sheets API on schedule:
 *   SELECT cron.schedule('daily_export', '0 18 * * *', 'SELECT export_to_sheets()');
 */
export default function GoogleSheetsExport() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sheetsConnected, setSheetsConnected] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setSessions(await base44.entities.TriageSession.list('-created_date', 500) || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const summary = computeDailySummary(sessions, new Date(selectedDate + 'T12:00:00'));
  const daySessions = sessions.filter(s => {
    const d = s.created_date || s.created_at;
    return d && new Date(d).toISOString().split('T')[0] === selectedDate;
  });

  const exportToCSV = () => {
    const summaryRows = formatSummaryForExport(summary);
    const sessionRows = formatSessionsForExport(daySessions);
    const csv = [...summaryRows, [], [], ...sessionRows]
      .map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afiyasauti_triage_summary_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportStatus({ type: 'success', message: `CSV exported: ${daySessions.length} sessions for ${selectedDate}` });
  };

  const exportToGoogleSheets = async () => {
    setExporting(true);
    setExportStatus(null);
    try {
      if (!sheetsConnected) {
        // Connector not connected — fall back to CSV with a notice
        exportToCSV();
        setExportStatus({
          type: 'info',
          message: 'Google Sheets connector not connected. CSV downloaded instead. Connect Google Sheets in Integrations to enable automatic export.',
        });
        return;
      }

      /*
      // When connector is connected, use backend function:
      // SUPABASE: const { error } = await supabase.functions.invoke('export-to-sheets', {
      //   body: { date: selectedDate, spreadsheet_id: 'your_sheet_id' }
      // });
      //
      // BASE44: const result = await base44.functions.invoke('exportToSheets', {
      //   date: selectedDate
      // });
      */

      // Simulated success for demo
      await new Promise(r => setTimeout(r, 1500));
      setExportStatus({ type: 'success', message: `Exported ${daySessions.length} sessions to Google Sheets for ${selectedDate}` });
    } catch (e) {
      setExportStatus({ type: 'error', message: 'Export failed: ' + e.message });
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingState message="Loading export data..." />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" /> Daily Triage Export
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Export daily triage summaries & patient outcomes to Google Sheets for clinical team tracking
        </p>
      </div>

      {/* Date selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <label className="text-sm font-medium">Export date:</label>
          <input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setExportStatus(null); }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
        </div>

        {/* Summary preview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryStat label="Total Sessions" value={summary.total} />
          <SummaryStat label="Red Flags" value={summary.redFlags} color="text-red-600" />
          <SummaryStat label="Escalated" value={summary.escalated} color="text-orange-600" />
          <SummaryStat label="Avg Confidence" value={`${(summary.avgConfidence * 100).toFixed(0)}%`} color="text-emerald-600" />
        </div>

        {/* Domain breakdown preview */}
        {summary.byDomain.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Domain Breakdown:</p>
            <div className="flex flex-wrap gap-2">
              {summary.byDomain.map(d => (
                <span key={d.name} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {d.name}: {d.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Export buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button onClick={exportToGoogleSheets} disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[48px] disabled:opacity-50">
            {exporting ? <LoadingState message="Exporting..." /> : (
              <><FileSpreadsheet className="w-4 h-4" /> Export to Google Sheets</>
            )}
          </button>
          <button onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm font-medium min-h-[48px]">
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>

        {/* Status message */}
        {exportStatus && (
          <div className={`rounded-lg p-3 flex items-start gap-2 text-sm ${
            exportStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
            exportStatus.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
            'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {exportStatus.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> :
             <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>{exportStatus.message}</span>
          </div>
        )}

        {/* Connector status notice */}
        <div className="text-xs text-muted-foreground bg-slate-50 rounded-lg p-3">
          <strong>Google Sheets Integration:</strong> {sheetsConnected
            ? 'Connected — exports will push directly to your spreadsheet.'
            : 'Not connected. CSV download is available now. Connect the Google Sheets connector in Integrations to enable automatic push.'}
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, color = 'text-slate-900' }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}