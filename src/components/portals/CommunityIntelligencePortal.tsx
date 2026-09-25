import React from 'react';
import { Share2, TrendingUp, Users, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';

export const CommunityIntelligencePortal: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Community Health Intelligence Portal</h2>
            <p className="text-xs text-slate-400">
              Grassroots Health Trends, Village Baraza Advisories & Vernacular Summaries for Local Leaders
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            Soweto East, Kibera Unit Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">Households Monitored:</span>
              <span className="font-bold text-white">680 Households</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">Primary Weekly Trend:</span>
              <span className="font-bold text-amber-400">Rising Pediatric Cough (1.4x baseline)</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400">ORS & Zinc Stock at Dispensary:</span>
              <span className="font-bold text-emerald-400">92% Adequacy</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-400" />
            Local Baraza Plain-Language Bulletin (Swahili)
          </h3>

          <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
            <p className="font-semibold text-teal-300">
              Ujumbe kwa Wazee wa Mtaa na Wanajamii (Kibra Soweto East):
            </p>
            <p>
              Kumekuwa na ongezeko la watoto walio chini ya miaka mitano wanaokohoa na kuwa na homa katika wiki hii.
              Tafadhali wahimize wazazi wote kuwapeleka watoto kwenye Zahanati ya Kibera South mara tu wanapoona
              dalili za kupumua kwa kasi au mtoto kushindwa kunyonya. CHPs wetu wanatembelea nyumba kwa nyumba.
            </p>
            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">
              Imetolewa na: Kitengo cha Afya ya Jamii (MoH Sub-County Unit)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
