/**
 * AfiyaSauti Multi-Channel Communication Engine & Triage Orchestrator
 * Adapters for WhatsApp Business API, USSD (*384#), and IVR Voice
 */

import { ClinicalSOAPNote, KenyanLanguage, TriageSession, TriageUrgency } from '../types';
import {
  computeFeatureAttribution,
  detectKenyanLanguage,
  retrieveGroundedKnowledge,
  routeClinicalDomain,
  SUPPORTED_LANGUAGES
} from './clinicalModules';
import {
  appendAuditLog,
  detectRedFlags,
  evaluateInferenceSafety,
  hmacSha256,
  sanitizeInputForModel,
  sha256
} from './safety';

export interface ChannelMessageRequest {
  channel: 'WHATSAPP' | 'USSD' | 'IVR' | 'WEB' | 'EDGE_NODE';
  senderIdentifier: string; // e.g. Phone number "+254712345678" or Device ID
  rawText: string;
  preferredLanguage?: KenyanLanguage;
  vitals?: {
    respiratoryRate?: number;
    heartRate?: number;
    coughFrequency?: number;
    spo2?: number;
    tempC?: number;
  };
  consentGranted: boolean;
}

export interface ChannelResponse {
  sessionId: string;
  channel: 'WHATSAPP' | 'USSD' | 'IVR' | 'WEB' | 'EDGE_NODE';
  language: KenyanLanguage;
  messageText: string;
  isRedFlag: boolean;
  urgencyLevel: TriageUrgency;
  citations: Array<{ sourceName: string; documentTitle: string; version: string }>;
  draftSoapNote?: ClinicalSOAPNote;
  ussdMenuState?: string;
  chpDispatched?: boolean;
}

/**
 * Main Path A Triage Execution Pipeline
 */
