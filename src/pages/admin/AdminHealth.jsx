import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState } from '@/components/States';
import { Activity, Cpu, Shield, Database, Server } from 'lucide-react';

export default function AdminHealth() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const [sessions, notes, audits, telemetry] = await Promise.all([
          base44.entities.TriageSession.list(),
          base44.entities.ClinicalSoapNote.list(),
          base44.entities.AuditLog.list(),
          base44.entities.VitalTelemetry.list(),
        ]);
        setStats({
          sessions: sessions?.length || 0,
          notes: notes?.length || 0,
          audits: audits?.length || 0,
          telemetry: telemetry?.length || 0,
        });
      } finally { setLoading(false); }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingState />;

  const cards = [
    { label: 'Triage Sessions', value: stats.sessions, icon: Activity, color: 'text-blue-600 bg-blue-100' },
    { label: 'SOAP Notes', value: stats.notes, icon: FileText, color: 'text-violet-600 bg-violet-100' },
    { label: 'Audit Entries', value: stats.audits, icon: Shield, color: 'text-green-600 bg-green-100' },
    { label: 'Telemetry Points', value: stats.telemetry, icon: Cpu, color: 'text-amber-600 bg-amber-100' },
  ];

  function FileText(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>; }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Server className="w-5 h-5" /> System Health</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl border p-4">
              <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Database className="w-4 h-4" /> Data Residency</h3>
        <p className="text-sm text-muted-foreground">All data stored in Kenya-region infrastructure per Digital Health Act 2023.</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-sm">Operational</span>
        </div>
      </div>
    </div>
  );
}