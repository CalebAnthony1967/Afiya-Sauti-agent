import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import { CryptographicAuditLog } from '../../types';
import { getAuditChain, verifyAuditChainIntegrity } from '../../services/safety';

interface AuditVerificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditVerificationDrawer: React.FC<AuditVerificationDrawerProps> = ({ isOpen, onClose }) => {
  const [chain, setChain] = useState<CryptographicAuditLog[]>([]);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    totalRecords: number;
    tamperedIndex?: number;
    details: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setChain(getAuditChain());
      handleVerify();
    }
  }, [isOpen]);

  const handleVerify = async () => {
    setIsVerifying(true);
    const res = await verifyAuditChainIntegrity();
    setVerificationResult(res);
    setIsVerifying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Cryptographic Audit Trail Inspector</h3>
              <p className="text-[11px] text-slate-400">
                Kenya DPA 2019 Tamper-Evident SHA-256 Merkle Chaining
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status Banner */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {verificationResult?.isValid ? (
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-white">
                {verificationResult?.isValid
                  ? `Cryptographic Integrity Verified (${verificationResult.totalRecords} Records)`
                  : 'Chain Tampering Detected!'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                PrevHash linkage valid for all sequential blocks from Genesis
              </div>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Re-Verify</span>
          </button>
        </div>

        {/* Audit Log Record Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-900">
          {chain.slice().reverse().map((record) => (
            <div
              key={record.auditId}
              className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-sans"
            >
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span className="font-mono text-teal-400 font-bold">AUDIT-{record.auditId}</span>
                <span>{new Date(record.timestamp).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700 font-mono text-[10px] font-bold">
                  {record.actionType}
                </span>
                <span className="text-white font-medium">Actor: {record.actorId}</span>
              </div>

              <div className="text-slate-300">
                Resource: <span className="text-white font-mono">{record.resourceType} / {record.resourceId}</span>
              </div>

              {/* Hashes */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] space-y-1">
                <div className="text-slate-500 truncate">PrevHash: {record.previousSignatureHash}</div>
                <div className="text-teal-400 truncate">SignHash: {record.signatureHash}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
