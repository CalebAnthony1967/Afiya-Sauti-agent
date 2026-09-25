/**
 * AfiyaSauti Verified Clinical Knowledge Base
 * Grounded triage with real MoH Kenya / WHO IMCI citations.
 * Ported from GitHub repo src/services/clinicalModules.ts
 *
 * Sources: Kenya MoH Clinical Guidelines 2023, WHO IMCI 2022, ICD-11,
 * Kenya Obstetric Protocols, Kenya Mental Health Action Plan.
 *
 * SUPABASE MIGRATION: move VERIFIED_KNOWLEDGE_BASE into a pgvector table
 * (knowledge_chunks) and replace retrieveGroundedKnowledge with an
 * RPC call: supabase.rpc('match_documents', { query_embedding, match_count: 3 })
 */

export const SUPPORTED_LANGUAGES = {
  sw: { code: 'sw', name: 'Kiswahili', nativeName: 'Kiswahili', region: 'National' },
  en: { code: 'en', name: 'English', nativeName: 'English', region: 'Official' },
  ki: { code: 'ki', name: 'Kikuyu', nativeName: 'Gĩkũyũ', region: 'Central Kenya' },
  luo: { code: 'luo', name: 'Dholuo', nativeName: 'Dholuo', region: 'Nyanza' },
  luy: { code: 'luy', name: 'Luhya', nativeName: 'Luluhya', region: 'Western Kenya' },
  kal: { code: 'kal', name: 'Kalenjin', nativeName: 'Kalenjin', region: 'Rift Valley' },
  kam: { code: 'kam', name: 'Kamba', nativeName: 'Kikamba', region: 'Eastern Kenya' },
  gus: { code: 'gus', name: 'Gusii', nativeName: 'Ekegusii', region: 'South Nyanza' },
  mer: { code: 'mer', name: 'Meru', nativeName: 'Kimeru', region: 'Mount Kenya East' },
};

