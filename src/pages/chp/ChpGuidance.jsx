import React, { useState } from 'react';
import { invokeAgent } from '@/lib/aiAgents';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState } from '@/components/States';
import { BookOpen, Search } from 'lucide-react';

const TOPICS = [
  'Pneumonia in children under 5 (IMCI)',
  'Malaria diagnosis and treatment',
  'Danger signs in pregnancy',
  'Hypertension management',
  'Diabetes foot care',
  'Mental health first aid',
];

export default function ChpGuidance() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (q) => {
    setQuery(q);
    setLoading(true);
    try {
      const res = await invokeAgent('chp_guide_agent', q, { addContext: true });
      setResult(res);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><BookOpen className="w-5 h-5" /> Guidance Library</h2>
      <div className="flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search IMCI / MoH guidance..." className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[44px]" />
        <button onClick={() => search(query)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]"><Search className="w-4 h-4" /></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map(t => (
          <button key={t} onClick={() => search(t)} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 min-h-[36px]">{t}</button>
        ))}
      </div>
      {loading && <LoadingState message="Retrieving grounded guidance..." />}
      {result && !loading && (
        <AIRecommendation
          title="Grounded Guidance"
          content={typeof result === 'string' ? result : result.assessment || JSON.stringify(result)}
          agentName="chp_guide_agent"
          confidence={0.9}
          citations={[{ source: 'IMCI', title: 'Kenya MoH CHV Manual' }, { source: 'WHO', title: 'Standard Protocols' }]}
        />
      )}
    </div>
  );
}