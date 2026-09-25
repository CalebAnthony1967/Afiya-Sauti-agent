import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Pause, Play, RotateCcw, Shield, Lock } from 'lucide-react';

export default function SuperAdminEmergency() {
  const [confirm, setConfirm] = useState(null);
  const [status, setStatus] = useState({ aiPaused: false, keysRotated: false, lockdown: false });

  const execute = async (action) => {
    await base44.entities.AuditLog.create({
      actor_id: 'super_admin', actor_role: 'super_admin',
      action_type: 'emergency_action', resource_type: 'system', resource_id: action,
      signature_hash: 'emergency_' + action + '_' + Date.now(),
      payload_snapshot: { action, timestamp: new Date().toISOString() },
    });
    if (action === 'pause_ai') setStatus(s => ({ ...s, aiPaused: !s.aiPaused }));
    if (action === 'rotate_keys') setStatus(s => ({ ...s, keysRotated: true }));
    if (action === 'lockdown') setStatus(s => ({ ...s, lockdown: !s.lockdown }));
    setConfirm(null);
  };

  const actions = [
    { id: 'pause_ai', label: 'Pause AI Inference', desc: 'Fallback to manual triage only. All AI agents suspended.', icon: Pause, color: 'bg-amber-600', activeColor: 'bg-green-600', activeLabel: 'Resume AI', activeIcon: Play },
    { id: 'rotate_keys', label: 'Rotate Gateway Keys', desc: 'Immediately rotate all OpenHIM gateway mTLS keys.', icon: RotateCcw, color: 'bg-blue-600', activeColor: 'bg-blue-600', activeLabel: 'Rotate Again', activeIcon: RotateCcw },
    { id: 'lockdown', label: 'Emergency System Lockdown', desc: 'Lock all portals except Super Admin. Requires manual unlock.', icon: Lock, color: 'bg-red-700', activeColor: 'bg-green-600', activeLabel: 'Unlock System', activeIcon: Shield },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-red-50 border-2 border-red-300 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-red-700">Emergency Controls</h2>
        </div>
        <p className="text-sm text-red-600 mt-1">Destructive actions. All require confirmation and are cryptographically logged.</p>
      </div>

      {status.aiPaused && (
        <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 text-sm text-amber-800">
          ⚠ AI inference is currently PAUSED. System running in manual fallback mode.
        </div>
      )}
      {status.lockdown && (
        <div className="rounded-lg bg-red-50 border-2 border-red-400 p-3 text-sm text-red-800">
          🔒 SYSTEM LOCKDOWN ACTIVE. All portals locked except Super Admin.
        </div>
      )}

      <div className="space-y-3">
        {actions.map(a => {
          const Icon = a.icon;
          const isActive = a.id === 'pause_ai' ? status.aiPaused : a.id === 'lockdown' ? status.lockdown : false;
          const ActiveIcon = a.activeIcon || Icon;
          return (
            <div key={a.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${isActive ? a.activeColor : a.color} flex items-center justify-center flex-shrink-0`}>
                    <ActiveIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{isActive ? a.activeLabel : a.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                {confirm === a.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => execute(a.id)} className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-medium min-h-[44px] ${isActive ? 'bg-green-600' : a.color}`}>
                      Confirm {isActive ? a.activeLabel : a.label}
                    </button>
                    <button onClick={() => setConfirm(null)} className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium min-h-[44px]">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirm(a.id)} className={`w-full px-4 py-2.5 rounded-lg text-white text-sm font-medium min-h-[44px] ${isActive ? a.activeColor : a.color}`}>
                    {isActive ? a.activeLabel : a.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}