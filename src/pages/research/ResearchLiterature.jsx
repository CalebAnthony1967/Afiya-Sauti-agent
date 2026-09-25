import React, { useState } from 'react';
import { invokeAgent } from '@/lib/aiAgents';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState } from '@/components/States';
import { BookOpen, Search } from 'lucide-react';

export default function ResearchLiterature() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await invokeAgent('research_agent', `Literature search: ${query}. Provide verified scientific sources only with citations.`, {
        addContext: true,
        responseSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            sources: { type: 'array', items: { type: 'object', properties: { source: { type: 'string' }, title: { type: 'string' }, url: { type: 'string' }, year: { type: 'string' } } } },
            confidence: { type: 'number' },
          },
        },
      });
      setResult(res);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><BookOpen className="w-5 h-5" /> Literature & Guideline Search</h2>
      <p className="text-sm text-muted-foreground">RAG retrieval from verified scientific and guideline sources only.</p>
      <div className="flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Search literature..." className="flex-1 rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
        <button onClick={search} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px] disabled:opacity-50">
          {loading ? <LoadingState message="Retrieving..." /> : <Search className="w-4 h-4" />}
        </button>
      </div>
      {result && !loading && (
        <AIRecommendation
          title="Literature Results"
          content={result.summary}
          citations={result.sources || []}
          confidence={result.confidence}
          agentName="research_agent"
        />
      )}
    </div>
  );
}