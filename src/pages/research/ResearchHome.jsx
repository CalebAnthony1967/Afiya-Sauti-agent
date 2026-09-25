import React, { useState } from 'react';
import { invokeAgent } from '@/lib/aiAgents';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState } from '@/components/States';
import { TestTube, Search, FileDown, ShieldCheck } from 'lucide-react';

export default function ResearchHome() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await invokeAgent('research_agent', query, {
        addContext: true,
        responseSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            key_findings: { type: 'array', items: { type: 'string' } },
            citations: { type: 'array', items: { type: 'object', properties: { source: { type: 'string' }, title: { type: 'string' }, url: { type: 'string' } } } },
            confidence: { type: 'number' },
            limitations: { type: 'string' },
          },
        },
      });
      setResult(res);
      setHistory(h => [{ query, result: res, date: new Date().toISOString() }, ...h].slice(0, 10));
    } finally { setLoading(false); }
  };

  const exportReport = () => {
    if (!result) return;
    const report = `# Research Report\n\nQuery: ${query}\n\nDate: ${new Date().toLocaleString()}\n\n## Summary\n${result.summary}\n\n## Key Findings\n${(result.key_findings || []).map(f => '- ' + f).join('\n')}\n\n## Citations\n${(result.citations || []).map(c => `- ${c.source}: ${c.title} (${c.url || 'N/A'})`).join('\n')}\n\n## Confidence\n${(result.confidence * 100).toFixed(0)}%\n\n## Limitations\n${result.limitations || 'None noted'}\n`;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `research-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><TestTube className="w-5 h-5" /> Research Query</h2>
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center gap-2 text-sm text-blue-800">
        <ShieldCheck className="w-4 h-4" />
        No patient-level identifiable data is accessible. Only anonymised, aggregated data.
      </div>
      <div className="flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Ask a research question (e.g. malaria prevalence trends in Western Kenya)..." className="flex-1 rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
        <button onClick={search} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px] disabled:opacity-50">
          {loading ? <LoadingState message="Searching..." /> : <><Search className="w-4 h-4" /> Search</>}
        </button>
      </div>

      {result && !loading && (
        <div className="space-y-3">
          <AIRecommendation
            title="Research Synthesis"
            content={result.summary}
            citations={result.citations || []}
            confidence={result.confidence}
            agentName="research_agent"
          />
          {result.key_findings?.length > 0 && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-sm mb-2">Key Findings</h3>
              <ul className="space-y-1 text-sm">
                {result.key_findings.map((f, i) => <li key={i} className="text-slate-700">• {f}</li>)}
              </ul>
            </div>
          )}
          {result.limitations && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <strong>Limitations:</strong> {result.limitations}
            </div>
          )}
          <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium min-h-[44px]">
            <FileDown className="w-4 h-4" /> Export Report
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Recent Queries</h3>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className="text-xs text-muted-foreground bg-white rounded border p-2">
                {h.query} — {new Date(h.date).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}