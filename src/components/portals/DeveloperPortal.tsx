import React, { useState } from 'react';
import { FileCode, Key, Webhook, Terminal, CheckCircle2, Copy, Send, ExternalLink } from 'lucide-react';
import { generateFHIRDiagnosticReport } from '../../services/fhirConverter';

export const DeveloperPortal: React.FC = () => {
  const [apiKey, setApiKey] = useState('afya_live_sec_9941a8b27c3e410f9201a4e58b');
  const [copiedKey, setCopiedKey] = useState(false);
  const [testEndpoint, setTestEndpoint] = useState('/api/triage/process');
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(
      {
        channel: 'WHATSAPP',
        senderIdentifier: '+254712000000',
        rawText: 'Mtoto ana shida ya kupumua na kikohozi kikuu',
        preferredLanguage: 'sw',
        consentGranted: true
      },
      null,
      2
    )
  );

  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRunCurl = async () => {
    setIsRunning(true);
    try {
      const parsed = JSON.parse(testPayload);
      const res = await fetch(testEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsRunning(false);
    }
  };

  const sampleFHIR = JSON.stringify(
    generateFHIRDiagnosticReport({
      sessionId: 'SES-TEST-01',
      patientHash: 'dpa2019_hmac_patient_hash_7749',
      chiefComplaint: 'Tachypnea and fever in 8-month-old infant',
      urgency: 'RED',
      primaryProtocol: 'Kenya Basic Paediatric Protocols v5.2',
      icd11Codes: [{ code: 'CA40', title: 'Pneumonia without specified organism' }],
      confidence: 0.96
    }),
    null,
    2
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Developer & Integration Portal</h2>
                <span className="px-2 py-0.5 rounded text-[11px] bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  HL7 FHIR R4 & OpenHIM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                REST APIs, Interoperability Sandboxes, Webhook Dispatch & Gateway Credentials
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Credentials & Webhook Config */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-400" />
              API Key Management (mTLS & Bearer Token)
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Active Production API Key:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-teal-300 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyKey}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Headers required: <code className="text-slate-400">Authorization: Bearer afya_...</code> and{' '}
              <code className="text-slate-400">X-OpenHIM-Transaction-ID</code>
            </p>
          </div>

          {/* Webhook Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Webhook className="w-4 h-4 text-emerald-400" />
              OpenHIM Webhook Forwarding
            </h3>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">eCHIS Event Receiver</div>
                  <div className="text-slate-400 font-mono text-[11px]">https://echis.health.go.ke/api/v2/events</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                  ACTIVE
                </span>
              </div>

              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">MoH KHIS Surveillance Ingest</div>
                  <div className="text-slate-400 font-mono text-[11px]">https://khis.health.go.ke/dhis/api/dataValues</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive API Sandbox */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-teal-400" />
                Interactive API Runner
              </h3>
              <button
                onClick={handleRunCurl}
                disabled={isRunning}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isRunning ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-teal-950 text-teal-300 border border-teal-800 rounded text-xs font-mono font-bold">
                  POST
                </span>
                <input
                  type="text"
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
                />
              </div>

              <textarea
                rows={5}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-teal-300 font-mono focus:outline-none"
              />

              {testResponse && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold">Response:</span>
                  <pre className="w-full max-h-48 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] text-emerald-300 font-mono">
                    {testResponse}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FHIR R4 Mapping Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          HL7 FHIR R4 DiagnosticReport Serialization
        </h3>
        <p className="text-xs text-slate-400">
          Generated automatically by AfiyaSauti for each clinical encounter under Kenya Digital Health Act 2023.
        </p>

        <pre className="w-full max-h-56 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-4 text-[11px] text-slate-300 font-mono leading-relaxed">
          {sampleFHIR}
        </pre>
      </div>
    </div>
  );
};