export const KNOWLEDGE_BASE = [
  {
    chunkId: 'KB-MNCH-001',
    domain: 'maternal_child',
    keywords: ['cough', 'breathing fast', 'kukohoa', 'kupumua haraka', 'pneumonia', 'mtoto', 'child', 'chest', 'kifua'],
    title: 'IMCI: Fast Breathing and Pneumonia in Children',
    source: { sourceName: 'Ministry of Health Kenya', documentTitle: 'Kenya Basic Paediatric Protocols & IMCI 5th Edition', version: 'v5.2-MoH', uri: 'https://guidelines.health.go.ke/imci/respiratory' },
    icd11: { code: 'CA40', title: 'Pneumonia without specified organism' },
    guidanceText: {
      sw: 'Mtoto anayeonyesha kukohoa na kupumua kwa kasi (zaidi ya pumzi 50 kwa dakika kwa mtoto wa miezi 2-11, au pumzi 40 kwa miezi 12-59) anahitaji uchunguzi wa kliniki mara moja. Mpe maji safi ya kutosha au maziwa ya mama. Kifua kuvutika ndani (chest indrawing) ni dharura.',
      en: 'A child with cough and fast breathing (>50 breaths/min in 2-11 months, >40 in 12-59 months) requires timely clinical evaluation per IMCI. Offer frequent fluids or breastmilk. Chest indrawing or stridor is a general danger sign requiring emergency referral.',
    },
    recommendedActions: [
      'Count breaths for a full 60 seconds when child is calm',
      'Assess for chest indrawing and stridor',
      'If fast breathing without danger signs: visit nearest health center for IMCI evaluation',
      'Keep child warm and maintain hydration',
    ],
    contraindications: ['Do not give over-the-counter adult cough syrups to children under 5 years'],
  },
  {
    chunkId: 'KB-MNCH-002',
    domain: 'maternal_child',
    keywords: ['pregnant', 'headache', 'swelling', 'mimba', 'mjamzito', 'kuvimba miguu', 'kichwa kuuma', 'bleeding', 'damu'],
    title: 'Obstetric Danger Signs: Pre-Eclampsia & Hemorrhage',
    source: { sourceName: 'MoH Kenya - Division of Reproductive Health', documentTitle: 'National Guidelines for Quality Obstetrics & Perinatal Care', version: 'v3.1-MoH', uri: 'https://guidelines.health.go.ke/reproductive/obstetrics' },
    icd11: { code: 'JA24.0', title: 'Pre-eclampsia, unspecified severity' },
    guidanceText: {
      sw: 'Kuumwa na kichwa kikali, kutoona vizuri, uvimbe wa uso na mikono, au kutokwa na damu ukiwa mjamzito ni ishara hatari za uzazi. Zinahitaji tathmini ya dharura ya shinikizo la damu na mkojo kwenye zahanati au hospitali iliyo karibu.',
      en: 'Severe headache, visual disturbances, facial/hand edema, or vaginal bleeding during pregnancy are obstetric danger signs requiring immediate facility-based blood pressure and proteinuria evaluation.',
    },
    recommendedActions: [
      'Immediate referral to a Level 4/5 maternity unit',
      'Advise resting on the left side to optimize placental perfusion',
      'Check maternal blood pressure and fetal heart rate on arrival',
    ],
    contraindications: ['Do not advise home bed-rest without clinical BP and proteinuria checks'],
  },
  {
    chunkId: 'KB-NCD-001',
    domain: 'ncd',
    keywords: ['hypertension', 'blood pressure', 'bp', 'shinikizo la damu', 'presha', 'dizziness', 'headache', 'kichwa'],
    title: 'Kenya National Guidelines: Hypertension Management',
    source: { sourceName: 'MoH Kenya - NCD Division', documentTitle: 'Kenya National Strategy for Prevention & Control of NCDs', version: 'v2.0-MoH', uri: 'https://guidelines.health.go.ke/ncd/hypertension' },
    icd11: { code: 'BA00', title: 'Essential hypertension' },
    guidanceText: {
      sw: 'Shinikizo la damu (presha) linahitaji ufuatiliaji thabiti. Punguza chumvi, fanya mazoezi ya wastani, pima shinikizo mara kwa mara. Presha zaidi ya 180/110 au maumivu ya kifua ni dharura.',
      en: 'Blood pressure requires regular monitoring. Reduce dietary sodium, engage in moderate exercise, check BP regularly. Readings >180/110 mmHg or with chest pain constitute a hypertensive crisis requiring emergency care.',
    },
    recommendedActions: [
      'Measure BP after 5 minutes of seated rest using validated cuff',
      'Encourage adherence to prescribed antihypertensive medication',
      'Dietary modification: low salt, high potassium, avoid tobacco and excessive alcohol',
    ],
    contraindications: ['Never discontinue prescribed antihypertensives abruptly without clinician advice'],
  },
  {
    chunkId: 'KB-INFECT-001',
    domain: 'infectious',
    keywords: ['malaria', 'fever', 'chills', 'homa', 'kutapika', 'baridi', 'jasho', 'kichwa', 'joint pain', 'maumivu ya viungo'],
    title: 'Kenya National Malaria Treatment Guidelines',
    source: { sourceName: 'National Malaria Control Programme (NMCP) Kenya', documentTitle: 'Kenya National Guidelines for Diagnosis & Treatment of Malaria', version: 'v6.0-MoH', uri: 'https://guidelines.health.go.ke/malaria/treatment-guidelines' },
    icd11: { code: '1F40', title: 'Plasmodium falciparum malaria' },
    guidanceText: {
      sw: 'Homa kali, baridi na kutetemeka, au maumivu ya viungo katika ukanda wa malaria yanahitaji kipimo cha haraka cha mRDT kabla ya dawa. Ikiwa chanya, dawa iliyothibitishwa (AL au DHA-PPQ) inapaswa kuanzishwa.',
      en: 'Fever, chills, and rigors in malaria-endemic zones require parasitological confirmation with mRDT or microscopy before treatment. If positive, Ministry-approved Artemether-Lumefantrine (AL) should be initiated per weight-banded guidelines.',
    },
    recommendedActions: [
      'Perform rapid malaria diagnostic test (mRDT) at primary care facility or via trained CHP',
      'Symptomatic fever management with Paracetamol (10-15 mg/kg for children)',
      'Ensure complete course of Artemether-Lumefantrine is finished even after symptoms subside',
    ],
    contraindications: ['Do not administer antimalarials without parasitological confirmation unless in severe pre-referral triage'],
  },
  {
    chunkId: 'KB-MH-001',
    domain: 'mental_health',
    keywords: ['depression', 'anxiety', 'huzuni', 'kushuka moyo', 'wasiwasi', 'insomnia', 'stress', 'trauma', 'hopeless', 'kutopenda'],
    title: 'Kenya Mental Health Action Plan & WHO mhGAP Guide',
    source: { sourceName: 'MoH Kenya - Mental Health Taskforce & WHO', documentTitle: 'Kenya Mental Health Action Plan 2021-2025 & mhGAP Humanitarian Guide', version: 'v2.1', uri: 'https://guidelines.health.go.ke/mental-health/action-plan' },
    icd11: { code: '6A70', title: 'Single episode depressive disorder' },
    guidanceText: {
      sw: 'Hisia za huzuni ya muda mrefu, uchovu usioisha, kutopenda shughuli za kawaida, au wasiwasi mwingi ni changamoto za kiafya zinazotibika. Huduma za ushauri zinapatikana bila malipo kupitia nambari 1190 au kituo cha afya.',
      en: 'Persistent low mood, exhaustion, loss of interest, and anxiety are manageable conditions. Counseling and psychosocial support are available free via helpline 1190 or your nearest health facility.',
    },
    recommendedActions: [
      'Encourage connection with trusted family or community support',
      'Refer to nearest health facility for mental health screening',
      'Share helpline 1190 for free psychosocial support',
    ],
    contraindications: ['Do not dismiss symptoms — untreated depression can worsen significantly'],
  },
  {
    chunkId: 'KB-EMER-001',
    domain: 'emergency',
    keywords: ['emergency', 'dharura', 'accident', 'ajali', 'injury', 'jeraha', 'burn', 'choma', 'poisoning', 'sumu', 'drowning', 'kuzama'],
    title: 'Kenya Emergency First Aid & Pre-Hospital Care Guidelines',
    source: { sourceName: 'MoH Kenya & Kenya Red Cross', documentTitle: 'Kenya Pre-Hospital Emergency Care Guidelines', version: 'v1.4-MoH', uri: 'https://guidelines.health.go.ke/emergency/first-aid' },
    icd11: { code: 'QA02', title: 'Contact with health services for general examination' },
    guidanceText: {
      sw: 'Kwa ajali au jeraha, hakikisha eneo ni salama, simamisha kutokwa damu kwa shinikizo la moja kwa moja, na usogeze mgonjwa isipokuwa kama ana hatari. Piga 999 au 1199 (Kenya Red Cross) mara moja.',
      en: 'For accidents or injuries, ensure scene safety, control bleeding with direct pressure, and do not move the patient unless in immediate danger. Call 999 or 1199 (Kenya Red Cross) immediately.',
    },
    recommendedActions: [
      'Ensure scene safety before approaching',
      'Control bleeding with direct pressure and elevation',
      'Call 999 or 1199 for emergency evacuation',
      'Keep patient warm and monitor consciousness',
    ],
    contraindications: ['Do not move a patient with suspected spinal injury unless in immediate danger'],
  },
  {
    chunkId: 'KB-GEN-001',
    domain: 'general',
    keywords: ['fever', 'homa', 'headache', 'kichwa', 'body pain', 'maumivu', 'fatigue', 'uchovu', 'general', 'general'],
    title: 'General Health Triage & Self-Care Guidance',
    source: { sourceName: 'MoH Kenya', documentTitle: 'Kenya Primary Care Guidelines', version: 'v1.0-MoH', uri: 'https://guidelines.health.go.ke/primary-care' },
    icd11: { code: 'QA02', title: 'Contact with health services for general examination' },
    guidanceText: {
      sw: 'Kwa dalili za jumla kama homa nyepesi au maumivu ya mwili, pumzika, nywa maji ya kutosha, na tumia dawa za kutuliza homa kama Paracetamol. Ikiwa dalili zinaendelea zaidi ya siku 3 au zinaongezeka, tembelea kituo cha afya.',
      en: 'For general symptoms like mild fever or body aches, rest, drink plenty of fluids, and use fever-reducing medication like Paracetamol. If symptoms persist beyond 3 days or worsen, visit a health facility.',
    },
    recommendedActions: [
      'Rest and maintain adequate fluid intake',
      'Use Paracetamol for fever or mild pain as directed',
      'Monitor symptoms — seek facility care if worsening or persisting >3 days',
    ],
    contraindications: ['Do not self-medicate with antibiotics without a prescription'],
  },
];

