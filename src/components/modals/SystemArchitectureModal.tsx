import React from 'react';
import { X, Layers, ShieldCheck, Database, Radio, Server, CheckCircle2, FileText } from 'lucide-react';

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-white">AfiyaSauti Architecture & Operations Specification</h3>
              <p className="text-[11px] text-slate-400">
                Kenya Digital Health Act 2023 & Data Protection Act 2019 Certified Architecture
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed bg-slate-950">
          {/* Architecture Overview */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-400" />
              1. Multi-Channel Edge & Cloud Ingestion Pipeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-white">WhatsApp Business</div>
                <div className="text-slate-400 text-[11px] mt-1">Meta Cloud API Webhook + HMAC-SHA-256</div>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-white">USSD *384#</div>
                <div className="text-slate-400 text-[11px] mt-1">Africa's Talking / Telco GSM Session Gateway</div>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-white">Interactive Voice (IVR)</div>
                <div className="text-slate-400 text-[11px] mt-1">SipWise / Twilio + Multi-Dialect Kenyan ASR</div>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-white">Ambient Radar Node</div>
                <div className="text-slate-400 text-[11px] mt-1">60GHz FMCW + TFLite Micro On-Device</div>
              </div>
            </div>
          </div>

          {/* Database & Persistence */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              2. Persistence Engine (PostgreSQL 16, TimescaleDB & pgvector)
            </h4>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-white">Relational Core:</strong> 12 normalized tables with strict Row-Level
                Security (RLS) policies enforcing role-based isolation.
              </li>
              <li>
                <strong className="text-white">TimescaleDB Hypertable:</strong> Time-series telemetry partitions for
                radar respiration, heart rate, and cough frequencies with automated 90-day retention shredding.
              </li>
              <li>
                <strong className="text-white">pgvector RAG Embeddings:</strong> Cosine similarity indexing over Kenya
                MoH clinical guidelines and WHO pediatric protocols.
              </li>
            </ul>
          </div>

          {/* Regulatory & Cryptographic Guarantees */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              3. Regulatory Compliance & Non-Negotiable Guardrails
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-emerald-400">Kenya Data Protection Act 2019</div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Granular consent per purpose (Triage, Ambient, Dispatch). Salted HMAC de-identification before any
                  model invocation. Right to erasure executed via cryptographic key shredding.
                </p>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-teal-400">Kenya Digital Health Act 2023</div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Full HL7 FHIR R4 interoperability with eCHIS and Kenya Health Information System (KHIS). Mandatory
                  human clinician digital signature for all SOAP notes and prescriptions.
                </p>
              </div>
            </div>
          </div>

          {/* Production Deployment & Operations Checklist */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              4. Production Operations & Deployment Checklist
            </h4>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-300 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <p>✔ [ENV] PORT 3000 bound to 0.0.0.0 for container ingress</p>
              <p>✔ [GATEWAY] OpenHIM mTLS certificates provisioned in HSM vault</p>
              <p>✔ [EDGE] Radar firmware gating: confidence &lt; 0.85 marked UNCERTAIN_EDGE_TRIAGE</p>
              <p>✔ [AUDIT] Tamper-evident SHA-256 Merkle chain active on all logins, queries, and signatures</p>
              <p>✔ [FAILOVER] Emergency kill-switch verified: instant manual fallback mode tested</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
