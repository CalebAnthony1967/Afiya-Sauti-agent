import React, { useState } from 'react';
import { X, MessageSquare, Phone, Volume2, Send, RefreshCw, Smartphone, BookOpen, ShieldCheck } from 'lucide-react';
import { executeClinicalTriage, processUSSDSession } from '../../services/channels';
import { KenyanLanguage } from '../../types';

interface ChannelSimulatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: KenyanLanguage;
}

export const ChannelSimulatorsModal: React.FC<ChannelSimulatorsModalProps> = ({
  isOpen,
  onClose,
  currentLanguage
}) => {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'ussd' | 'ivr'>('whatsapp');

  // WhatsApp State
  const [waMessages, setWaMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; citation?: string; redFlag?: boolean }>
  >([
    {
      sender: 'bot',
      text: 'Jambo! Mimi ni AfiyaSauti, msaidizi wako wa afya aliyethibitishwa na Wizara ya Afya ya Kenya (MoH). Je, unahisi dalili gani leo? (Unaweza kuandika kwa Kiswahili, Kiingereza, au lugha ya nyumbani).',
      citation: 'Kenya Ministry of Health Community Triage Standard'
    }
  ]);
  const [waInput, setWaInput] = useState('');
  const [waLoading, setWaLoading] = useState(false);

  // USSD State
  const [ussdSessionId] = useState(`USSD-SES-${Math.floor(Math.random() * 100000)}`);
  const [ussdScreen, setUssdScreen] = useState(
    'CON AfiyaSauti MoH Triage:\n1. Ripoti Dalili (Symptom Check)\n2. Tafuta Kituo cha Afya\n3. Msaada wa Dharura\n4. Badilisha Lugha'
  );
  const [ussdInput, setUssdInput] = useState('');
  const [ussdHistory, setUssdHistory] = useState<string[]>([]);
  const [ussdEnded, setUssdEnded] = useState(false);

  // IVR Voice State
  const [ivrTranscript, setIvrTranscript] = useState<string[]>([
    'AfiyaSauti IVR System: "Karibu AfiyaSauti. Ongea kwa lugha unayopendelea kueleza hali ya afya yako baada ya mlio..."',
    'Simulated User: "Mtoto wangu wa miezi kumi ana homa kali na hawezi kunyonya."'
  ]);
  const [ivrResponse, setIvrResponse] = useState<string>(
    'AfiyaSauti IVR Voice Synthesizer: "Mtoto kushindwa kunyonya ni dalili ya dharura kulingana na muongozo wa IMCI. Tafadhali mpeleke kwenye kituo cha afya kilicho karibu mara moja. Tunatuma ujumbe wa SMS kwa CHP wako."'
  );

  if (!isOpen) return null;

  // Handle WhatsApp Submit
  const handleWaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waInput.trim() || waLoading) return;

    const query = waInput;
    setWaInput('');
    setWaMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setWaLoading(true);

    try {
      const response = await executeClinicalTriage({
        channel: 'WHATSAPP',
        senderIdentifier: '+254712999000',
        rawText: query,
        preferredLanguage: currentLanguage,
        consentGranted: true
      });

      setWaMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: response.messageText,
          citation: response.citations[0]?.documentTitle,
          redFlag: response.urgencyLevel === 'RED'
        }
      ]);
    } catch (err) {
      setWaMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Samahani, mtandao umekatika kwa muda. Ikiwa ni dharura, piga 1199 au tembelea hospitali.'
        }
      ]);
    } finally {
      setWaLoading(false);
    }
  };

  // Handle USSD Send
  const handleUssdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ussdInput.trim() || ussdEnded) return;

    const input = ussdInput.trim();
    setUssdHistory((prev) => [...prev, `> ${input}`]);
    setUssdInput('');

    const res = processUSSDSession(ussdSessionId, input, currentLanguage);
    setUssdScreen(res.message);
    if (res.isEnd) {
      setUssdEnded(true);
    }
  };

  const resetUssd = () => {
    setUssdScreen(
      'CON AfiyaSauti MoH Triage:\n1. Ripoti Dalili (Symptom Check)\n2. Tafuta Kituo cha Afya\n3. Msaada wa Dharura\n4. Badilisha Lugha'
    );
    setUssdHistory([]);
    setUssdEnded(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Channel Patient Ingestion Simulators</h3>
              <p className="text-[11px] text-slate-400">
                Test WhatsApp Business, Feature Phone USSD (*384#), and Interactive Voice Response (IVR)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-5 text-xs">
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeChannel === 'whatsapp'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Business Simulator</span>
          </button>
          <button
            onClick={() => setActiveChannel('ussd')}
            className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeChannel === 'ussd'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Feature Phone USSD (*384#)</span>
          </button>
          <button
            onClick={() => setActiveChannel('ivr')}
            className={`py-3 px-4 font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeChannel === 'ivr'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Interactive Voice Response (IVR)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-950">
          {/* 1. WhatsApp Simulator */}
          {activeChannel === 'whatsapp' && (
            <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col h-[480px]">
              {/* WhatsApp Mock Header */}
              <div className="bg-emerald-800 p-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm">
                    AS
                  </div>
                  <div>
                    <div className="font-bold text-xs">AfiyaSauti Verified Business</div>
                    <div className="text-[10px] text-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>MoH Kenya Verified • End-to-End Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Bubble Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a]">
                {waMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 text-xs shadow ${
                        msg.sender === 'user'
                          ? 'bg-[#005c4b] text-white rounded-br-none'
                          : msg.redFlag
                          ? 'bg-rose-950/80 border border-rose-800 text-rose-100 rounded-bl-none'
                          : 'bg-[#202c33] text-slate-100 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      {msg.citation && (
                        <div className="mt-2 pt-1 border-t border-slate-700/60 text-[10px] text-teal-300 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>Source: {msg.citation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {waLoading && (
                  <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-teal-400" />
                    <span>AfiyaSauti is typing grounded clinical response...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleWaSubmit} className="p-3 bg-[#202c33] flex items-center gap-2">
                <input
                  type="text"
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  placeholder="Andika ujumbe (mfano: mtoto ana homa na anapumua haraka)..."
                  className="flex-1 bg-[#2a3942] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={waLoading || !waInput.trim()}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* 2. USSD Simulator */}
          {activeChannel === 'ussd' && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 shadow-2xl">
                <div className="flex justify-between items-center mb-3 text-xs text-slate-400">
                  <span className="font-mono">USSD Session: *384#</span>
                  <button onClick={resetUssd} className="text-teal-400 hover:underline flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Dial</span>
                  </button>
                </div>

                {/* Feature phone green LCD screen */}
                <div className="bg-[#122216] border border-[#2b5333] rounded-xl p-4 font-mono text-emerald-300 text-xs shadow-inner min-h-[160px] whitespace-pre-line leading-relaxed">
                  {ussdScreen}
                </div>

                {/* Input Bar */}
                {!ussdEnded ? (
                  <form onSubmit={handleUssdSubmit} className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={ussdInput}
                      onChange={(e) => setUssdInput(e.target.value)}
                      placeholder="Weka nambari ya chaguo (mfano: 1)..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold font-mono cursor-pointer"
                    >
                      SEND
                    </button>
                  </form>
                ) : (
                  <div className="mt-4 text-center">
                    <button
                      onClick={resetUssd}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Dial *384# Again
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                Simulates real 2G/3G Telco GSM USSD protocol for low-resource feature phones.
              </div>
            </div>
          )}

          {/* 3. IVR Simulator */}
          {activeChannel === 'ivr' && (
            <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Interactive Voice Response (IVR) Engine</h4>
                  <p className="text-xs text-slate-400">Toll-Free Voice Hotline with Multi-Dialect Kenyan ASR</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {ivrTranscript.map((t, idx) => (
                  <div key={idx} className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-slate-300">
                    {t}
                  </div>
                ))}
                <div className="bg-teal-950/40 border border-teal-800 p-3.5 rounded-lg text-teal-200">
                  {ivrResponse}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Vernacular Dialect: Kiswahili (Coastal & Upcountry)</span>
                <span className="font-mono text-emerald-400">SMS Confirmation Dispatched</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
