import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { runTriage } from '@/lib/aiAgents';

/**
 * Shared hook for multi-channel triage ingestion.
 * Runs the safety pipeline (deidentify → red-flag → AI → confidence gate)
 * and persists a TriageSession with the originating channel.
 *
 * SUPABASE ALTERNATIVE: replace base44.entities.TriageSession.create with
   await supabase.from('triage_sessions').insert({...})
 */
export function useChannelTriage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runChannelTriage = async ({ symptomsText, language = 'sw', domainModule = 'general', channel, profileId }) => {
    setLoading(true);
    setError(null);
    try {
      const triageResult = await runTriage({ symptomsText, language, domainModule, profileId, channel });

      const session = await base44.entities.TriageSession.create({
        profile_id: profileId || 'anonymous',
        channel,
        language,
        domain_module: domainModule,
        symptoms_text: symptomsText,
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

      const finalResult = { ...triageResult, sessionId: session.id };
      setResult(finalResult);
      return finalResult;
    } catch (err) {
      setError(err.message || 'Triage failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setError(null); };

  return { loading, result, error, runChannelTriage, reset };
}