/**
 * Route text to the most relevant clinical domain module.
 */
export function routeClinicalDomain(text) {
  const lower = (text || '').toLowerCase();
  const domainScores = {};
  for (const chunk of KNOWLEDGE_BASE) {
    const score = chunk.keywords.reduce((acc, kw) => acc + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
    domainScores[chunk.domain] = (domainScores[chunk.domain] || 0) + score;
  }
  let bestDomain = 'general';
  let bestScore = 0;
  for (const [domain, score] of Object.entries(domainScores)) {
    if (score > bestScore) { bestScore = score; bestDomain = domain; }
  }
  return bestDomain;
}

/**
 * Retrieve the most relevant grounded knowledge chunk.
 * Returns { matchedChunk, citation, relevanceConfidence }.
 */
export function retrieveGroundedKnowledge(text, domain) {
  const lower = (text || '').toLowerCase();
  let bestChunk = null;
  let bestScore = 0;

  for (const chunk of KNOWLEDGE_BASE) {
    if (domain && chunk.domain !== domain && domain !== 'general') continue;
    const score = chunk.keywords.reduce((acc, kw) => acc + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; bestChunk = chunk; }
  }

  // Fallback to general if no match
  if (!bestChunk) bestChunk = KNOWLEDGE_BASE.find(c => c.chunkId === 'KB-GEN-001');

  const relevanceConfidence = bestScore > 0 ? Math.min(0.99, 0.85 + bestScore * 0.03) : 0.7;

  return {
    matchedChunk: bestChunk,
    citation: bestChunk ? {
      source: bestChunk.source.sourceName,
      title: bestChunk.source.documentTitle,
      version: bestChunk.source.version,
      url: bestChunk.source.uri,
    } : null,
    relevanceConfidence,
  };
}

/**
 * Detect Kenyan language from text (basic keyword heuristic).
 */
export function detectKenyanLanguage(text) {
  const lower = (text || '').toLowerCase();
  const markers = {
    sw: ['na', 'ya', 'kwa', 'ni', 'homa', 'kichwa', 'dalili', 'dawa', 'afya'],
    luo: ['odhi', 'puo', 'rem', 'ochweyo', 'koko'],
    ki: ['gutiri', 'kuhura', 'thakame', 'maita'],
  };
  let best = 'sw';
  let bestCount = 0;
  for (const [lang, words] of Object.entries(markers)) {
    const count = words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
    if (count > bestCount) { bestCount = count; best = lang; }
  }
  return best;
}