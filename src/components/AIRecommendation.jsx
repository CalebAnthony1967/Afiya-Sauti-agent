import React from 'react';
import { Sparkles, Info } from 'lucide-react';

/**
 * AI Recommendation Card
 * Clearly distinguishes AI suggestions from system information.
 * Always shows source and confidence.
 */
export default function AIRecommendation({ title = 'AI Recommendation', content, citations = [], confidence, agentName, children }) {
  const confidenceLabel = confidence != null
    ? confidence >= 0.85 ? 'High' : confidence >= 0.6 ? 'Medium' : 'Low'
    : null;
  const confidenceColor = confidence != null
    ? confidence >= 0.85 ? 'text-green-600' : confidence >= 0.6 ? 'text-amber-600' : 'text-red-600'
    : null;

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4 my-3">
      <div className="flex items-start gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-violet-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-violet-900">{title}</span>
            {agentName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                {agentName.replace('_', ' ')}
              </span>
            )}
            {confidenceLabel && (
              <span className={`text-xs font-medium ${confidenceColor}`}>
                Confidence: {confidenceLabel} ({(confidence * 100).toFixed(0)}%)
              </span>
            )}
          </div>
          <p className="text-xs text-violet-600 mt-0.5 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Recommendation only — human review required
          </p>
        </div>
      </div>

      {content && <div className="text-sm text-slate-700 prose prose-sm max-w-none">{content}</div>}
      {children}

      {citations && citations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-violet-200">
          <p className="text-xs font-semibold text-violet-700 mb-1">Sources:</p>
          <ul className="space-y-1">
            {citations.map((c, i) => (
              <li key={i} className="text-xs text-slate-600">
                • {c.source || c.title || 'Verified source'}
                {c.title && c.source && ` — ${c.title}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}