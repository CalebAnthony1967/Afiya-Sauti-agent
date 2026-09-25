import React from 'react';
import { Globe, Users, HeartHandshake, FileCheck, CheckCircle2, TrendingUp } from 'lucide-react';

export const NGOOrganisationPortal: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">NGO & Implementing Partner Portal</h2>
            <p className="text-xs text-slate-400">
              Maternal & Child Survival Campaigns, Donor Impact Accountability & Community Health Promoter Grants
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-pink-400" />
            Active Programme Campaigns
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Zero Pneumonia Deaths Initiative</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                  ACTIVE
                </span>
              </div>
              <p className="text-slate-300">Target: 25,000 households across informal settlements in Nairobi & Kisumu</p>
              <div className="text-[11px] text-teal-400 font-mono">19,840 Home Visits Completed (79.3%)</div>
            </div>

            <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Universal Long-Lasting Insecticidal Nets (LLIN)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                  ACTIVE
                </span>
              </div>
              <p className="text-slate-300">Target: Mombasa & Kilifi coastal endemic zones</p>
              <div className="text-[11px] text-teal-400 font-mono">42,000 Nets Distributed with Digital Verification</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-teal-400" />
            Audited Grant Outcomes (USAID / Global Fund)
          </h3>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">Total CHPs Monthly Stipends Disbursed:</span>
              <span className="font-bold text-white">KES 14,200,000 via M-Pesa B2C</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">Verified eCHIS Visit Compliance:</span>
              <span className="font-bold text-emerald-400">99.4% Biometrically & Geotagged</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">Independent Data Audit Status:</span>
              <span className="font-bold text-teal-400">Clean Unqualified Opinion (KPMG / MoH)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
