/**
 * Patient Data Generator — AfiyaSauti
 * Generates realistic Kenyan patient symptom scenarios with ground-truth labels
 * for testing the triage intake pipeline across channels (SMS, Voice/IVR, USSD, Web).
 *
 * Each scenario includes:
 *  - Realistic symptom text in the target language
 *  - Expected urgency (GREEN/YELLOW/RED) for pass/fail verification
 *  - Expected red-flag status
 *  - Channel-specific formatting (SMS truncation, voice transcription noise, USSD codes)
 *
 * SUPABASE ALTERNATIVE:
 *   CREATE TABLE test_scenarios (
 *     id TEXT PRIMARY KEY, name TEXT, domain TEXT, language TEXT,
 *     symptom_text TEXT, expected_urgency TEXT, expected_red_flag BOOLEAN,
 *     red_flag_keywords TEXT[], profile JSONB
 *   );
 *   INSERT INTO test_scenarios VALUES ...;
 *   -- Run: SELECT run_triage_test_batch(10, ARRAY['whatsapp','ivr']);
 */

export const PATIENT_SCENARIOS = [
  // ═══════════════════════════════════════════════════════════
  // MATERNAL & CHILD HEALTH
  // ═══════════════════════════════════════════════════════════
  {
    id: 'MC001', name: 'Child fever — moderate',
    domain: 'maternal_child', language: 'sw',
    symptomText: 'Mtoto wangu wa miezi 8 ana homa ya juu na kikohozi. Ananyonya vizuri lakini analala sana.',
    expectedUrgency: 'YELLOW', expectedRedFlag: false,
    profile: { age: '8 months', gender: 'female' },
  },
  {
    id: 'MC002', name: 'Child — IMCI danger signs',
    domain: 'maternal_child', language: 'sw',
    symptomText: 'Mtoto wa miezi 6 hawanywi maziwa, joto ni 39.5, kifua kinaingia ndani anapopumua na anatoa mateini.',
    expectedUrgency: 'RED', expectedRedFlag: true,
    redFlagKeywords: ['hawanywi', 'kifua kinaingia', 'mateini'],
    profile: { age: '6 months', gender: 'male' },
  },
  {
    id: 'MC003', name: 'Pregnant — antenatal bleeding',
    domain: 'maternal_child', language: 'sw',
    symptomText: 'Nina mimba ya miezi 7 na nimeanza kutokwa na damu. Tumbo linauma sana.',
    expectedUrgency: 'RED', expectedRedFlag: true,
    redFlagKeywords: ['mimba', 'damu', 'tumbo linauma'],
    profile: { age: '28 years', gender: 'female', pregnant: true },
  },
  {
    id: 'MC004', name: 'Postnatal — mother fever',
    domain: 'maternal_child', language: 'en',
    symptomText: 'I gave birth 5 days ago and now I have high fever, chills and lower abdominal pain.',
    expectedUrgency: 'YELLOW', expectedRedFlag: false,
    profile: { age: '24 years', gender: 'female', postnatal: true },
  },
  {
    id: 'MC005', name: 'Child — routine immunization check',
    domain: 'maternal_child', language: 'sw',
    symptomText: 'Mtoto wangu wa miezi 2 anahitaji chanjo. Ana afya njema, hakuna homa.',
    expectedUrgency: 'GREEN', expectedRedFlag: false,
    profile: { age: '2 months', gender: 'female' },
  },

  // ═══════════════════════════════════════════════════════════
  // INFECTIOUS & VECTOR-BORNE
  // ═══════════════════════════════════════════════════════════
  {
    id: 'IN001', name: 'Malaria — uncomplicated',
    domain: 'infectious', language: 'sw',
    symptomText: 'Nina homa ya muda mrefu, kichwa unauma, viungo vinauma na joto la juu. Homa ilianza jana.',
    expectedUrgency: 'YELLOW', expectedRedFlag: false,
    profile: { age: '32 years', gender: 'male' },
  },
  {
    id: 'IN002', name: 'Malaria — severe (RED)',
    domain: 'infectious', language: 'sw',
    symptomText: 'Mtoto wangu ana homa kali, anatetemeka, hawezi kuamka vizuri na anatoa kichefuchefu. Hii ni dharura.',
    expectedUrgency: 'RED', expectedRedFlag: true,
    redFlagKeywords: ['hawezi kuamka', 'dharura'],
    profile: { age: '4 years', gender: 'male' },
  },
  {
    id: 'IN003', name: 'TB — chronic cough',
    domain: 'infectious', language: 'luo',
    symptomText: 'Atiende gi yie mabor niwach gi dwe mar adek. Ok awuok e dala, ema ichako motegno.',
    expectedUrgency: 'YELLOW', expectedRedFlag: false,
    profile: { age: '45 years', gender: 'male' },
  },
  {
    id: 'IN004', name: 'COVID-like — breathlessness',
    domain: 'infectious', language: 'en',
    symptomText: 'I have had a dry cough for 5 days, now I cannot breathe well when walking. My chest is tight.',
    expectedUrgency: 'RED', expectedRedFlag: true,
    redFlagKeywords: ['cannot breathe', 'chest is tight'],
    profile: { age: '55 years', gender: 'female' },
  },
  {
    id: 'IN005', name: 'Cholera — acute watery diarrhea',
    domain: 'infectious', language: 'sw',
    symptomText: 'Nimeanza kuhara maji mengi sasa saa 6, nimelegea sana na kinywa kimekauka.',
    expectedUrgency: 'RED', expectedRedFlag: true,
    redFlagKeywords: ['kuhara maji', 'nimelegea', 'kinywa kimekauka'],
    profile: { age: '38 years', gender: 'male' },
  },

  // ═══════════════════════════════════════════════════════════
  // NON-COMMUNICABLE DISEASES
  // ═══════════════════════════════════════════════════════════
  {
    id: 'NC001', name: 'Hypertension — routine check',
    domain: 'ncd', language: 'sw',
    symptomText: 'Baba yangu ana shinikizo la damu. Anahitaji kukagua shinikizo leo. Hana maumivu sasa.',
    expectedUrgency: 'GREEN', expectedRedFlag: false,
    profile: { age: '62 years', gender: 'male' },
  },
  {
    id: 'NC002', name: 'Diabetes — high sugar symptoms',
    domain: 'ncd', language: 'sw',
    symptomText: 'Ninahisi kiu sana, kojoa mara kwa mara, na nimepoteza uzito bila sababu. Nina kisukari.',
    expectedUrgency: 'YELLOW', expectedRedFlag: false,
    profile: { age: '50 years', gender: 'female' },
  },
  {
    id: 'NC003', name: 'Hypertensive crisis — RED',
    domain: 'ncd', language: 'sw',
    symptomText: 'Kichwa inaniuma sana, naziona nyota, koo ni la kushoto, na shinikizo la damu ni 180/120.',
    expectedUrgency: 'RED', expectedRedFlag: true,
    redFlagKeywords: ['kichwa inaniuma', 'naziona nyota', 'koo ni la kushoto'],
    profile: { age: '58 years', gender: 'male' },
  },
  {
    id: 'NC004', name: 'Asthma — mild exacerbation',
    domain: 'ncd', language: 'en',
    symptomText: 'My asthma is acting up a little, some wheezing but my inhaler helps. No chest pain.',
    expectedUrgency: 'YELLOW', expectedRedFlag: false,
    profile: { age: '30 years', gender: 'female' },
  },

  // ═══════════════════════════════════════════════════════════
  // MENTAL HEALTH
  // ═══════════════════════════════════════════════════════════
  {
    id: 'MH001', name: 'Depression — moderate',
    domain: 'mental_health', language: 'sw',
    symptomText: 'Sikujali chochote siku hizi, silali vizuri, sina nguvu za kufanya kazi. Ninahisi hana matumaini.',
    expectedUrgency: 'YELLOW', expectedRedFlag: false,
    profile: { age: '35 years', gender: 'female' },
  },
  {
    id: 'MH002', name: 'Suicidal ideation — RED',
    domain: 'mental_health', language: 'sw',
    symptomText: 'Nimechoka na maisha. Nafikiria kujiua. Sijui nifanye nini tena.',
    expectedUrgency: 'RED', expectedRedFlag: true,
    redFlagKeywords: ['kujiua', 'nafikiria kujiua'],
    profile: { age: '27 years', gender: 'male' },
  },
  {
    id: 'MH003', name: 'Anxiety — mild',
    domain: 'mental_health', language: 'en',
    symptomText: 'I feel anxious sometimes when going to public places but it is manageable.',
    expectedUrgency: 'GREEN', expectedRedFlag: false,
    profile: { age: '22 years', gender: 'female' },
  },

  // ═══════════════════════════════════════════════════════════
  // EMERGENCY
  // ═══════════════════════════════════════════════════════════
  {
    id: 'EM001', name: 'Unconscious — RED',
    domain: 'emergency', language: 'sw',
    symptomText: 'Mume wangu amepoteza fahamu ghafla. Hapumzi vizuri. Tafadhali saidia haraka!',
    expectedUrgency: 'RED', expectedRedFlag: true,
    redFlagKeywords: ['amepoteza fahuma', 'hapumzi'],
    profile: { age: '45 years', gender: 'male' },
  },
  {
    id: 'EM002', name: 'Chest pain — cardiac suspect',
    domain: 'emergency', language: 'sw',
    symptomText: 'Kifua kinauma sana kama kinabana, maumivu yanaenea kwenye mkono wa kushoto. Na jasho nyingi.',
    expectedUrgency: 'RED', expectedRedFlag: true,
    redFlagKeywords: ['kifua kinauma', 'kinabana', 'mkono wa kushoto'],
    profile: { age: '60 years', gender: 'male' },
  },
  {
    id: 'EM003', name: 'Snake bite',
    domain: 'emergency', language: 'luo',
    symptomText: 'Nyathora oremo gi njok. Riwe magwaro, koso neno mar puko. Ooyo koda.',
    expectedUrgency: 'RED', expectedRedFlag: true,
    redFlagKeywords: ['orembo gi njok', 'puko'],
    profile: { age: '15 years', gender: 'male' },
  },
  {
    id: 'EM004', name: 'Burns — moderate',
    domain: 'emergency', language: 'sw',
    symptomText: 'Mtoto ameunguzwa na maji ya moto kwenye mkono. Mkononi mmevimba lakini hakuna vidonda vikubwa.',
    expectedUrgency: 'YELLOW', expectedRedFlag: false,
    profile: { age: '5 years', gender: 'female' },
  },

  // ═══════════════════════════════════════════════════════════
  // GENERAL
  // ═══════════════════════════════════════════════════════════
  {
    id: 'GE001', name: 'Common cold',
    domain: 'general', language: 'sw',
    symptomText: 'Nina kikohozi kidogo na homa ndogo. Sina maumivu mengine.',
    expectedUrgency: 'GREEN', expectedRedFlag: false,
    profile: { age: '25 years', gender: 'female' },
  },
  {
    id: 'GE002', name: 'Headache — tension',
    domain: 'general', language: 'en',
    symptomText: 'I have a mild headache from working long hours. No other symptoms.',
    expectedUrgency: 'GREEN', expectedRedFlag: false,
    profile: { age: '33 years', gender: 'male' },
  },
  {
    id: 'GE003', name: 'Abdominal pain — unspecified',
    domain: 'general', language: 'sw',
    symptomText: 'Tumbo linauma kwa siku mbili sasa. Sijui kimechanganywa na chakula au nini.',
    expectedUrgency: 'YELLOW', expectedRedFlag: false,
    profile: { age: '40 years', gender: 'female' },
  },
  {
    id: 'GE004', name: 'Skin rash — mild allergy',
    domain: 'general', language: 'kikuyu',
    symptomText: 'Nini maru ma thonondo iguru ria kuguru. Ti iguru rimwe, ndiraragia na iguru riitwo.',
    expectedUrgency: 'GREEN', expectedRedFlag: false,
    profile: { age: '18 years', gender: 'female' },
  },
];

