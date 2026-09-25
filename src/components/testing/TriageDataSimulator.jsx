import React, { useState } from 'react';
import { useChannelTriage } from '@/components/ingestion/useChannelTriage';
import {
  generateTestBatch, verifyTriageResult,
  DOMAINS, URGENCIES, CHANNELS, LANGUAGES, PATIENT_SCENARIOS,
} from '@/lib/patientDataGenerator';
import UrgencyBadge from '@/components/UrgencyBadge';
import { LoadingState } from '@/components/States';
import {
  FlaskConical, Play, CheckCircle, XCircle, RefreshCw,
  MessageCircle, Hash, PhoneCall, Globe, AlertTriangle, ChevronDown, ChevronRight,
} from 'lucide-react';

const CHANNEL_ICONS = {
  whatsapp: MessageCircle, ussd: Hash, ivr: PhoneCall, web: Globe,
};

const CHANNEL_LABELS = {
  whatsapp: 'SMS / WhatsApp', ussd: 'USSD (Feature Phone)',
  ivr: 'Voice / IVR (Transcribed)', web: 'Web Chat',
};

export default function TriageDataSimulator() {
  const [config, setConfig] = useState({
    count: 5, channel: 'whatsapp', domain: 'all', urgency: 'all', language: 'all',
  });
  const [batch, setBatch] = useState([]);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const { runChannelTriage, loading } = useChannelTriage();

  const generateBatch = () => {
    const newBatch = generateTestBatch(config);
    setBatch(newBatch);
    setResults([]);
  };

  const runSingleTest = async (testCase, index) => {
    try {
      const result = await runChannelTriage({
        symptomsText: testCase.formattedText,
        language: testCase.language,
        domainModule: testCase.domain,
        channel: testCase.channel,
        profileId: 'test_' + testCase.id,
      });
      const verification = verifyTriageResult(testCase, result);
      setResults(prev => {
        const updated = [...prev];
        updated[index] = { ...verification, testCase, result };
        return updated;
      });
    } catch (err) {
      setResults(prev => {
        const updated = [...prev];
        updated[index] = {
          passed: false, error: err.message,
          testCase, result: null,
          expected: { urgency: testCase.expectedUrgency, redFlag: testCase.expectedRedFlag },
          actual: { urgency: 'ERROR', redFlag: false },
          details: { scenarioId: testCase.id, scenarioName: testCase.name, domain: testCase.domain, channel: testCase.channel },
        };
        return updated;
      });
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setResults(new Array(batch.length).fill(null));
    for (let i = 0; i < batch.length; i++) {
      await runSingleTest(batch[i], i);
    }
    setRunning(false);
  };

  const passedCount = results.filter(r => r?.passed).length;
  const failedCount = results.filter(r => r && !r.passed).length;
  const completedCount = results.filter(r => r !== null).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FlaskConical className="w-5 h-5" /> Triage Intake Simulator
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generate realistic Kenyan patient symptom data across channels to verify the triage intake pipeline.
          Each test case has ground-truth labels for pass/fail validation.
        </p>
      </div>

      {/* Config panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Channel</label>
            <select value={config.channel} onChange={e => setConfig({ ...config, channel: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm min-h-[44px]">
              {CHANNELS.map(c => <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Domain</label>
            <select value={config.domain} onChange={e => setConfig({ ...config, domain: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm min-h-[44px]">
              {DOMAINS.map(d => <option key={d} value={d}>{d === 'all' ? 'All Domains' : d.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Urgency</label>
            <select value={config.urgency} onChange={e => setConfig({ ...config, urgency: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm min-h-[44px]">
              {URGENCIES.map(u => <option key={u} value={u}>{u === 'all' ? 'All Levels' : u}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
            <select value={config.language} onChange={e => setConfig({ ...config, language: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm min-h-[44px]">
              {LANGUAGES.map(l => <option key={l} value={l}>{l === 'all' ? 'All Languages' : l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Count</label>
            <input type="number" min="1" max="20" value={config.count}
              onChange={e => setConfig({ ...config, count: Math.min(20, Math.max(1, parseInt(e.target.value) || 1)) })}
              className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm min-h-[44px]" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={generateBatch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium min-h-[44px]">
            <FlaskConical className="w-4 h-4" /> Generate Test Cases
          </button>
          <button onClick={runAllTests} disabled={batch.length === 0 || running}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px] disabled:opacity-50">
            {running ? <LoadingState message="Running..." /> : <><Play className="w-4 h-4" /> Run All Tests</>}
          </button>
          <button onClick={() => { setBatch([]); setResults([]); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border text-sm min-h-[44px]">
            <RefreshCw className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>

      {/* Results summary */}
      {completedCount > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{passedCount}</p>
            <p className="text-xs text-muted-foreground">Passed</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{failedCount}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-600">{((passedCount / completedCount) * 100).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Pass Rate</p>
          </div>
        </div>
      )}

      {/* Test cases */}
      {batch.length > 0 && (
        <div className="space-y-2">
          {batch.map((tc, i) => {
            const result = results[i];
            const isExpanded = expandedId === i;
            const ChannelIcon = CHANNEL_ICONS[tc.channel] || Globe;
            return (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedId(isExpanded ? null : i)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {result ? (
                        result.passed
                          ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-medium">{tc.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{tc.id}</span>
                          <ChannelIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-muted-foreground">{tc.channel}</span>
                          <span className="text-xs text-muted-foreground">· {tc.domain.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-muted-foreground">· {tc.language}</span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{tc.formattedText}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">Expected:</span>
                          <UrgencyBadge level={tc.expectedUrgency} size="sm" />
                          {tc.expectedRedFlag && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Red Flag
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">
                    {/* Original vs formatted */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Channel-formatted input ({tc.channel}):</p>
                      <p className="text-sm bg-white rounded-lg border border-slate-200 p-3 font-mono">{tc.formattedText}</p>
                    </div>
                    {tc.formattedText !== tc.originalText && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">Original symptom text:</p>
                        <p className="text-sm bg-white rounded-lg border border-slate-200 p-3 italic">{tc.originalText}</p>
                      </div>
                    )}

                    {/* Test result */}
                    {result && !result.error && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-semibold text-slate-500">Actual:</span>
                          <UrgencyBadge level={result.actual.urgency} size="sm" />
                          {result.actual.redFlag && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Red Flag
                            </span>
                          )}
                          {result.details.confidence != null && (
                            <span className="text-xs text-muted-foreground">
                              Confidence: {(result.details.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <VerifyRow label="Urgency Match" passed={result.urgencyMatch} />
                          <VerifyRow label="Red Flag Match" passed={result.redFlagMatch} />
                        </div>
                        {result.details.aiResponse && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-1">AI Response:</p>
                            <p className="text-sm bg-white rounded-lg border border-slate-200 p-3">{result.details.aiResponse}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {result?.error && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        Error: {result.error}
                      </div>
                    )}

                    {/* Run single test button */}
                    {!result && (
                      <button onClick={() => runSingleTest(tc, i)} disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[40px] disabled:opacity-50">
                        {loading ? <LoadingState message="Running..." /> : <><Play className="w-4 h-4" /> Run This Test</>}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {batch.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">No test cases generated</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {PATIENT_SCENARIOS.length} realistic Kenyan patient scenarios available.
            Configure filters and click "Generate Test Cases" to start.
          </p>
        </div>
      )}
    </div>
  );
}

function VerifyRow({ label, passed }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
      {passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}