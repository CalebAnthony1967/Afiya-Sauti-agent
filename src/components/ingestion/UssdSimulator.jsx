import React, { useState } from 'react';
import { useChannelTriage } from './useChannelTriage';
import UrgencyBadge from '@/components/UrgencyBadge';
import { Loader2 } from 'lucide-react';

const USSD_STEPS = {
  initial: {
    text: 'AfiyaSauti Health\n\nChagua lugha:\n1. Kiswahili\n2. English\n3. Dholuo\n4. Kikuyu\n\n# Exit',
    options: { '1': 'sw', '2': 'en', '3': 'luo', '4': 'kikuyu' },
    next: 'consent',
  },
  consent: {
    text: 'AfiyaSauti Huduma ya Afya\n\nUnakubali masharti ya faragha (Kenya DPA 2019) kupokea ushauri wa afya?\n\n1. Ndio, Nakubali\n2. La, Kataa\n\n# Exit',
    options: { '1': 'accept', '2': 'decline' },
    next: 'domain',
  },
  domain: {
    text: 'Chagua eneo:\n1. Mama na Mtoto\n2. Magonjwa sugu\n3. Magonjwa ya kuambukiza\n4. Afya ya akili\n5. Dharura\n6. General\n\n0 Back  # Exit',
    options: { '1': 'maternal_child', '2': 'ncd', '3': 'infectious', '4': 'mental_health', '5': 'emergency', '6': 'general' },
    next: 'symptoms',
  },
};

export default function UssdSimulator() {
  const { loading, result, error, runChannelTriage, reset } = useChannelTriage();
  const [step, setStep] = useState('initial');
  const [screen, setScreen] = useState(USSD_STEPS.initial.text);
  const [language, setLanguage] = useState('sw');
  const [domain, setDomain] = useState('general');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);

  const handleSend = async (val) => {
    const value = (val ?? input).trim();
    if (!value || loading) return;
    setInput('');

    if (value === '#') { reset(); setStep('initial'); setScreen(USSD_STEPS.initial.text); setHistory([]); return; }
    if (value === '0' && (step === 'domain' || step === 'consent')) { setStep('initial'); setScreen(USSD_STEPS.initial.text); return; }

    if (step === 'initial') {
      const lang = USSD_STEPS.initial.options[value];
      if (lang) { setLanguage(lang); setStep('consent'); setScreen(USSD_STEPS.consent.text); }
      else setScreen('Chaguo si sahihi. Tafadhali chua tena.\n\n' + USSD_STEPS.initial.text);
      return;
    }

    if (step === 'consent') {
      const choice = USSD_STEPS.consent.options[value];
      if (choice === 'accept') { setStep('domain'); setScreen(USSD_STEPS.domain.text); }
      else if (choice === 'decline') {
        setScreen('END Huduma imesitishwa. Data yako haijahifadhiwa. Asante kwa kutumia AfiyaSauti.\n\n# Exit');
        setStep('declined');
      } else setScreen('Chaguo si sahihi.\n\n' + USSD_STEPS.consent.text);
      return;
    }

    if (step === 'domain') {
      const dom = USSD_STEPS.domain.options[value];
      if (dom) {
        setDomain(dom);
        setStep('symptoms');
        setScreen('Andika dalili zako kwa ufupi:\n\nMfano: kikohozi homa\n\n# Exit');
      } else setScreen('Chaguo si sahihi.\n\n' + USSD_STEPS.domain.text);
      return;
    }

    if (step === 'symptoms') {
      setHistory(h => [...h, { type: 'input', text: `*384# > ${value}` }]);
      setScreen('Inachakata... Tafadhali subiri.');
      try {
        const res = await runChannelTriage({ symptomsText: value, language, domainModule: domain, channel: 'ussd' });
        const reply = res.redFlag
          ? `🚨 DALILI ZA HATARI!\nKategoria: ${res.urgency}\n\n${res.aiResponse.slice(0, 200)}...\n\nNenda kituo cha afya SASA. CHP amearifiwa.\n\n# Exit`
          : `Kategoria: ${res.urgency}\n\n${res.aiResponse.slice(0, 280)}${res.aiResponse.length > 280 ? '...' : ''}${res.icd11Codes?.length ? `\n\nICD-11: ${res.icd11Codes.join(',')}` : ''}\n\n# Exit`;
        setScreen(reply);
        setStep('result');
      } catch {
        setScreen('Hitilafu imetokea. Tafadhali jaribu tena.\n\n# Exit');
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Feature phone mockup */}
      <div className="w-[260px] bg-slate-800 rounded-[2rem] p-3 shadow-xl">
        {/* Speaker */}
        <div className="h-1.5 w-16 bg-slate-600 rounded-full mx-auto mb-2" />
        {/* Screen */}
        <div className="bg-[#9bbc0f] rounded-lg p-3 min-h-[260px] font-mono text-xs text-[#0f380f] whitespace-pre-wrap leading-relaxed">
          {screen}
        </div>
        {/* Keypad */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => (
            <button key={k} onClick={() => handleSend(k)} disabled={loading}
              className="h-8 rounded bg-slate-600 text-white text-sm font-mono hover:bg-slate-500 active:bg-slate-700 disabled:opacity-40">
              {k}
            </button>
          ))}
        </div>
        {/* Action buttons */}
        <div className="mt-2 flex gap-2">
          <button onClick={() => { reset(); setStep('initial'); setScreen(USSD_STEPS.initial.text); setHistory([]); }}
            className="flex-1 h-8 rounded bg-slate-700 text-white text-xs hover:bg-slate-600">Clear</button>
          <button onClick={() => handleSend()} disabled={loading || !input.trim()}
            className="flex-1 h-8 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-500 disabled:opacity-40">Send</button>
        </div>
      </div>

      {/* Text input for symptom entry */}
      {step === 'symptoms' && (
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type symptoms then press Send"
          disabled={loading}
          className="w-[260px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Processing USSD session...
        </div>
      )}

      {result && step === 'result' && (
        <div className="w-[260px] space-y-2">
          <UrgencyBadge level={result.urgency} />
          {result.redFlag && <p className="text-xs text-red-600 font-medium">Red flag detected — CHP dispatched.</p>}
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}