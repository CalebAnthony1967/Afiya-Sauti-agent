import React from 'react';
import { FileText } from 'lucide-react';

export default function DeveloperFhir() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> FHIR R4 Mapping Documentation</h2>
      <div className="bg-white rounded-xl border p-4 space-y-4 text-sm">
        <div>
          <h3 className="font-semibold mb-2">Supported FHIR Resources</h3>
          <ul className="space-y-1 text-slate-700">
            <li>• <strong>Observation</strong> — Vital telemetry (respiratory rate, heart rate, cough count)</li>
            <li>• <strong>DiagnosticReport</strong> — Triage session assessment with ICD-11 codes</li>
            <li>• <strong>Consent</strong> — Patient consent with purpose-based provisions</li>
            <li>• <strong>AuditEvent</strong> — Cryptographically chained audit entries</li>
            <li>• <strong>Bundle</strong> — Collection for FHIR export / portability</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Custom Extensions</h3>
          <ul className="space-y-1 text-slate-700">
            <li>• <code className="text-xs bg-slate-100 px-1 rounded">confidence-score</code> — AI confidence on Observations</li>
            <li>• <code className="text-xs bg-slate-100 px-1 rounded">urgency-level</code> — GREEN/YELLOW/RED on DiagnosticReports</li>
            <li>• <code className="text-xs bg-slate-100 px-1 rounded">feature-attribution</code> — Weight map on DiagnosticReports</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Code Systems</h3>
          <ul className="space-y-1 text-slate-700">
            <li>• <code className="text-xs bg-slate-100 px-1 rounded">http://afiyaSauti.org/fhir</code> — Custom codes</li>
            <li>• <code className="text-xs bg-slate-100 px-1 rounded">http://hl7.org/fhir/sid/icd-11</code> — ICD-11</li>
            <li>• <code className="text-xs bg-slate-100 px-1 rounded">http://loinc.org</code> — LOINC for vitals</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Edge → Cloud Flow</h3>
          <p className="text-slate-700">Edge device → MQTT over TLS → OpenHIM mediator (mTLS + HMAC pseudonymisation) → FHIR R4 transformation → Central platform</p>
        </div>
      </div>
    </div>
  );
}