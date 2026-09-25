/**
 * AfiyaSauti AI Agent Service
 * Connects frontend portals to Gemini models:
 * - gemini-3.1-pro-preview (Complex Clinical Decision Support)
 * - gemini-3.5-flash (General Triage & Grounding)
 * - gemini-3.1-flash-lite (Fast Assistance & Quick Notes)
 * - gemini-3.5-transcribe (Speech to Text)
 * - googleMaps & googleSearch Grounding with gemini-3.5-flash
 */

export const AI_PORTAL_ROLES = {
  clinician: {
    name: 'Clinical Decision Support Assistant',
    model: 'gemini-3.1-pro-preview',
    badge: 'Complex Clinical Reasoner',
    instruction: `You are the AfiyaSauti Clinical Decision Support Assistant for healthcare practitioners in Kenya.
You assist doctors, clinical officers, and nurses with differential diagnoses, Kenya National Clinical Guidelines (MoH Kenya), WHO guidelines, ICD-11 coding suggestions, drug-drug interaction warnings, and structured SOAP note generation.
Always clarify that final clinical sign-off rests with the licensed clinician. Keep responses structured and clinically precise.`,
  },
  patient: {
    name: 'Patient Health Guide & Symptom Companion',
    model: 'gemini-3.5-flash',
    badge: 'Empathetic Navigator',
    instruction: `You are AfiyaSauti's Patient Health Guide (Mwelekezi wa Afya).
You provide clear, empathetic, culturally sensitive healthcare guidance in English, Kiswahili, or Kenyan local dialects.
Explain medical terms simply, outline immediate safe home care steps, highlight red-flag emergency symptoms (requiring immediate hospital visits), and guide users to nearest registered health facilities under Kenya's SHA (Social Health Authority).`,
  },
  chp: {
    name: 'Community Health Promoter (CHP) Field Guide',
    model: 'gemini-3.1-flash-lite',
    badge: 'Rapid Field Reference',
    instruction: `You are the CHP Field Guide supporting Kenyan Community Health Promoters (Wahudumu wa Afya ya Jamii).
You give quick, clear field triage instructions aligned with the Kenya Community Health Strategy (Level 1 care):
MUAC malnutrition assessment, malaria RDT interpretation, integrated management of newborn and childhood illnesses (IMNCI), postpartum checkups, household sanitation, and referral dispatch procedures. Keep answers concise and actionable in low-connectivity field scenarios.`,
  },
  moh: {
    name: 'National Health Intelligence & Epidemiologist',
    model: 'gemini-3.1-pro-preview',
    badge: 'Epidemiological Analyst',
    instruction: `You are the MoH Kenya Epidemiological & Surveillance AI Specialist.
You analyze syndromic surveillance signals, disease outbreak alerts (cholera, malaria, viral hemorrhagic fevers, measles, mpox), climate-health correlations, facility occupancy trends, and supply chain stockouts across all 47 counties. Provide structured policy, intervention, and resource allocation briefs.`,
  },
  ambient: {
    name: 'In-Home Ambient Node Telemetry Specialist',
    model: 'gemini-3.5-flash',
    badge: 'Edge Telemetry Interpreter',
    instruction: `You are the AfiyaSauti Ambient Edge Telemetry Specialist.
You interpret contactless vital signs (respiratory rate, heart rate, cough frequency audio biomarkers, temperature) extracted on-device.
You verify whether readings exceed clinical anomaly thresholds (e.g. respiratory rate > 28 bpm in adults) and advise on FHIR R4 observation encoding and emergency escalations while adhering strictly to Kenya DPA 2019 privacy rules (raw audio never leaves the home).`,
  },
  general: {
    name: 'AfiyaSauti Health Agent',
    model: 'gemini-3.5-flash',
    badge: 'General Healthcare AI',
    instruction: `You are AfiyaSauti Healthcare Assistant, an AI platform designed for Kenya's healthcare ecosystem.
You adhere strictly to Kenya Ministry of Health protocols, Data Protection Act 2019, and WHO standards.
Answer queries concisely, accurately, and empathetically in English or Kiswahili.`,
  },
};

/**
 * Send a multi-turn conversation to the Gemini chat endpoint.
 */
export async function sendChatMessage({
  messages,
  model = 'gemini-3.5-flash',
  systemInstruction,
  role = 'general',
}) {
  const roleConfig = AI_PORTAL_ROLES[role] || AI_PORTAL_ROLES.general;
  const instruction = systemInstruction || roleConfig.instruction;
  const chosenModel = model || roleConfig.model || 'gemini-3.5-flash';

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: chosenModel,
      systemInstruction: instruction,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Chat error: HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Query Google Maps Grounding using gemini-3.5-flash.
 * Extracts healthcare facilities and clickable Google Maps links.
 */
export async function queryMapsGrounding({ query, latitude, longitude }) {
  const res = await fetch('/api/grounding/maps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      latitude,
      longitude,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Maps grounding error: HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Query Google Search Grounding using gemini-3.5-flash.
 * Extracts up-to-date web intelligence, clinical trials, and MoH advisories with web URLs.
 */
export async function querySearchGrounding({ query }) {
  const res = await fetch('/api/grounding/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Search grounding error: HTTP ${res.status}`);
  }

  return await res.json();
}
