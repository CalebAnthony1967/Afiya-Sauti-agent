import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Hash, PhoneCall, Radio, ArrowRight, Cpu } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import WhatsAppSimulator from './WhatsAppSimulator';
import UssdSimulator from './UssdSimulator';
import IvrSimulator from './IvrSimulator';

/**
 * Ingestion Channels — Multi-channel triage intake simulators.
 * The Ambient Edge Node channel redirects to the dedicated Ambient Portal
 * (/ambient) instead of showing an inline simulator, ensuring a single
 * unified ambient experience across the app.
 *
 * SUPABASE MIGRATION:
 *   -- Channel sessions stored in triage_sessions table with channel column:
 *   -- CREATE INDEX idx_triage_channel ON triage_sessions(channel, created_at DESC);
 *   -- Each channel simulator inserts with the appropriate channel enum value.
 */
export default function IngestionChannels() {
  const { t } = useLanguage();
  const [active, setActive] = useState('whatsapp');

  const CHANNELS = [
    { id: 'whatsapp', label: 'WhatsApp Business', sub: '+254 700 000000', icon: MessageCircle, color: 'bg-[#25d366]', sim: WhatsAppSimulator },
    { id: 'ussd', label: 'Feature Phone USSD', sub: '*384# Session', icon: Hash, color: 'bg-amber-500', sim: UssdSimulator },
    { id: 'ivr', label: 'Interactive Voice (IVR)', sub: '9 African Languages', icon: PhoneCall, color: 'bg-blue-500', sim: IvrSimulator },
    { id: 'edge', label: 'In-Home Ambient Node', sub: 'FMCW Radar + Mic Array', icon: Radio, color: 'bg-violet-500', isLink: true, linkPath: '/ambient' },
  ];

  const ActiveSim = CHANNELS.find(c => c.id === active && !c.isLink)?.sim || WhatsAppSimulator;

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Try Each Channel</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Kenya production gateways — every session runs through the full safety pipeline and is saved.
        </p>
      </div>

      {/* Channel tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
        {CHANNELS.map(c => {
          const Icon = c.icon;
          if (c.isLink) {
            // Ambient Edge Node — redirect to Ambient Portal
            return (
              <Link
                key={c.id}
                to={c.linkPath}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-violet-300 hover:shadow-md transition-all text-left group"
              >
                <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{c.label}</p>
                  <p className="text-xs text-slate-500 truncate">{c.sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </Link>
            );
          }
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                active === c.id ? 'border-teal-400 bg-white shadow-md' : 'border-slate-200 bg-white/50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{c.label}</p>
                <p className="text-xs text-slate-500 truncate">{c.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active simulator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <ActiveSim />
      </div>

      {/* Ambient portal callout */}
      <div className="mt-3 rounded-xl bg-violet-50 border border-violet-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-violet-900">{t('portal.ambient')}</p>
            <p className="text-xs text-violet-700">Full device telemetry, live monitoring & privacy controls</p>
          </div>
        </div>
        <Link to="/ambient" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors">
          {t('ambient.openPortal')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}