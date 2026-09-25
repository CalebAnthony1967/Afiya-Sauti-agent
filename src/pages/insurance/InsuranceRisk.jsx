import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState } from '@/components/States';
import { Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function InsuranceRisk() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setSessions(await base44.entities.TriageSession.list('-created_date', 100) || []); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingState />;

  const byUrgency = ['RED', 'YELLOW', 'GREEN'].map(u => ({
    name: u,
    count: sessions.filter(s => s.urgency_level === u).length,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Activity className="w-5 h-5" /> Aggregated Risk Indicators</h2>
      <p className="text-sm text-muted-foreground">Anonymised, aggregated risk overview. No patient-level data.</p>
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-sm mb-3">Risk Distribution by Urgency</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={byUrgency}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}