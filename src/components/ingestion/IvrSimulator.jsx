import React, { useState, useEffect } from 'react';
import { useChannelTriage } from './useChannelTriage';
import UrgencyBadge from '@/components/UrgencyBadge';
import { Phone, PhoneOff, Volume2, Loader2, Mic } from 'lucide-react';

const LANGUAGES = [
  { code: 'sw', label: 'Kiswahili', prompt: 'Kiswahili' },
  { code: 'en', label: 'English', prompt: 'English' },
  { code: 'luo', label: 'Dholuo', prompt: 'Dholuo' },
  { code: 'kikuyu', label: 'Kikuyu', prompt: 'Kikuyu' },
  { code: 'kalenjin', label: 'Kalenjin', prompt: 'Kalenjin' },
  { code: 'luhya', label: 'Luluhya', prompt: 'Luluhya' },
  { code: 'kamba', label: 'Kikamba', prompt: 'Kikamba' },
  { code: 'meru', label: 'Kimeru', prompt: 'Kimeru' },
  { code: 'maasai', label: 'Maa', prompt: 'Maa' },
];

export default function IvrSimulator() {
  const { loading, result, error, runChannelTriage, reset } = useChannelTriage();
  const [callActive, setCallActive] = useState(false);
  const [stage, setStage] = useState('idle'); // idle -> language -> listening -> result
  const [language, setLanguage] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [recognized, setRecognized] = useState('');

  // Simulate speech recognition using Web Speech API if available
  const startListening = () => {
    setStage('listening');
    setTranscript('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'sw' ? 'sw-KE' : language === 'en' ? 'en-KE' : 'en-KE';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
        setTranscript(text);
        if (event.results[event.results.length - 1].isFinal) setRecognized(text);
      };
      recognition.onerror = () => setStage('manual');
      recognition.onend = () => { if (stage === 'listening') setStage('manual'); };
      recognition.start();
      window._ivrRec = recognition;
    } else {
      setStage('manual');
    }
  };

  const handleTriage = async (text) => {
    if (!text.trim()) return;
    try {
      const res = await runChannelTriage({ symptomsText: text, language, channel: 'ivr' });
      setStage('result');
    } catch { setStage('manual'); }
  };

  const endCall = () => {
    if (window._ivrRec) { try { window._ivrRec.stop(); } catch {} }
    setCallActive(false); setStage('idle'); setLanguage(null); setTranscript(''); setRecognized(''); reset();
  };

  useEffect(() => () => { if (window._ivrRec) { try { window._ivrRec.stop(); } catch {} } }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phone call UI */}
      <div className="w-[280px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2rem] p-4 shadow-xl">
        {/* Status bar */}
        <div className="text-center text-white/60 text-xs mb-3">
          {callActive ? 'AfiyaSauti IVR • 9 Languages' : 'IVR Gateway'}
        </div>

        {/* Call screen */}
        <div className="bg-slate-700/50 rounded-xl p-4 min-h-[240px] flex flex-col">
          {!callActive ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Phone className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white/70 text-sm text-center">Call AfiyaSauti IVR<br />Interactive Voice Response</p>
              <button onClick={() => { setCallActive(true); setStage('language'); }}
                className="mt-2 px-6 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400">
                📞 Call Now
              </button>
            </div>
          ) : stage === 'language' ? (
            <div className="flex-1 flex flex-col">
              <p className="text-white text-sm mb-2 text-center">Chagua lugha<br /><span className="text-white/50 text-xs">Select language</span></p>
              <div className="grid grid-cols-3 gap-1.5 overflow-y-auto">
                {LANGUAGES.map((l, i) => (
                  <button key={l.code} onClick={() => { setLanguage(l.code); startListening(); }}
                    className="rounded-lg bg-white/10 text-white text-xs py-2 hover:bg-white/20">
                    {i + 1}. {l.label}
                  </button>
                ))}
              </div>
            </div>
          ) : stage === 'listening' || stage === 'manual' ? (
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Mic className="w-4 h-4 animate-pulse" />
                <span>{stage === 'listening' ? 'Listening...' : 'Speak or type symptoms'}</span>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg p-2 text-white text-sm min-h-[80px]">
                {transcript || <span className="text-white/40">Describe your symptoms aloud...</span>}
              </div>
              {stage === 'manual' && (
                <input
                  value={recognized}
                  onChange={(e) => setRecognized(e.target.value)}
                  placeholder="Type symptoms..."
                  className="rounded-lg bg-white/90 text-slate-900 px-3 py-2 text-sm"
                />
              )}
              <button
                onClick={() => handleTriage(recognized || transcript)}
                disabled={loading || !(recognized || transcript).trim()}
                className="rounded-lg bg-emerald-500 text-white py-2 text-sm font-medium hover:bg-emerald-400 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Submit → Triage'}
              </button>
            </div>
          ) : stage === 'result' && result ? (
            <div className="flex-1 flex flex-col gap-2 text-white text-sm overflow-y-auto">
              <Volume2 className="w-5 h-5 text-emerald-400 mx-auto" />
              <UrgencyBadge level={result.urgency} />
              {result.redFlag && (
                <p className="text-red-300 text-xs font-medium">🚨 Red flag detected. Proceed to health facility immediately. CHP notified.</p>
              )}
              <p className="text-white/80 text-xs leading-relaxed">{result.aiResponse?.slice(0, 300)}{result.aiResponse?.length > 300 ? '...' : ''}</p>
              {result.icd11Codes?.length > 0 && <p className="text-white/50 text-xs">ICD-11: {result.icd11Codes.join(', ')}</p>}
            </div>
          ) : null}
        </div>

        {/* End call */}
        {callActive && (
          <button onClick={endCall} className="mt-3 mx-auto flex items-center gap-2 px-5 py-2 rounded-full bg-red-500 text-white text-sm hover:bg-red-400">
            <PhoneOff className="w-4 h-4" /> End Call
          </button>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-slate-400 text-center max-w-xs">
        Uses Web Speech API for voice input (Chrome/Edge). Falls back to text on unsupported browsers.
      </p>
    </div>
  );
}