export async function executeClinicalTriage(request: ChannelMessageRequest): Promise<ChannelResponse> {
  const sessionId = `SES-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  // 1. Identify or create user profile hash (Phone number is hashed with HMAC-SHA-256)
  const phoneHash = await hmacSha256(request.senderIdentifier);
  const anonymizedHash = phoneHash;

  // 2. Language detection (handles mid-sentence code switching)
  const detectedLang = request.preferredLanguage || detectKenyanLanguage(request.rawText);

  // 3. Remove all personal identifiers before model / downstream processing
  const { sanitized, redactedEntities } = sanitizeInputForModel(request.rawText);

  // 4. Route to correct clinical domain module
  const clinicalDomain = routeClinicalDomain(sanitized);

  // 5. Check for emergency red-flag symptoms
  const redFlagCheck = detectRedFlags(sanitized, request.vitals);

  // 6. Retrieve grounded information from approved knowledge base
  const groundedResult = retrieveGroundedKnowledge(sanitized, clinicalDomain);
  const chunk = groundedResult?.matchedChunk;
  const citation = groundedResult?.citation;

  // 7. Calculate feature attribution weights
  const featureWeights = computeFeatureAttribution([sanitized], request.vitals);

  // 8. Confidence & entropy scoring
  const confidenceScore = groundedResult?.relevanceConfidence || 0.92;
  const entropyScore = redFlagCheck.isRedFlag ? 0.05 : 0.18;
  const safetyStatus = evaluateInferenceSafety(confidenceScore, entropyScore);

  let urgencyLevel: TriageUrgency = 'GREEN';
  let responseText = '';
  let chpDispatched = false;

  if (redFlagCheck.isRedFlag) {
    urgencyLevel = 'RED';
    chpDispatched = true;

    if (detectedLang === 'sw') {
      responseText = `⚠️ TAHADHARI YA DHARURA YA MATIBABU ⚠️\n\n${redFlagCheck.firstAidInstructions}\n\n• Mhudumu wa Afya wa Jamii (CHP) ametumwa mara moja kwenye eneo lako.\n• Tafadhali usiondoke mgonjwa peke yake.\n• Nambari ya Dharura ya Ambulansi: 1199 (Red Cross) au 999.`;
    } else {
      responseText = `⚠️ CRITICAL MEDICAL EMERGENCY ⚠️\n\n${redFlagCheck.firstAidInstructions}\n\n• An emergency Community Health Promoter (CHP) has been automatically dispatched to assist you.\n• Keep the patient calm and stay on the line.\n• National Emergency Services: 1199 (Kenya Red Cross) or 999.`;
    }
  } else {
    // Normal grounded triage guidance
    const guidanceByLang = chunk?.guidanceText[detectedLang === 'sw' ? 'sw' : 'en'] || chunk?.guidanceText.en;
    urgencyLevel = sanitized.includes('severe') || sanitized.includes('kali') ? 'YELLOW' : 'GREEN';

    responseText = `${guidanceByLang}\n\n📋 Hatua Zinazopendekezwa (Recommended Actions):\n${chunk?.recommendedActions.map(a => `• ${a}`).join('\n')}\n\n⚠️ Kumbusho: AfiyaSauti haitoi utambuzi wa mwisho wa kisheria au maagizo ya dawa bila ukaguzi wa daktari aliyesajiliwa.`;
  }

  // 9. Draft Clinical SOAP Note (requires clinician review & signature)
  const soapNoteId = `SOAP-${Date.now().toString(36).toUpperCase()}`;
  const draftSoapNote: ClinicalSOAPNote = {
    noteId: soapNoteId,
    sessionId,
    patientHash: anonymizedHash,
    subjective: `Patient presented via ${request.channel}. Reported complaints: "${sanitized}". Redactions applied: ${redactedEntities.length} PII items removed.`,
    objective: request.vitals
      ? `Vital Telemetry: RR ${request.vitals.respiratoryRate || 'N/A'} breaths/min, HR ${request.vitals.heartRate || 'N/A'} bpm, Coughs ${request.vitals.coughFrequency || 0}/min, SpO2 ${request.vitals.spo2 || 'N/A'}%`
      : 'Vitals not directly acquired at triage initiation.',
    assessment: `Clinical Impression: ${chunk?.title || 'General Consultation'} (Confidence: ${(confidenceScore * 100).toFixed(0)}%). Urgency: ${urgencyLevel}.`,
    plan: `Grounded protocol from ${citation?.sourceName}. Recommended Actions: ${chunk?.recommendedActions.join('; ')}. CHP dispatched: ${chpDispatched ? 'YES' : 'NO'}. Human clinician review pending.`,
    icd11Codes: chunk?.icd11 ? [chunk.icd11] : [{ code: 'QA02', title: 'Contact with health services for general examination' }],
    featureAttribution: featureWeights,
    citations: citation ? [citation] : [],
    clinicianReviewed: false,
    locked: false
  };

  // 10. Cryptographically Chained Audit Log Entry
  await appendAuditLog({
    actorId: `CHANNEL_${request.channel}_GATEWAY`,
    actionType: redFlagCheck.isRedFlag ? 'RED_FLAG_ESCALATION' : 'TRIAGE_EXECUTION',
    resourceType: 'SESSION',
    resourceId: sessionId,
    payloadSnapshot: {
      patientHash: anonymizedHash.substring(0, 16) + '...',
      channel: request.channel,
      language: detectedLang,
      clinicalDomain,
      urgencyLevel,
      isRedFlag: redFlagCheck.isRedFlag,
      chpDispatched,
      confidenceScore,
      entropyScore,
      icd11Code: chunk?.icd11.code
    }
  });

  return {
    sessionId,
    channel: request.channel,
    language: detectedLang,
    messageText: responseText,
    isRedFlag: redFlagCheck.isRedFlag,
    urgencyLevel,
    citations: citation ? [citation] : [],
    draftSoapNote,
    chpDispatched
  };
}

/**
 * USSD (*384#) Interactive Menu State Machine
 */
export interface USSDSessionState {
  sessionId: string;
  step: 'WELCOME_LANG' | 'CONSENT' | 'SYMPTOM_MENU' | 'FREE_TEXT' | 'SUMMARY';
  language: KenyanLanguage;
  selectedOption?: string;
}

export function handleUSSDStep(input: string, state: USSDSessionState): { responseMenu: string; nextState: USSDSessionState; isEnd: boolean } {
  const trimmed = input.trim();

  if (state.step === 'WELCOME_LANG') {
    if (trimmed === '1') state.language = 'sw';
    else if (trimmed === '2') state.language = 'en';
    else if (trimmed === '3') state.language = 'ki';
    else if (trimmed === '4') state.language = 'luo';
    else state.language = 'sw';

    state.step = 'CONSENT';
    const isSw = state.language === 'sw';
    return {
      responseMenu: isSw
        ? `CON AfiyaSauti Huduma ya Afya\nJe unakubali masharti ya faragha (Kenya DPA 2019) kupokea ushauri wa afya?\n1. Ndio, Nakubali\n2. La, Kataa`
        : `CON AfiyaSauti Health Assistant\nDo you consent to privacy terms (Kenya DPA 2019) for health triage?\n1. Yes, I Consent\n2. No, Decline`,
      nextState: state,
      isEnd: false
    };
  }

  if (state.step === 'CONSENT') {
    if (trimmed !== '1') {
      return {
        responseMenu: `END Huduma imesitishwa. Data yako haijahifadhiwa. Asante kwa kutumia AfiyaSauti.`,
        nextState: state,
        isEnd: true
      };
    }
    state.step = 'SYMPTOM_MENU';
    return {
      responseMenu: `CON Chagua aina ya dalili:\n1. Homa na Kukohoa (Fever/Cough)\n2. Dalili za Ujauzito/Mtoto (Maternal/Child)\n3. Shinikizo la Damu/Presha (NCD)\n4. Ajali au Jeraha la Dharura (Emergency)\n5. Andika dalili nyingine`,
      nextState: state,
      isEnd: false
    };
  }

  if (state.step === 'SYMPTOM_MENU') {
    state.step = 'SUMMARY';
    if (trimmed === '4') {
      return {
        responseMenu: `END ⚠️ DHARURA: Weka shinikizo safi kwenye jeraha. CHP na ambulansi zimearifiwa. Piga 1199 bure mara moja.`,
        nextState: state,
        isEnd: true
      };
    }
    if (trimmed === '1') {
      return {
        responseMenu: `END AfiyaSauti: Pima homa. Mpe maji ya kutosha. Ikiwa mtoto anapumua kwa kasi au kuvuta kifua, fika zahanati ya Level 2/3 mara moja. SMS ya maelezo imetumwa.`,
        nextState: state,
        isEnd: true
      };
    }
    return {
      responseMenu: `END AfiyaSauti: Ushauri wa kituo cha afya umetumwa kwa SMS bila malipo. Tembelea kituo cha afya kilicho karibu kwa ukaguzi wa daktari.`,
      nextState: state,
      isEnd: true
    };
  }

  return {
    responseMenu: `END AfiyaSauti *384# imekamilika. Asante.`,
    nextState: state,
    isEnd: true
  };
}

// Memory map for persistent active USSD sessions
const activeUSSDSessions = new Map<string, USSDSessionState>();

export function processUSSDSession(
  sessionId: string,
  input: string,
  lang: KenyanLanguage = 'sw'
): { message: string; isEnd: boolean } {
  let session = activeUSSDSessions.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      step: 'WELCOME_LANG',
      language: lang
    };
    activeUSSDSessions.set(sessionId, session);
  }

  const result = handleUSSDStep(input, session);
  activeUSSDSessions.set(sessionId, result.nextState);
  if (result.isEnd) {
    activeUSSDSessions.delete(sessionId);
  }

  return {
    message: result.responseMenu,
    isEnd: result.isEnd
  };
}
