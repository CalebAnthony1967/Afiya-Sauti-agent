import React from 'react';
import { Map, Package, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export const RegionalAdminPortal: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Regional Administrator Portal (County Health Directorate)</h2>
            <p className="text-xs text-slate-400">
              Nairobi County Health Management Team (CHMT) | Sub-County Logistics, Facility Performance & CHP Roster
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-400" />
            Essential Commodities & Logistics Status
          </h3>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-300">Malaria Rapid Diagnostic Tests (mRDTs):</span>
              <span className="font-bold text-emerald-400">14,200 kits (Safe Stock)</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-300">Pediatric Amoxicillin DT:</span>
              <span className="font-bold text-emerald-400">8,500 blister packs</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-300">ORS Sachets & Zinc Sulphate:</span>
              <span className="font-bold text-emerald-400">22,000 sachets</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-300">KEMSA Order Cycle Status:</span>
              <span className="font-bold text-teal-400">Order #KE-NRB-2026-09 En Route</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            Sub-County CHP Performance & Coverage
          </h3>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-300">Kibra Sub-County CHPs:</span>
              <span className="font-mono text-white">420 Active (98.6% Monthly Reporting)</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-300">Langata Sub-County CHPs:</span>
              <span className="font-mono text-white">380 Active (97.1% Monthly Reporting)</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-300">Mathare Sub-County CHPs:</span>
              <span className="font-mono text-white">510 Active (99.0% Monthly Reporting)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
