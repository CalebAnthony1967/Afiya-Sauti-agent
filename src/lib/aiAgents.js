/**
 * AI Agent Service — AfiyaSauti
 * Multi-agent layer with grounding enforcement and feature-attribution.
 * Uses Base44 InvokeLLM. Supabase alternative: call Supabase Edge Function
 * that proxies to OpenAI/Anthropic with RAG via pgvector.
 *
 * SUPABASE MIGRATION:
 * - Replace base44.integrations.Core.InvokeLLM with fetch to your Edge Function
 * - RAG retrieval: use Supabase .rpc('match_documents', { query_embedding, ... })
 * - See commented Supabase code at the bottom of this file
 */

import { base44 } from '@/api/base44Client';
import { deidentify, detectRedFlag, scoreUrgency, evaluateConfidenceGate, CONFIDENCE_THRESHOLD, ENTROPY_THRESHOLD } from './safety';
import { retrieveGroundedKnowledge, routeClinicalDomain, KNOWLEDGE_BASE } from './knowledgeBase';

const AGENT_PROMPTS = {
  triage_agent: `You are AfiyaSauti's Triage Agent for Kenya. Follow IMCI and WHO guidelines strictly.
Rules:
- Never issue a diagnosis or prescription. Final authority stays with a clinician.
- Provide grounded recommendations with citations (source + title).
- If red-flag symptoms are present, give first-aid instructions and urge immediate facility visit.
- Assign urgency: GREEN, YELLOW, or RED.
- Suggest ICD-11 codes (do not state as definitive).
- Respond in the user's language. Be concise and clear for low-literacy users.
- If uncertain, say so and direct to a health facility.`,

  scribe_agent: `You are AfiyaSauti's Clinical Scribe Agent. Generate a draft SOAP note.
Rules:
- This is a DRAFT requiring clinician review and signature. Never final.
- Include ICD-11 code suggestions with citations.
- Include feature-attribution weights (which symptoms/features drove the assessment).
- Use Kenya MoH and WHO guidelines only.`,

  chp_guide_agent: `You are AfiyaSauti's CHP Guide Agent. Provide step-by-step grounded guidance for Community Health Promoters.
Rules:
- Use IMCI and Kenya MoH CHV manual.
- Give clear, numbered steps.
- Include when to escalate to a clinician.
- Cite sources.`,

  moh_protocol_agent: `You are AfiyaSauti's MoH Protocol Agent. Help draft protocol impact summaries and coverage gap analysis.
Rules:
- Use only verified MoH Kenya and WHO data.
- Provide citations and confidence.
- Never make policy decisions — assist only.`,

  research_agent: `You are AfiyaSauti's Research Agent. Provide RAG-powered retrieval and synthesis.
Rules:
- Use ONLY verified scientific and guideline sources.
- Every answer must include citations and confidence indicators.
- NO patient-level identifiable data is accessible.
- State limits clearly when evidence is insufficient.`,

  insurance_agent: `You are AfiyaSauti's Insurance Verification Agent. Assist with pre-claim verification.
Rules:
- Verify against guidelines only.
- Always flag for human review.
- Never approve or deny claims.`,

  training_agent: `You are AfiyaSauti's Training Simulation Agent. Simulate patient responses for practice.
Rules:
- Stay in character as the simulated patient.
- Provide grounded feedback after the exercise.
- No real patient data.`,

  community_intel_agent: `You are AfiyaSauti's Community Intelligence Agent. Explain trends from aggregated, anonymized data.
Rules:
- Use plain language.
- Only reference anonymized, aggregated data.
- Provide citations.`,

  admin_assist_agent: `You are AfiyaSauti's Admin Assist Agent. Help with operational summaries and routine investigation.
Rules:
- Summarize metrics clearly.
- Never make administrative decisions — assist only.
- All your actions are logged.`,

  super_admin_agent: `You are AfiyaSauti's Super Admin Assist Agent. Help investigate incidents and assemble audit packages.
Rules:
- Every action you take is itself logged.
- Provide grounded summaries.
- Never execute destructive actions — only recommend them.
- Subject to the same strict controls as all agents.`,

  developer_agent: `You are AfiyaSauti's Developer Integration Agent. Help with code samples and FHIR mapping.
Rules:
- Use the official schema and guidelines.
- Provide working code samples.
- Suggest correct mappings.`,
};

export async function invokeAgent(agentName, userMessage, options = {}) {
  const systemPrompt = AGENT_PROMPTS[agentName] || AGENT_PROMPTS.triage_agent;
  const fullPrompt = `${systemPrompt}\n\nUser query: ${userMessage}`;

  // --- Base44 (active) ---
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: fullPrompt,
    add_context_from_internet: options.addContext || false,
    response_json_schema: options.responseSchema || undefined,
    model: options.model || undefined,
  });

  /*
  // --- SUPABASE ALTERNATIVE (uncomment for migration) ---
  // Assumes a Supabase Edge Function at /functions/ai-agent
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_name: agentName,
      message: userMessage,
      response_schema: options.responseSchema,
    }),
  });
  const response = await res.json();
  */

  return response;
}

