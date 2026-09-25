import React, { useState } from 'react';
import { invokeAgent } from '@/lib/aiAgents';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState } from '@/components/States';
import { Monitor, Send } from 'lucide-react';

export default function DeveloperSandbox() {
  const [endpoint, setEndpoint] = useState('/triage');
  const [payload, setPayload] = useState('{\n  "symptoms": "fever and cough",\n  "language": "sw"\n}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const test = async () => {
    setLoading(true);
    try {
      const res = await invokeAgent('developer_agent', `Test endpoint ${endpoint} with payload ${payload}. Simulate the API response.`);
      setResponse(res);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Monitor className="w-5 h-5" /> Sandbox Environment</h2>
      <div className="bg-white rounded-xl border p-4 space-y-3">
        <input type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="/triage" className="w-full rounded-lg border px-3 py-2 text-sm font-mono min-h-[44px]" />
        <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={6} className="w-full rounded-lg border px-3 py-2 text-sm font-mono resize-none" />
        <button onClick={test} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px] disabled:opacity-50">
          {loading ? <LoadingState message="Testing..." /> : <><Send className="w-4 h-4" /> Send Request</>}
        </button>
      </div>
      {response && (
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-sm mb-2">Response</h3>
          <pre className="text-xs bg-slate-50 rounded p-3 overflow-x-auto font-mono">{typeof response === 'string' ? response : JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}