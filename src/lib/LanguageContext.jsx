import React, { createContext, useContext, useState, useEffect } from 'react';
import { translate, LANGUAGES } from '@/lib/translations';

/**
 * Language Context — Pan-African multi-language support.
 * Persists language choice to localStorage.
 *
 * SUPABASE MIGRATION:
 *   -- Store user language preference in profiles table:
 *   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'sw';
 *   UPDATE profiles SET preferred_language = $1 WHERE id = auth.uid();
 *   -- Load: SELECT preferred_language FROM profiles WHERE id = auth.uid();
 */
const LanguageContext = createContext(null);

const STORAGE_KEY = 'afiyaSauti_language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'sw'; }
    catch { return 'sw'; }
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
  };

  // Sync language to user profile when it changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { base44 } = await import('@/api/base44Client');
        if (base44?.auth?.updateMe) {
          await base44.auth.updateMe({ preferred_language: language });
        }
      } catch { /* not logged in or not available */ }
    })();
    return () => { mounted = false; };
  }, [language]);

  const t = (key) => translate(key, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback if used outside provider
    return {
      language: 'sw',
      setLanguage: () => {},
      t: (key) => translate(key, 'sw'),
      languages: LANGUAGES,
    };
  }
  return ctx;
}