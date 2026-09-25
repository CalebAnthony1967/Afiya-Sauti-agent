import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { Users, Shield, ShieldOff, Trash2, Ban } from 'lucide-react';

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setUsers(await base44.entities.Profile.list('-created_date', 200) || []); }
    finally { setLoading(false); }
  };

  const updateRole = async (id, role) => {
    await base44.entities.Profile.update(id, { role });
    await base44.entities.AuditLog.create({
      actor_id: 'super_admin', actor_role: 'super_admin',
      action_type: 'admin_action', resource_type: 'profile', resource_id: id,
      signature_hash: 'role_change_' + Date.now(),
      payload_snapshot: { new_role: role },
    });
    load();
  };

  const suspend = async (u) => {
    await base44.entities.Profile.update(u.id, { is_active: false });
    await base44.entities.AuditLog.create({
      actor_id: 'super_admin', actor_role: 'super_admin',
      action_type: 'admin_action', resource_type: 'profile', resource_id: u.id,
      signature_hash: 'suspend_' + Date.now(),
      payload_snapshot: { action: 'suspend' },
    });
    load();
  };

  const revoke = async (u) => {
    await base44.entities.Profile.update(u.id, { is_active: false, consent_state: 'REVOKED' });
    await base44.entities.AuditLog.create({
      actor_id: 'super_admin', actor_role: 'super_admin',
      action_type: 'admin_action', resource_type: 'profile', resource_id: u.id,
      signature_hash: 'revoke_' + Date.now(),
      payload_snapshot: { action: 'revoke_all_access' },
    });
    load();
  };

  const permanentDelete = async (u) => {
    await base44.entities.Profile.delete(u.id);
    await base44.entities.AuditLog.create({
      actor_id: 'super_admin', actor_role: 'super_admin',
      action_type: 'data_delete', resource_type: 'profile', resource_id: u.id,
      signature_hash: 'delete_' + Date.now(),
      payload_snapshot: { action: 'permanent_delete', user: u.full_name },
    });
    setConfirmDelete(null);
    load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="w-5 h-5" /> Complete User & Role Management</h2>
      <p className="text-sm text-muted-foreground">Full control: suspend, revoke, permanently delete. All actions logged.</p>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users" />
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground">{u.role.replace('_', ' ')} · {u.is_active ? 'Active' : 'Suspended'} · {u.consent_state}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.is_active ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="rounded-lg border px-2 py-1.5 text-xs min-h-[36px]">
                  <option value="patient">Patient</option>
                  <option value="chp">CHP</option>
                  <option value="clinician">Clinician</option>
                  <option value="ngo_admin">NGO Admin</option>
                  <option value="regional_admin">Regional Admin</option>
                  <option value="moh_admin">MoH Admin</option>
                  <option value="researcher">Researcher</option>
                  <option value="insurance">Insurance</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="developer">Developer</option>
                </select>
                <button onClick={() => suspend(u)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium min-h-[36px]">
                  <Ban className="w-3 h-3" /> Suspend
                </button>
                <button onClick={() => revoke(u)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-medium min-h-[36px]">
                  <ShieldOff className="w-3 h-3" /> Revoke
                </button>
                {confirmDelete === u.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => permanentDelete(u)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium min-h-[36px]">Confirm Delete</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs min-h-[36px]">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(u.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium min-h-[36px]">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}