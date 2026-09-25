import React, { useState } from 'react';
import AudioTranscriber from '@/components/AudioTranscriber';
import { Mic, X, Copy, Check } from 'lucide-react';

export default function VoiceTranscriptionModal({ isOpen, onClose }) {
  const [transcribedText, setTranscribedText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!transcribedText) return;
    navigator.clipboard.writeText(transcribedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base">
                Voice Audio Transcription
              </h3>
              <p className="text-xs text-white/80">
                Powered by Gemini 3.5 Transcribe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600">
            Record audio with your microphone in Kiswahili, English, Sheng, Dholuo,
            Kikuyu, or any indigenous language. The model will accurately transcribe
            your speech into text.
          </p>

          <AudioTranscriber
            onTranscription={(text) => setTranscribedText(text)}
            buttonLabel="Start Mic Recording"
            languageHint="Kenyan multilingual: Kiswahili, English, Sheng"
          />

          {transcribedText && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Transcribed Output:
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Text
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 select-all max-h-48 overflow-y-auto">
                {transcribedText}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
