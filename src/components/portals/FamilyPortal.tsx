import React from 'react';
import { Users, ShieldCheck, HeartHandshake, PhoneCall, Clock, Pill, Calendar } from 'lucide-react';

export const FamilyPortal: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Family & Caregiver Shared View</h2>
                <span className="px-2 py-0.5 rounded text-[11px] bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  Consented Delegate Access
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Viewing shared record for Household <span className="text-slate-200 font-mono">HH-NRB-7740</span> (Consent Hash: cns_7749_fam)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            <span>Explicit DPA 2019 Patient Authorization Verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Shared Timeline & Care Instructions */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-blue-400" />
              Patient Care Summary & Explanations (Plain Language)
            </h3>

            <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 space-y-2 mb-4">
              <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wide">Care Plan Coordination</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Patient is currently managing mild essential hypertension. Morning blood pressure readings have remained stable (avg 132/84 mmHg). Please remind the patient to take Amlodipine 5mg each morning and ensure daily meals are prepared with minimal added salt.
              </p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Source: Mbagathi Hospital Level 4 Discharge Plan & MoH NCD Guidelines
              </div>
            </div>

            <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Recent Shared Observations
            </h4>

            <div className="space-y-3">
              <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">Morning Ambient Radar Check:</span>
                  <span className="text-slate-300 ml-2">Resting respiration normal (18 breaths/min). No cough bursts.</span>
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">Normal</span>
              </div>

              <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">Scheduled Level 3 Clinic Visit:</span>
                  <span className="text-slate-300 ml-2">Child Immunization at Kibera South Health Centre on 28 Sep.</span>
                </div>
                <span className="text-teal-400 font-mono text-[11px]">Upcoming</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Emergency Contacts & Quick Actions */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              Verified Emergency Escalation Contacts
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">Assigned Community Health Promoter:</div>
                <div className="font-semibold text-white">Faith Wanjiku (CHP-041)</div>
                <div className="text-teal-400 font-mono mt-0.5">+254 712 *** *** (Dispatched via eCHIS)</div>
              </div>

              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">Kenya Red Cross Ambulance:</div>
                <div className="font-semibold text-white">Toll-Free Emergency Dispatch</div>
                <div className="text-rose-400 font-mono font-bold mt-0.5">1199 / 999</div>
              </div>

              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">Referral Level 4 Facility:</div>
                <div className="font-semibold text-white">Mbagathi County Hospital</div>
                <div className="text-slate-300 text-[11px] mt-0.5">Emergency Triage Wing, Nairobi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
