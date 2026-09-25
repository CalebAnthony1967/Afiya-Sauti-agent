import React, { useState, useRef, useEffect } from 'react';
import { useChannelTriage } from './useChannelTriage';
import UrgencyBadge from '@/components/UrgencyBadge';
import { Send, Phone, Check, CheckCheck } from 'lucide-react';

const LANGUAGES = [
  { code: 'sw', label: 'Kiswahili' }, { code: 'en', label: 'English' },
  { code: 'luo', label: 'Dholuo' }, { code: 'kikuyu', label: 'Kikuyu' },
];

export default function WhatsAppSimulator() {
  const { loading, result, error, runChannelTriage, reset } = useChannelTriage();
  const [language, setLanguage] = useState('sw');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Karibu kwa AfiyaSauti 🩺\nTuma dalili zako za ugonjwa tutakupa ushauri.\n\nWelcome to AfiyaSauti. Send your symptoms for guidance.', time: 'now' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { from: 'user', text: input, time: 'now' };
    setMessages(m => [...m, userMsg]);
    const symptoms = input;
    setInput('');

    try {
      const res = await runChannelTriage({ symptomsText: symptoms, language, channel: 'whatsapp' });
      const replyText = res.redFlag
        ? `🚨 DALILI ZA HATARI!\n\n${res.aiResponse}\n\n${res.firstAid ? `Huduma ya kwanza: ${res.firstAid}` : ''}\n\n⚠️ Nenda kituo cha afya haraka. CHP amearifiwa.`
        : `📊 Kategoria: ${res.urgency}\n\n${res.aiResponse}${res.icd11Codes?.length ? `\n\nICD-11: ${res.icd11Codes.join(', ')}` : ''}`;
      setMessages(m => [...m, { from: 'bot', text: replyText, time: 'now', urgency: res.urgency, redFlag: res.redFlag }]);
    } catch {
      setMessages(m => [...m, { from: 'bot', text: '⚠️ Samahani, kuna hitilafu. Tafadhali jaribu tena.', time: 'now', error: true }]);
    }
  };

  return (
    <div className="flex flex-col h-[480px] bg-[#e5ddd5] rounded-lg overflow-hidden">
      {/* WhatsApp header */}
      <div className="bg-[#075e54] text-white px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🩺</div>
        <div className="flex-1">
          <p className="font-semibold text-sm">AfiyaSauti Health</p>
          <p className="text-xs text-white/70">+254 700 000000 • online</p>
        </div>
        <Phone className="w-4 h-4 text-white/80" />
      </div>

      {/* Language selector */}
      <div className="bg-[#f0f2f5] px-3 py-1.5 flex items-center gap-2 flex-shrink-0 border-b border-slate-200">
        <span className="text-xs text-slate-500">Lugha:</span>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}
          className="text-xs rounded border border-slate-300 px-2 py-1 bg-white">
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm whitespace-pre-wrap ${
              msg.from === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
            }`}>
              {msg.text}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-slate-400">{msg.time}</span>
                {msg.from === 'user' && <Check className="w-3 h-3 text-blue-500" />}
              </div>
              {msg.urgency && <div className="mt-1.5"><UrgencyBadge level={msg.urgency} /></div>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 text-sm shadow-sm">
              <div className="flex gap-1"><span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span><span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span><span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input bar */}
      <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Andika dalili..."
          disabled={loading}
          className="flex-1 rounded-full px-4 py-2 text-sm border-0 bg-white focus:outline-none focus:ring-2 focus:ring-[#075e54]"
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full bg-[#075e54] text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}