// ═══════════════════════════════════════════════════════════
// CHANNEL-SPECIFIC FORMATTERS
// Simulates how text arrives from each ingestion channel
// ═══════════════════════════════════════════════════════════

/** SMS/WhatsApp: truncate to 160 chars, lowercase, occasional typos */
function formatAsSMS(text) {
  let truncated = text.length > 160 ? text.substring(0, 157) + '...' : text;
  // Simulate occasional SMS shorthand
  return truncated
    .replace(/sana/g, 'sna')
    .replace(/sasa/g, 'sa')
    .replace(/Tafadhali/g, 'Tfadhali');
}

/** Voice/IVR: simulate speech-to-text transcription noise */
function formatAsVoice(text) {
  const noise = ['um', 'eh', 'na', 'halafu', 'yaani'];
  const words = text.split(' ');
  // Insert filler words occasionally and simulate misheard words
  const noisy = words.map((w, i) => {
    if (i > 0 && i % 8 === 0) return noise[Math.floor(Math.random() * noise.length)] + ' ' + w;
    return w;
  });
  // Simulate transcription errors (missing punctuation, lowercase)
  return noisy.join(' ').replace(/[.!?]/g, '').toLowerCase();
}

/** USSD: structured menu-style input with codes */
function formatAsUSSD(text, scenario) {
  const domainCode = {
    maternal_child: '1', ncd: '2', infectious: '3',
    mental_health: '4', emergency: '5', general: '6',
  }[scenario.domain] || '6';
  // USSD is typically shorter and more structured
  const shortText = text.length > 100 ? text.substring(0, 97) + '...' : text;
  return `[${domainCode}] ${shortText}`;
}

