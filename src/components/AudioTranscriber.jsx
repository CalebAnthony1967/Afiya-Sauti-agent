import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '@/services/transcriptionService';
import {
  Mic,
  Square,
  Sparkles,
  Loader2,
  Volume2,
  Upload,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

/**
 * AudioTranscriber Component
 * Provides live microphone audio recording, audio file upload, and AI transcription
 * powered by the gemini-3.5-transcribe model.
 */
export default function AudioTranscriber({
  onTranscription,
  languageHint = 'Kiswahili',
  placeholder = 'Record your symptoms or patient consultation...',
  buttonLabel = 'Voice Input (Microphone)',
  className = '',
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const mimeTypeRef = useRef('audio/webm');

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setError(null);
    setTranscriptionResult('');
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine best supported audio format
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        }
      }
      mimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());

        const recordedBlob = new Blob(audioChunksRef.current, {
          type: mimeTypeRef.current,
        });

        const url = URL.createObjectURL(recordedBlob);
        setAudioUrl(url);

        // Run transcription with gemini-3.5-transcribe
        await processAudioTranscription(recordedBlob, mimeTypeRef.current);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('[Microphone Record Error]', err);
      setError(
        err.message || 'Could not access microphone. Please check permissions.'
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioTranscription = async (blob, mimeType) => {
    setIsTranscribing(true);
    setError(null);
    try {
      const { text } = await transcribeAudio(blob, mimeType, languageHint);
      setTranscriptionResult(text);
      if (onTranscription && text) {
        onTranscription(text);
      }
    } catch (err) {
      console.error('[Transcription Error]', err);
      setError(err.message || 'Audio transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setAudioUrl(URL.createObjectURL(file));
    await processAudioTranscription(file, file.type || 'audio/webm');
  };

  const loadSampleAudio = async (textSample) => {
    setIsTranscribing(true);
    setError(null);
    setTranscriptionResult('');
    // Simulate real Gemini audio recognition latency
    setTimeout(() => {
      setTranscriptionResult(textSample);
      setIsTranscribing(false);
      if (onTranscription) {
        onTranscription(textSample);
      }
    }, 1200);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Trigger button when closed */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 text-sm font-medium transition-all shadow-sm min-h-[40px]"
        >
          <Mic className="w-4 h-4 text-violet-600 animate-pulse" />
          <span>{buttonLabel}</span>
          <span className="text-[11px] bg-violet-200 text-violet-800 px-1.5 py-0.5 rounded font-mono font-semibold">
            gemini-3.5-transcribe
          </span>
        </button>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  Microphone Audio Transcription
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> gemini-3.5-transcribe
                  </span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Speaks in Kiswahili, Sheng, English, Dholuo, Kikuyu, etc.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isRecording) stopRecording();
                setIsOpen(false);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 p-1"
            >
              ✕ Close
            </button>
          </div>

          {/* Recording Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={isTranscribing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-all shadow min-h-[44px]"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-black text-white font-medium text-sm transition-all animate-pulse shadow min-h-[44px]"
              >
                <Square className="w-4 h-4 text-red-400 fill-red-400" />
                <span>Stop & Transcribe ({formatDuration(recordingDuration)})</span>
              </button>
            )}

            {/* File upload option */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer text-xs font-medium min-h-[40px]">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Audio File</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isRecording || isTranscribing}
              />
            </label>

            {/* Quick Demo Voices */}
            <div className="flex items-center gap-1.5 ml-auto text-xs">
              <span className="text-slate-500 hidden sm:inline">Try sample:</span>
              <button
                type="button"
                onClick={() =>
                  loadSampleAudio(
                    'Nina homa ya juu kuanzia jana jioni, kikohozi kikavu, na maumivu ya mwili mzima.'
                  )
                }
                disabled={isRecording || isTranscribing}
                className="px-2 py-1 bg-white border rounded text-slate-600 hover:text-slate-900 text-xs"
              >
                🇰🇪 Swahili
              </button>
              <button
                type="button"
                onClick={() =>
                  loadSampleAudio(
                    'Patient presents with persistent dry cough, chest tightness on exertion, and fever of 38.5C for 4 days.'
                  )
                }
                disabled={isRecording || isTranscribing}
                className="px-2 py-1 bg-white border rounded text-slate-600 hover:text-slate-900 text-xs"
              >
                🏥 English
              </button>
            </div>
          </div>

          {/* Recording Visualizer Indicator */}
          {isRecording && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-900">
                  Microphone active — Listening to your speech...
                </p>
                <p className="text-[11px] text-red-700">
                  Speak clearly into your device in your preferred language.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-red-700">
                {formatDuration(recordingDuration)}
              </span>
            </div>
          )}

          {/* Transcribing state */}
          {isTranscribing && (
            <div className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-lg">
              <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-violet-900">
                  Transcribing with model gemini-3.5-transcribe...
                </p>
                <p className="text-[11px] text-violet-700">
                  Detecting language, medical vocabulary, and punctuation.
                </p>
              </div>
            </div>
          )}

          {/* Audio preview player */}
          {audioUrl && !isRecording && (
            <div className="flex items-center gap-2 pt-1">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <audio controls src={audioUrl} className="h-8 flex-1 max-w-sm" />
            </div>
          )}

          {/* Transcription result display */}
          {transcriptionResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Transcribed Text (gemini-3.5-transcribe):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onTranscription) onTranscription(transcriptionResult);
                  }}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold"
                >
                  Insert & Apply ↗
                </button>
              </div>
              <p className="text-sm text-slate-800 italic bg-white p-2.5 rounded border border-emerald-100">
                "{transcriptionResult}"
              </p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="flex-1">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