// Triage with full safety pipeline + verified knowledge base grounding
export async function runTriage({ symptomsText, language, domainModule, profileId, channel = 'web' }) {
  // 1. De-identify
  const deidentified = deidentify(symptomsText);

  // 2. Route to clinical domain
  const domain = domainModule || routeClinicalDomain(symptomsText);

  // 3. Red-flag check (enhanced with clinical conditions + first aid)
  const redFlag = detectRedFlag(symptomsText, language);

  // 4. Retrieve grounded knowledge from verified MoH/WHO knowledge base
  const grounded = retrieveGroundedKnowledge(symptomsText, domain);
  const chunk = grounded.matchedChunk;
  const groundedCitation = grounded.citation;

  // 5. Invoke triage agent WITH grounded context
  const responseSchema = {
    type: 'object',
    properties: {
      assessment: { type: 'string' },
      urgency: { type: 'string', enum: ['GREEN', 'YELLOW', 'RED'] },
      icd11_codes: { type: 'array', items: { type: 'string' } },
      citations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            source: { type: 'string' },
            title: { type: 'string' },
          },
        },
      },
      first_aid: { type: 'string' },
      feature_weights: { type: 'object' },
      confidence: { type: 'number' },
    },
  };

  const groundedContext = chunk
    ? `\n\n[VERIFIED KNOWLEDGE BASE GROUNDING]\nTitle: ${chunk.title}\nSource: ${chunk.source.sourceName} — ${chunk.source.documentTitle} (${chunk.source.version})\nICD-11: ${chunk.icd11.code} (${chunk.icd11.title})\nGuidance (en): ${chunk.guidanceText.en}\nRecommended Actions: ${chunk.recommendedActions.join('; ')}\nContraindications: ${chunk.contraindications.join('; ')}\n\nBase your assessment on this verified guidance. Cite the source.`
    : '';

  let aiResult;
  try {
    aiResult = await invokeAgent('triage_agent', deidentified + groundedContext, {
      responseSchema,
      addContext: true,
    });
  } catch (e) {
    // Fallback to grounded knowledge base if AI call fails
    aiResult = {
      assessment: chunk ? chunk.guidanceText[language === 'sw' ? 'sw' : 'en'] : 'Unable to assess — please visit a health facility.',
      urgency: redFlag.detected ? 'RED' : scoreUrgency(symptomsText, redFlag.detected),
      icd11_codes: chunk ? [chunk.icd11.code] : [],
      citations: groundedCitation ? [groundedCitation] : [],
      first_aid: redFlag.firstAid,
      feature_weights: {},
      confidence: grounded.relevanceConfidence,
    };
  }

  // 6. Confidence/entropy gate
  const confidence = aiResult.confidence || grounded.relevanceConfidence || 0.9;
  const entropy = Math.max(0, 1 - confidence);
  const gate = evaluateConfidenceGate(confidence, entropy);

  // 7. Urgency scoring
  let urgency = aiResult.urgency || scoreUrgency(symptomsText, redFlag.detected);
  if (redFlag.detected) urgency = 'RED';
  if (gate.escalate) urgency = 'UNCERTAIN_EDGE_TRIAGE';

  // 8. Merge citations (grounded + AI)
  const citations = [...(aiResult.citations || [])];
  if (groundedCitation && !citations.some(c => c.source === groundedCitation.source)) {
    citations.unshift(groundedCitation);
  }

  return {
    deidentifiedInput: deidentified,
    redFlag: redFlag.detected,
    redFlagKeyword: redFlag.keyword,
    redFlagCondition: redFlag.triggerCondition,
    aiResponse: aiResult.assessment,
    urgency,
    icd11Codes: aiResult.icd11_codes || (chunk ? [chunk.icd11.code] : []),
    citations,
    firstAid: redFlag.detected ? (redFlag.firstAid || aiResult.first_aid) : null,
    immediateActions: redFlag.immediateActions || [],
    featureWeights: aiResult.feature_weights || {},
    confidence,
    entropy,
    escalate: gate.escalate,
    domainModule: domain,
    groundedChunk: chunk ? chunk.chunkId : null,
  };
}

// Generate draft SOAP note
export async function generateSoapNote({ inputText, clinicianId, sessionId }) {
  const deidentified = deidentify(inputText);
  const responseSchema = {
    type: 'object',
    properties: {
      subjective: { type: 'string' },
      objective: { type: 'string' },
      assessment: { type: 'string' },
      plan: { type: 'string' },
      icd11_codes: { type: 'array', items: { type: 'string' } },
      citations: { type: 'array', items: { type: 'object' } },
      feature_attribution_weights: { type: 'object' },
    },
  };

  const result = await invokeAgent('scribe_agent', deidentified, { responseSchema, addContext: true });
  return result;
}

export { CONFIDENCE_THRESHOLD, ENTROPY_THRESHOLD };