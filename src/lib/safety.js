/**
 * Safety Services — AfiyaSauti
 * Cryptographic hashing, de-identification, red-flag detection,
 * confidence/entropy gates, and audit logging.
 *
 * SUPABASE MIGRATION: These functions run client-side and are framework-agnostic.
 * In Supabase, move hashing to a Postgres function (pgcrypto) or Supabase Edge Function
 * for server-side enforcement. See commented SQL in chat schema.
 */

// --- HMAC-SHA-256 with dynamic salt (Web Crypto API) ---
export async function hmacSha256(message, salt) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(salt);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// --- Salted SHA-256 hash (for phone numbers / identifiers) ---
export async function saltedSha256(message, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${message}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// --- De-identification: Kenyan-specific PII removal before model calls ---
// Ported from GitHub repo src/services/safety.ts — handles Kenyan phone formats,
// National IDs, emails, and common Kenyan names.
export function deidentify(text) {
  if (!text) return '';
  let result = text;

  // Kenyan phone numbers: +254 7XX XXX XXX, 07XXXXXXXX, 01XXXXXXXX
  result = result.replace(/(\+?254|0)[17]\d{8}/g, '[REDACTED_PHONE_KE]');
  // Kenyan National ID (7-8 standalone digits)
  result = result.replace(/\b\d{7,8}\b/g, '[REDACTED_NATIONAL_ID]');
  // Email addresses
  result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  // Passport-like
  result = result.replace(/\b[A-Z]{2}\d{6,9}\b/g, '[REDACTED_ID]');
  // Explicit ID labels
  result = result.replace(/\b(?:ID|National|Passport|NSSF|NHIF)\s*[:#]?\s*\w+\b/gi, '[REDACTED_ID]');
  // Common Kenyan names
  result = result.replace(/\b(Wanjiku|Kamau|Otieno|Achieng|Ochieng|Mwangi|Kiprop|Chebet|Moraa|Nekesa|Omondi|Kariuki|Mutua|Kioko|Juma|Amina|Fatuma|Hassan)\b/gi, '[REDACTED_PERSON]');
  // "My name is X" patterns
  result = result.replace(/\b(?:my name is|i am called|nitwa|jina langu ni)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/gi, '[REDACTED_PERSON]');

  return result;
}

// Returns sanitized text + list of redacted entity types (for audit/SOAP notes)
export function sanitizeInputForModel(rawInput) {
  const redactedEntities = [];
  let sanitized = rawInput || '';
  const phoneMatch = sanitized.match(/(\+?254|0)[17]\d{8}/g);
  if (phoneMatch) phoneMatch.forEach(() => redactedEntities.push('PHONE'));
  sanitized = deidentify(sanitized);
  return { sanitized, redactedEntities };
}

// --- Red-flag detection (emergency keywords across languages) ---
const RED_FLAG_KEYWORDS = {
  en: ['chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding', 'convulsion', 'seizure', 'not breathing', 'cyanosis', 'blue lips', 'stiff neck', 'unable to swallow', 'severe dehydration', 'no urine', 'fits'],
  sw: ['sifuri ya kupumua', 'kifafa', 'kukosa fahamu', 'kutokwa damu nyingi', 'shida ya kupumua', 'kifua chungu sana', 'kichefuchefu cha kushtuka', 'mtoto mwenye homa ya juu', 'kukosa kukojoa', 'mti wa shingo', 'damu ya pua'],
  luo: ['ok oyie yo weche', 'odhi e gik ma owuok', 'puo mar nene', 'rem mar nene', 'ochweyo'],
  kikuyu: ['gutirwo na hothi', 'kuhura', 'thakame nyingi', 'kugeria kuhura'],
};

/**
 * Enhanced red-flag detection with Kenyan clinical conditions.
 * Ported from GitHub repo src/services/safety.ts — covers maternal danger
 * signs, pediatric IMCI, acute respiratory, cardiovascular/stroke, cholera.
 * Returns { detected, keyword, triggerCondition, firstAid, immediateActions, chpDispatchPriority }
 */
export function detectRedFlag(text, language = 'sw', vitals = {}) {
  if (!text) return { detected: false, keyword: null, firstAid: null, immediateActions: [], chpDispatchPriority: 'ROUTINE' };
  const t = text.toLowerCase();

  // 1. Maternal danger signs (pre-eclampsia / hemorrhage / fetal distress)
  if (
    (t.includes('severe headache') && (t.includes('blurred vision') || t.includes('swelling') || t.includes('pregnant') || t.includes('mimba'))) ||
    t.includes('bleeding heavily') || t.includes('kutokwa damu') || t.includes('damu nyingi') ||
    t.includes('convulsion') || t.includes('seizure') || t.includes('kifafa') || t.includes('fitting') ||
    t.includes('baby not moving') || t.includes('mtoto hakisogei') || t.includes('fetal movement')
  ) {
    return {
      detected: true, keyword: 'maternal_emergency',
      triggerCondition: 'MATERNAL_OBSTETRIC_EMERGENCY (Pre-eclampsia / Antepartum Hemorrhage / Fetal Distress)',
      firstAid: language === 'sw'
        ? 'Nenda hospitali ya Level 4/5 mara moja. Lala upande wa kushoto. Usinywe maji ukiwa dhaifu au kifafa. Weka njia ya hewa wazi.'
        : 'Immediate referral to nearest Level 4/5 hospital. Position patient on left lateral side. Do not give oral fluids if drowsy or convulsing. Keep airway clear.',
      immediateActions: ['Dispatch emergency CHP for hospital escort', 'Call Kenya Red Cross 1199 or County Ambulance', 'Instruct caregiver on left-lateral recovery position'],
      chpDispatchPriority: 'CRITICAL_RED_FLAG',
    };
  }

  // 2. Pediatric IMCI general danger signs
  if (
    t.includes('cannot drink') || t.includes('unable to breastfeed') || t.includes('vomiting everything') || t.includes('kutapika vyote') ||
    t.includes('unconscious') || t.includes('lethargic') || t.includes('kukosa fahamu') ||
    t.includes('stridor') || t.includes('chest indrawing') || t.includes('kifua kuvutika') ||
    (vitals.respiratoryRate && vitals.respiratoryRate > 55)
  ) {
    return {
      detected: true, keyword: 'pediatric_danger',
      triggerCondition: 'PEDIATRIC_IMCI_GENERAL_DANGER_SIGN (Severe Pneumonia / Sepsis / Severe Malaria)',
      firstAid: language === 'sw'
        ? 'Vaa mtoto joto. Mpe ORS au maziwa ya mama kama ana fahamu. Usimlazimishe maji akikitema vyote. Nenda kituo cha afya mara moja.'
        : 'Keep child warm. Give sips of ORS or breastmilk if conscious. Do not force fluids if vomiting everything. Rush to nearest health facility.',
      immediateActions: ['Dispatch CHP with IMCI emergency kit', 'Pre-referral rectal artesunate if fever + convulsions in malaria zone', 'Ensure warm transport'],
      chpDispatchPriority: 'CRITICAL_RED_FLAG',
    };
  }

  // 3. Acute severe respiratory distress
  if (
    (vitals.respiratoryRate && vitals.respiratoryRate > 35) ||
    (vitals.spo2 && vitals.spo2 < 90) ||
    t.includes('cannot breathe') || t.includes('shida ya kupumua') || t.includes('sifuri ya kupumua') ||
    t.includes('turning blue') || t.includes('gasping for air') || t.includes('severe breathlessness')
  ) {
    return {
      detected: true, keyword: 'respiratory_failure',
      triggerCondition: 'ACUTE_RESPIRATORY_FAILURE (Severe Asthma / Pulmonary Edema / ARDS)',
      firstAid: language === 'sw'
        ? 'Mketi mgonjwa wima. Fungua nguo za shingo na kifua. Kama kuna inhaler ya salbutamol, itumie mara moja.'
        : 'Sit patient upright in high Fowler position. Loosen tight clothing. If prescribed salbutamol inhaler is available, administer with spacer immediately.',
      immediateActions: ['Dispatch CHP with pulse oximeter', 'Facilitate oxygen therapy at closest facility', 'Prepare ambulance transfer'],
      chpDispatchPriority: 'CRITICAL_RED_FLAG',
    };
  }

  // 4. Acute cardiovascular / stroke (FAST protocol)
  if (
    (t.includes('chest pain') && (t.includes('left arm') || t.includes('jaw') || t.includes('crushing') || t.includes('sweating'))) ||
    t.includes('face drooping') || t.includes('arm weakness') || t.includes('slurred speech') || t.includes('sudden paralysis') ||
    t.includes('maumivu ya kifua') && t.includes('mkono')
  ) {
    return {
      detected: true, keyword: 'cardiovascular_stroke',
      triggerCondition: 'ACUTE_CORONARY_SYNDROME_OR_STROKE (FAST Protocol)',
      firstAid: language === 'sw'
        ? 'Mgonjwa apumzike kimya. Mpee aspirin 300mg ya kutafuna kama hakuna mzio. Amsitemi kutembea.'
        : 'Keep patient resting quietly. Have patient chew 300mg soluble aspirin if no allergy or bleeding history. Do not let patient walk or exert.',
      immediateActions: ['Record exact time of symptom onset for thrombolytic window (<4.5 hrs)', 'Alert receiving hospital emergency department', 'Rapid evacuation via EMS'],
      chpDispatchPriority: 'CRITICAL_RED_FLAG',
    };
  }

  // 5. Severe dehydration / cholera alert
  if (
    (t.includes('rice water') || (t.includes('watery diarrhea') && t.includes('sunken eyes'))) &&
    (t.includes('vomiting') || t.includes('very thirsty') || t.includes('skin pinch very slow'))
  ) {
    return {
      detected: true, keyword: 'cholera_dehydration',
      triggerCondition: 'CHOLERA_OR_SEVERE_DEHYDRATION (Plan C Dehydration Protocol)',
      firstAid: language === 'sw'
        ? 'Anza ORS mara moja (fimbo 1 kwa lita 1 ya maji ya kuchemsha). Usisubiri kufika hospitali kuanza ORS.'
        : 'Begin frequent sips of ORS immediately (1 sachet in 1 liter clean boiled water). Do not wait for hospital arrival to start ORS.',
      immediateActions: ['Dispatch CHP with ORS + Zinc and water purification tablets', 'Alert Sub-County Disease Surveillance Coordinator', 'Arrange IV Ringer Lactate at health center'],
      chpDispatchPriority: 'CRITICAL_RED_FLAG',
    };
  }

  // 6. Keyword-based fallback (original multi-language keywords)
  const langKeys = RED_FLAG_KEYWORDS[language] || RED_FLAG_KEYWORDS.en;
  const allKeys = [...langKeys, ...RED_FLAG_KEYWORDS.en];
  for (const keyword of allKeys) {
    if (t.includes(keyword.toLowerCase())) {
      return {
        detected: true, keyword,
        triggerCondition: 'EMERGENCY_KEYWORD_DETECTED',
        firstAid: language === 'sw'
          ? 'Hii ni dharura. Nenda kituo cha afya kilicho karibu mara moja au piga 999.'
          : 'This is an emergency. Proceed to the nearest health facility immediately or call 999.',
        immediateActions: ['Dispatch CHP', 'Call 999 or 1199'],
        chpDispatchPriority: 'CRITICAL_RED_FLAG',
      };
    }
  }

  return { detected: false, keyword: null, firstAid: null, immediateActions: [], chpDispatchPriority: 'ROUTINE' };
}

// --- Confidence / Entropy gate (edge triage) ---
export const CONFIDENCE_THRESHOLD = 0.85;
export const ENTROPY_THRESHOLD = 0.35;

export function evaluateConfidenceGate(confidence, entropy) {
  if (confidence < CONFIDENCE_THRESHOLD || entropy > ENTROPY_THRESHOLD) {
    return {
      triage: 'UNCERTAIN_EDGE_TRIAGE',
      escalate: true,
      message: 'Confidence below threshold or entropy too high — escalating to human clinician.',
    };
  }
  return { triage: null, escalate: false, message: 'Thresholds met.' };
}

// --- Urgency scoring ---
export function scoreUrgency(symptoms, redFlag) {
  if (redFlag) return 'RED';
  const severeKeywords = ['severe', 'sana', 'nene', 'persistent', 'chronic', 'high fever', 'homa ya juu'];
  const lowerSymptoms = (symptoms || '').toLowerCase();
  const severeCount = severeKeywords.filter(k => lowerSymptoms.includes(k)).length;
  if (severeCount >= 2) return 'YELLOW';
  if (severeCount >= 1) return 'YELLOW';
  return 'GREEN';
}

// --- Cryptographic audit chain ---
export async function chainAuditHash(prevHash, payload) {
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return saltedSha256(`${prevHash || 'genesis'}:${payloadStr}`, 'afiyaSauti-audit-chain-v1');
}

// --- Digital signature for SOAP notes ---
export async function signNote(noteId, clinicianId, content) {
  const payload = `${noteId}:${clinicianId}:${content}`;
  return saltedSha256(payload, 'afiyaSauti-clinical-signature-v1');
}

// --- Generate dynamic salt ---
export function generateSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}