/** Web: full text, well-formatted */
function formatAsWeb(text) {
  return text;
}

/**
 * Generate a batch of test scenarios formatted for a specific channel.
 * @param {Object} opts - { count, channel, domain, urgency, language }
 * @returns {Array} - Array of formatted test cases
 */
export function generateTestBatch(opts = {}) {
  const { count = 5, channel = 'whatsapp', domain, urgency, language } = opts;

  let pool = [...PATIENT_SCENARIOS];
  if (domain && domain !== 'all') pool = pool.filter(s => s.domain === domain);
  if (urgency && urgency !== 'all') pool = pool.filter(s => s.expectedUrgency === urgency);
  if (language && language !== 'all') pool = pool.filter(s => s.language === language);

  // Shuffle and pick
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map(scenario => {
    let formattedText;
    switch (channel) {
      case 'whatsapp': formattedText = formatAsSMS(scenario.symptomText); break;
      case 'ivr': formattedText = formatAsVoice(scenario.symptomText); break;
      case 'ussd': formattedText = formatAsUSSD(scenario.symptomText, scenario); break;
      case 'web': formattedText = formatAsWeb(scenario.symptomText); break;
      default: formattedText = scenario.symptomText;
    }

    return {
      ...scenario,
      channel,
      formattedText,
      originalText: scenario.symptomText,
    };
  });
}

