import React from 'react';
import { UserCheck, FileDown, RefreshCw, MapPin, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Patient Identity Card — sovereign identity under Kenya DPA 2019.
 * Shows HMAC-anonymized identity, jurisdiction, and data rights actions.
 *
 * SUPABASE ALTERNATIVE:
 *   SELECT full_name, phone_hash, phone_last4, county_code, sub_county,
 *          community_unit_id, preferred_language, consent_state
 *   FROM profiles WHERE id = auth.uid();
 */
export default function PatientIdentityCard({ profile, onExportFHIR, offlineSynced = true }) {
  const { t } = useLanguage();
  const hashDisplay = profile?.phone_hash
    ? `${profile.phone_hash.substring(0, 4)}...${profile.phone_hash.slice(-4)}`
    : '7749...dpa2019';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">
                {profile?.full_name || t('patient.healthRecord')}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                HMAC: {hashDisplay}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3" />
              County: {profile?.county_code || 'Nairobi (047)'} |
              Sub-County: {profile?.sub_county || 'Kibra'} |
              CU: {profile?.community_unit_id || 'Soweto East'}
            </p>
            {profile?.preferred_language && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Globe className="w-3 h-3" />
                {t('triage.language')}: {profile.preferred_language}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onExportFHIR && (
            <button
              onClick={onExportFHIR}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
              title="Export complete record as FHIR R4 Bundle under Kenya DPA 2019 Right to Portability"
            >
              <FileDown className="w-3.5 h-3.5 text-teal-500" />
              <span>Export FHIR Record</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-700">
            <RefreshCw className={`w-3 h-3 text-teal-500 ${offlineSynced ? '' : 'animate-spin'}`} />
            <span>{offlineSynced ? 'Offline Cache Synced' : 'Syncing...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}