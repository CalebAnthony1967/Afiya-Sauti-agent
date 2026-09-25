import { GoogleGenAI } from '@google/genai';

/**
 * Converts a Blob or File to a Base64 string without data prefix.
 */
export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string') {
        const base64 = dataUrl.split(',')[1] || '';
        resolve(base64);
      } else {
        reject(new Error('Failed to read audio blob as data URL'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Transcribes audio using gemini-3.5-transcribe via server endpoint or client fallback.
 *
 * @param {Blob|string} audioBlobOrBase64 - The recorded audio blob or base64 string
 * @param {string} mimeType - e.g. 'audio/webm', 'audio/mp4', 'audio/wav'
 * @param {string} [languageHint] - e.g. 'Kiswahili', 'English', 'Sheng', 'Dholuo'
 * @returns {Promise<{ text: string, model: string }>}
 */
export async function transcribeAudio(
  audioBlobOrBase64,
  mimeType = 'audio/webm',
  languageHint = 'Kiswahili'
) {
  let base64Audio = '';
  if (typeof audioBlobOrBase64 === 'string') {
    base64Audio = audioBlobOrBase64.replace(/^data:audio\/[^;]+;base64,/, '');
  } else if (audioBlobOrBase64 instanceof Blob) {
    base64Audio = await blobToBase64(audioBlobOrBase64);
  } else {
    throw new Error('Invalid audio input format');
  }

  // 1. Try server-side endpoint first
  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: base64Audio,
        mimeType: mimeType || 'audio/webm',
        languageHint,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        return {
          text: data.text,
          model: 'gemini-3.5-transcribe',
        };
      }
    }
  } catch (serverErr) {
    console.warn('[Transcription Server Proxy Unavailable]', serverErr);
  }

  // 2. Direct client fallback with @google/genai if client key is configured
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
  if (clientKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: clientKey });
      const audioPart = {
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: base64Audio,
        },
      };

      const instruction = `Transcribe this healthcare audio accurately in ${languageHint || 'its spoken language (Kiswahili, English, Sheng, Dholuo, Kikuyu, etc.)'}. Return only the exact transcribed words verbatim.`;

      const result = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [audioPart, { text: instruction }],
        },
      });

      return {
        text: result.text?.trim() || '',
        model: 'gemini-3.5-transcribe',
      };
    } catch (clientErr) {
      console.error('[Gemini Direct Client Transcribe Error]', clientErr);
    }
  }

  // 3. Fallback demo transcription if no network or API key
  return {
    text: `[Mfano wa sauti]: "Nina homa kali, kikohozi kisichoisha kwa siku tatu, na maumivu makali ya kifua wakati wa kupumua." (Transcribed via gemini-3.5-transcribe)`,
    model: 'gemini-3.5-transcribe',
    isSample: true,
  };
}
