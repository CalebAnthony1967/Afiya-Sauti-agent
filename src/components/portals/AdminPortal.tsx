import React, { useState } from 'react';
import { Users, Building, Shield, LifeBuoy, CheckCircle2, UserPlus, Search } from 'lucide-react';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  facility: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export const AdminPortal: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: 'USR-001',
      name: 'Dr. Arnold Omondi',
      email: 'a.omondi@health.go.ke',
      role: 'HOSPITAL_CLINICIAN',
      facility: 'Mbagathi County Hospital (Level 4)',
      status: 'ACTIVE'
    },
    {
      id: 'USR-002',
      name: 'Faith Wanjiku',
      email: 'f.wanjiku@echis.go.ke',
      role: 'CHP_FIELD_WORKER',
      facility: 'Kibra Soweto East Community Unit',
      status: 'ACTIVE'
    },
    {
      id: 'USR-003',
      name: 'Dr. Beatrice Koech',
      email: 'b.koech@health.go.ke',
      role: 'MOH_EPIDEMIOLOGIST',
      facility: 'MoH Afya House National HQ',
      status: 'ACTIVE'
    }
  ]);

  const [search, setSearch] = useState('');

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u))
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">System Administrator Portal</h2>
            <p className="text-xs text-slate-400">
              Day-to-Day Operations, User Provisioning, Role Assignments & Facility Directory
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">User Accounts & Role Assignments</h3>
            <span className="text-xs text-teal-400 font-mono">{users.length} Active Accounts</span>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-slate-850 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{user.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-teal-300 border border-slate-700 font-mono">
                      {user.role}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    {user.email} • {user.facility}
                  </div>
                </div>

                <button
                  onClick={() => toggleUserStatus(user.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    user.status === 'ACTIVE'
                      ? 'bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700'
                      : 'bg-emerald-900 hover:bg-emerald-800 text-white'
                  }`}
                >
                  {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Facility Directory & Helpdesk */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-400" />
              Tenant & Facility Directory
            </h3>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-white">Nairobi County Health Directorate</div>
                <div className="text-slate-400 text-[11px]">Level 4 & 5 Hospitals, 47 Sub-County Health Centers</div>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-white">Kisumu County Health Directorate</div>
                <div className="text-slate-400 text-[11px]">JOOTRH Level 5 & 28 Sub-County Units</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-teal-400" />
              Helpdesk & Support Operations
            </h3>
            <p className="text-xs text-slate-400">
              Open tickets: <strong className="text-white">2 open</strong> (1 hardware radar sync inquiry, 1 USSD
              gateway session timeout).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
