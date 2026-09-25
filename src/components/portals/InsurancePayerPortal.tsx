import React, { useState } from 'react';
import { CreditCard, CheckCircle2, XCircle, AlertCircle, Search, ShieldCheck } from 'lucide-react';

interface PreClaim {
  claimId: string;
  facility: string;
  icd11: string;
  diagnosedCondition: string;
  billedService: string;
  totalKsh: number;
  adherenceToProtocol: 'CONFORMANT' | 'DEVIATION_DETECTED';
  rationale: string;
  status: 'APPROVED' | 'REQUIRES_MANUAL_AUDIT';
}

export const InsurancePayerPortal: React.FC = () => {
  const claims: PreClaim[] = [
    {
      claimId: 'CLM-SHA-88910',
      facility: 'Mbagathi County Level 4 Hospital',
      icd11: 'CA40',
      diagnosedCondition: 'Pediatric Severe Pneumonia',
      billedService: 'Nasal Prong O2 (24h) + IV Ampicillin + Blood Slide for Parasites',
      totalKsh: 3450,
      adherenceToProtocol: 'CONFORMANT',
      rationale: 'Matches Kenya Basic Paediatric Protocols Chapter 3 step-by-step.',
      status: 'APPROVED'
    },
    {
      claimId: 'CLM-SHA-88911',
      facility: 'Kibera Level 3 Clinic',
      icd11: 'BA00',
      diagnosedCondition: 'Essential Hypertension',
      billedService: 'Brain MRI Scan + High-Dose Ceftriaxone Injection',
      totalKsh: 28900,
      adherenceToProtocol: 'DEVIATION_DETECTED',
      rationale:
        'Deviation from Kenya NCD Protocol 2: Uncomplicated mild essential hypertension does not warrant emergency brain MRI or third-generation cephalosporin.',
      status: 'REQUIRES_MANUAL_AUDIT'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Social Health Authority (SHA) & Payer Pre-Claim Portal</h2>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  UHC Benefit Package
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated Clinical Guideline Pre-Claim Verification & Fraud-Waste-Abuse Mitigation
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Pre-Claim Verification Queue</h3>

        <div className="space-y-3">
          {claims.map((claim) => (
            <div
              key={claim.claimId}
              className={`p-4 rounded-xl border space-y-2 text-xs ${
                claim.adherenceToProtocol === 'CONFORMANT'
                  ? 'bg-slate-850 border-slate-800'
                  : 'bg-amber-950/20 border-amber-800/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-teal-400 font-semibold">{claim.claimId}</span>
                  <span className="text-slate-400 font-medium">({claim.facility})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">KES {claim.totalKsh.toLocaleString()}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      claim.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>
              </div>

              <p className="text-slate-200">
                <strong>Diagnosis (ICD-11 {claim.icd11}):</strong> {claim.diagnosedCondition}
              </p>
              <p className="text-slate-300">
                <strong>Billed Services:</strong> {claim.billedService}
              </p>
              <div
                className={`p-2.5 rounded border text-[11px] ${
                  claim.adherenceToProtocol === 'CONFORMANT'
                    ? 'bg-slate-900 border-slate-800 text-slate-300'
                    : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                }`}
              >
                <strong>Clinical Guideline Rationale:</strong> {claim.rationale}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
