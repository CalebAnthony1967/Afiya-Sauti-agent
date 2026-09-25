import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

/**
 * Language Selector — Pan-African language switcher.
 * Dropdown with all 9 supported languages.
 * Persists choice via LanguageContext.
 */
export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = languages.find(l => l.code === language) || languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg border transition-colors min-h-[40px] ${
          compact
            ? 'px-2.5 py-1.5 border-white/20 bg-white/5 text-white hover:bg-white/10'
            : 'px-3 py-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{current.flag} {current.label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                language === l.code ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{l.flag}</span>
                {l.label}
              </span>
              {language === l.code && <Check className="w-4 h-4 text-teal-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}