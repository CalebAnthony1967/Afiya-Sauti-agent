import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { runTriage } from '@/lib/aiAgents';
import { detectRedFlag } from '@/lib/safety';
import AIRecommendation from '@/components/AIRecommendation';
import UrgencyBadge from '@/components/UrgencyBadge';
import { LoadingState } from '@/components/States';
import AudioTranscriber from '@/components/AudioTranscriber';
import { Stethoscope, AlertTriangle, Send, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'sw', label: 'Kiswahili' },
  { code: 'en', label: 'English' },
  { code: 'luo', label: 'Dholuo' },
  { code: 'kikuyu', label: 'Kikuyu' },
  { code: 'kalenjin', label: 'Kalenjin' },
  { code: 'luhya', label: 'Luluhya' },
  { code: 'kamba', label: 'Kikamba' },
  { code: 'meru', label: 'Kimeru' },
  { code: 'maasai', label: 'Maa' },
];

const DOMAINS = [
  { code: 'maternal_child', label: 'Maternal & Child Health' },
  { code: 'ncd', label: 'Non-communicable Diseases' },
  { code: 'infectious', label: 'Infectious & Vector-borne' },
  { code: 'mental_health', label: 'Mental Health' },
  { code: 'emergency', label: 'Emergency First Response' },
  { code: 'general', label: 'General' },
];

export default function TriageInterface({ profileId, channel = 'web', compact = false }) {
  const [language, setLanguage] = useState('sw');
  const [domain, setDomain] = useState('general');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTriage = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const triageResult = await runTriage({
        symptomsText: symptoms,
        language,
        domainModule: domain,
        profileId,
        channel,
      });

      // Save session
      /*
      // SUPABASE ALTERNATIVE:
      // await supabase.from('triage_sessions').insert({
      //   profile_id: profileId, channel, language, domain_module: domain,
      //   symptoms_text: symptoms, deidentified_input: triageResult.deidentifiedInput,
      //   urgency_level: triageResult.urgency, red_flag_detected: triageResult.redFlag,
      //   ai_response: triageResult.aiResponse, icd11_codes: triageResult.icd11Codes,
      //   citations: triageResult.citations, confidence_score: triageResult.confidence,
      //   feature_weights: triageResult.featureWeights, status: triageResult.redFlag ? 'red_flag' : 'completed'
      // });
      */
      const session = await base44.entities.TriageSession.create({
        profile_id: profileId || 'anonymous',
        channel,
        language,
        domain_module: domain,
        symptoms_text: symptoms,
        deidentified_input: triageResult.deidentifiedInput,
        urgency_level: triageResult.urgency,
        red_flag_detected: triageResult.redFlag,
        red_flag_details: triageResult.redFlagKeyword,
        ai_response: triageResult.aiResponse,
        icd11_codes: triageResult.icd11Codes,
        citations: triageResult.citations,
        confidence_score: triageResult.confidence,
        input_entropy: triageResult.entropy,
        feature_weights: triageResult.featureWeights,
        first_aid_given: !!triageResult.firstAid,
        status: triageResult.redFlag ? 'red_flag' : 'completed',
      });

      setResult({ ...triageResult, sessionId: session.id });
    } catch (err) {
      setError(err.message || 'Triage failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? '' : 'max-w-2xl mx-auto'}>
      {!compact && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Symptom Triage
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Describe your symptoms. AI provides grounded guidance — not a diagnosis.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-1.5">
              <Globe className="w-4 h-4" /> Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Concern area</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              {DOMAINS.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Describe your symptoms</label>
            <span className="text-xs text-muted-foreground">Type or speak into microphone</span>
          </div>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Mfano: Nina kikohozi cha muda mrefu na homa ya juu..."
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <div className="mt-2.5">
            <AudioTranscriber
              onTranscription={(transcribedText) => {
                setSymptoms((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
              }}
              languageHint={LANGUAGES.find(l => l.code === language)?.label || 'Kiswahili'}
              buttonLabel="Speak Symptoms (Mic Transcription)"
            />
          </div>
        </div>

        <button
          onClick={handleTriage}
          disabled={loading || !symptoms.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 min-h-[48px]"
        >
          {loading ? <LoadingState message="Assessing..." /> : (<><Send className="w-4 h-4" /> Get Triage</>)}
        </button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {result && (
        <div className="mt-4 space-y-3">
          {result.redFlag && (
            <div className="rounded-lg border-2 border-red-400 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-700">Emergency Red Flag Detected</h3>
              </div>
              {result.redFlagCondition && (
                <p className="text-xs text-red-600 font-mono mb-2">{result.redFlagCondition}</p>
              )}
              {result.firstAid && (
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">First Aid Instructions:</p>
                  <p>{result.firstAid}</p>
                </div>
              )}
              {result.immediateActions?.length > 0 && (
                <div className="text-sm text-red-800 mt-2">
                  <p className="font-medium mb-1">Immediate Actions:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {result.immediateActions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
              <p className="text-sm text-red-700 mt-2 font-medium">
                A Community Health Promoter has been notified. Please proceed to the nearest health facility.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Urgency:</span>
            <UrgencyBadge level={result.urgency} />
          </div>

          <AIRecommendation
            title="Triage Assessment"
            content={result.aiResponse}
            citations={result.citations}
            confidence={result.confidence}
            agentName="triage_agent"
          />

          {result.icd11Codes?.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Suggested ICD-11 codes (not definitive): {result.icd11Codes.join(', ')}
            </div>
          )}

          {result.escalate && (
            <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm text-orange-800">
              Confidence below threshold — escalated to a human clinician for review.
            </div>
          )}
        </div>
      )}
    </div>
  );
}