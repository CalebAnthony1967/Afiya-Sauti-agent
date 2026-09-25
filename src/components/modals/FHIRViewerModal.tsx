import React, { useState } from 'react';
import { X, FileCode, Download, CheckCircle2, Copy } from 'lucide-react';
import { generateFHIRDiagnosticReport, generateFHIRConsent } from '../../services/fhirConverter';

interface FHIRViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FHIRViewerModal: React.FC<FHIRViewerModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fhirBundle = {
    resourceType: 'Bundle',
    id: 'afiyasauti-fhir-bundle-7740',
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: 'urn:uuid:diagnostic-report-001',
        resource: generateFHIRDiagnosticReport({
          sessionId: 'SES-9941',
          patientHash: 'dpa2019_hmac_patient_hash_7749',
          chiefComplaint: 'Fast breathing, chest indrawing and fever in 8-month-old infant',
          urgency: 'RED',
          primaryProtocol: 'Kenya Basic Paediatric Protocols & IMCI 5th Ed.',
          icd11Codes: [
            { code: 'CA40', title: 'Pneumonia without specified organism' },
            { code: 'MD81', title: 'Tachypnoea' }
          ],
          confidence: 0.98
        })
      },
      {
        fullUrl: 'urn:uuid:consent-record-001',
        resource: generateFHIRConsent({
          consentId: 'CNS-KE-001',
          householdId: 'HH-NRB-7740',
          anonymizedHash: 'dpa2019_hmac_patient_hash_7749',
          consentState: 'ACTIVE',
          purposeCode: 'TRIAGE',
          grantedAt: '2026-09-01T10:00:00Z',
          updatedAt: '2026-09-01T10:00:00Z'
        })
      }
    ]
  };

  const jsonString = JSON.stringify(fhirBundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AfiyaSauti_FHIR_R4_Bundle_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">HL7 FHIR R4 Bundle (Right to Portability)</h3>
              <p className="text-[11px] text-slate-400">
                Kenya Digital Health Act 2023 & DPA 2019 Interoperability Standard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* JSON Viewer */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-950">
          <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
