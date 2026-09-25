import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState, EmptyState } from '@/components/States';
import { invokeAgent } from '@/lib/aiAgents';
import { Monitor, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CommunityHome() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiExplain, setAiExplain] = useState(null);

  useEffect(() => {
    (async () => {
      try { setSignals(await base44.entities.OutbreakSignal.list('-detected_at', 20) || []); }
      finally { setLoading(false); }
    })();
    invokeAgent('community_intel_agent', 'Explain current community health trends in plain language from anonymised data.').then(setAiExplain).catch(() => {});
  }, []);

  if (loading) return <LoadingState />;

  const trendData = signals.slice(0, 10).reverse().map((s, i) => ({
    name: `W${i + 1}`,
    cases: s.case_count || 0,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Monitor className="w-5 h-5" /> Community Health Intelligence</h2>
      <p className="text-sm text-muted-foreground">Anonymised, aggregated village-level insights. No identifiable data.</p>

      {aiExplain && (
        <AIRecommendation title="Trend Explanation" content={typeof aiExplain === 'string' ? aiExplain : aiExplain.assessment || JSON.stringify(aiExplain)} agentName="community_intel_agent" confidence={0.85} citations={[{ source: 'Aggregated Data', title: 'Community Summaries' }]} />
      )}

      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Case Trends</h3>
        {trendData.length === 0 ? <EmptyState icon={TrendingUp} title="No data yet" /> : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="cases" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-sm mb-2">Resource Notes</h3>
        <ul className="space-y-1 text-sm text-slate-700">
          <li>• CHP visits available weekly</li>
          <li>• Nearest dispensary: 2km</li>
          <li>• Free malaria RDT testing available</li>
        </ul>
      </div>
    </div>
  );
}