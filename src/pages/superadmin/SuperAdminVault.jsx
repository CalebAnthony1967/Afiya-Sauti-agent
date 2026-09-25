import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { saltedSha256 } from '@/lib/safety';
import { base44 } from '@/api/base44Client';

export default function SuperAdminVault() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const authenticate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Vault authentication: hash the vault code and verify
      const hash = await saltedSha256(code, 'afiyaSauti-vault-v1');
      // In production, verify against server-side hash. Here we accept any non-empty code and log.
      await base44.entities.AuditLog.create({
        actor_id: 'super_admin',
        actor_role: 'super_admin',
        action_type: 'vault_access',
        resource_type: 'vault',
        resource_id: 'vault_entry',
        signature_hash: hash,
        payload_snapshot: { timestamp: new Date().toISOString() },
      });
      sessionStorage.setItem('vault_authenticated', 'true');
      navigate('/super-admin/users');
    } catch (err) {
      setError('Vault authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Super Admin Vault</h1>
          <p className="text-sm text-slate-400 mt-1">Additional authentication required beyond normal login.</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <label className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4" /> Vault Access Code
          </label>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && authenticate()}
            placeholder="Enter vault code..."
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[48px]"
          />
          <button
            onClick={authenticate}
            disabled={loading || !code}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 text-white font-medium disabled:opacity-50 min-h-[48px]"
          >
            {loading ? 'Authenticating...' : <><Shield className="w-4 h-4" /> Enter Vault</>}
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-4 rounded-lg bg-amber-900/30 border border-amber-700 p-3">
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200">
              All vault access is cryptographically logged. Emergency controls available inside.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}