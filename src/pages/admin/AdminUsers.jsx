import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { Users, Shield, ShieldOff, Trash2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      /*
      // SUPABASE: supabase.from('profiles').select('*').order('created_at')
      */
      setUsers(await base44.entities.Profile.list('-created_date', 100) || []);
    } finally { setLoading(false); }
  };

  const updateRole = async (id, role) => {
    await base44.entities.Profile.update(id, { role });
    load();
  };

  const toggleActive = async (u) => {
    await base44.entities.Profile.update(u.id, { is_active: !u.is_active });
    load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="w-5 h-5" /> User Management</h2>
      <p className="text-sm text-muted-foreground">View users and assign roles. Super Admin has full control.</p>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users" description="Users will appear here once they register." />
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{u.full_name}</p>
                <p className="text-xs text-muted-foreground">{u.role.replace('_', ' ')} · {u.county_code || 'No county'}</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs min-h-[36px]">
                  <option value="patient">Patient</option>
                  <option value="family">Family</option>
                  <option value="chp">CHP</option>
                  <option value="clinician">Clinician</option>
                  <option value="ngo_admin">NGO Admin</option>
                  <option value="regional_admin">Regional Admin</option>
                  <option value="moh_admin">MoH Admin</option>
                  <option value="researcher">Researcher</option>
                  <option value="insurance">Insurance</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => toggleActive(u)} className={`p-2 rounded-lg min-h-[44px] min-w-[44px] ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.is_active ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}