/**
 * Compare actual triage result against expected ground truth.
 * @returns {Object} - { passed, urgencyMatch, redFlagMatch, details }
 */
export function verifyTriageResult(testCase, actualResult) {
  const urgencyMatch = actualResult.urgency === testCase.expectedUrgency;
  const redFlagMatch = actualResult.redFlag === testCase.expectedRedFlag;

  // Check if red flag keywords were detected (if expected)
  let keywordMatch = true;
  if (testCase.expectedRedFlag && testCase.redFlagKeywords) {
    const detectedText = (actualResult.redFlagKeyword || actualResult.redFlagDetails || '').toLowerCase();
    keywordMatch = testCase.redFlagKeywords.some(kw =>
      detectedText.includes(kw.toLowerCase()) ||
      (actualResult.aiResponse || '').toLowerCase().includes(kw.toLowerCase())
    );
  }

  const passed = urgencyMatch && redFlagMatch;

  return {
    passed,
    urgencyMatch,
    redFlagMatch,
    keywordMatch,
    expected: { urgency: testCase.expectedUrgency, redFlag: testCase.expectedRedFlag },
    actual: { urgency: actualResult.urgency, redFlag: actualResult.redFlag },
    details: {
      scenarioId: testCase.id,
      scenarioName: testCase.name,
      domain: testCase.domain,
      channel: testCase.channel,
      confidence: actualResult.confidence,
      aiResponse: actualResult.aiResponse,
      redFlagKeyword: actualResult.redFlagKeyword,
    },
  };
}

export const DOMAINS = ['all', 'maternal_child', 'ncd', 'infectious', 'mental_health', 'emergency', 'general'];
export const URGENCIES = ['all', 'GREEN', 'YELLOW', 'RED'];
export const CHANNELS = ['whatsapp', 'ussd', 'ivr', 'web'];
export const LANGUAGES = ['all', 'sw', 'en', 'luo', 'kikuyu'];