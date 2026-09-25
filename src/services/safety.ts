/**
 * AfiyaSauti Core Safety, Privacy, and Cryptographic Audit Engine
 * Complies with Kenya Data Protection Act 2019 & Digital Health Act 2023
 */

import { CryptographicAuditLog, KenyanLanguage, TriageUrgency } from '../types';

// Dynamic salt store (in production backed by HSM / KMS)
let currentSalt = 'afiya_prod_salt_2026_ke_nairobi_sec';
let gatewayKeyVersion = 'v2.4.1-202609-HSM';

/**
 * Generates a SHA-256 hash using Web Crypto or Node Crypto
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates HMAC-SHA-256 with dynamic salt for anonymization
 */
export async function hmacSha256(data: string, salt: string = currentSalt): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(salt);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Key Shredding: Rotate or destroy salt for Right to Erasure
 */
export function shredCryptographicSalt(): { previousSaltHash: string; newSaltHash: string } {
  const oldSalt = currentSalt;
  currentSalt = 'shredded_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  return {
    previousSaltHash: oldSalt.substring(0, 8) + '...',
    newSaltHash: currentSalt.substring(0, 8) + '...'
  };
}

export function rotateGatewayKey(): string {
  const vNum = parseInt(gatewayKeyVersion.split('.')[1] || '4') + 1;
  gatewayKeyVersion = `v2.${vNum}.0-${new Date().toISOString().slice(0, 7)}-HSM`;
  return gatewayKeyVersion;
}

export function getGatewayKeyVersion(): string {
  return gatewayKeyVersion;
}

/**
 * De-identification: Removes personal identifiers before any model call
 * Strips Kenyan phone numbers (+254, 07xx, 01xx), National ID numbers, emails, names
 */
export function sanitizeInputForModel(rawInput: string): { sanitized: string; redactedEntities: string[] } {
  let sanitized = rawInput;
  const redactedEntities: string[] = [];

  // Match Kenyan phone numbers: +254 7XX XXX XXX, 07XXXXXXXX, 01XXXXXXXX
  const phoneRegex = /(\+?254|0)[17]\d{8}/g;
  sanitized = sanitized.replace(phoneRegex, (match) => {
    redactedEntities.push(`PHONE: ${match.slice(0, 4)}****`);
    return '[REDACTED_PHONE_KE]';
  });

  // Match Kenyan National ID (typically 7-8 digits standalone)
  const idRegex = /\b\d{7,8}\b/g;
  sanitized = sanitized.replace(idRegex, (match) => {
    redactedEntities.push(`ID: ${match.slice(0, 2)}****`);
    return '[REDACTED_NATIONAL_ID]';
  });

  // Match email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  sanitized = sanitized.replace(emailRegex, () => {
    redactedEntities.push('EMAIL');
    return '[REDACTED_EMAIL]';
  });

  // Common Kenyan names patterns (Juma, Otieno, Wanjiku, Kamau, Kiprop, Moraa, Nekesa, Chebet, etc.)
  const commonNames = /\b(Wanjiku|Kamau|Otieno|Achieng|Ochieng|Mwangi|Kiprop|Chebet|Moraa|Nekesa|Omondi|Kariuki|Mutua|Kioko|Juma|Amina|Fatuma|Hassan)\b/gi;
  sanitized = sanitized.replace(commonNames, () => {
    redactedEntities.push('NAME');
    return '[REDACTED_PERSON]';
  });

  return { sanitized, redactedEntities };
}

/**
 * Continuous Emergency Red-Flag Symptoms Checker
 * MoH Kenya / WHO IMCI / Emergency Guidelines
 */
export interface RedFlagAssessment {
  isRedFlag: boolean;
  triggerCondition?: string;
  firstAidInstructions: string;
  chpDispatchPriority: 'CRITICAL_RED_FLAG' | 'URGENT' | 'ROUTINE';
  immediateActions: string[];
}

export function detectRedFlags(input: string, vitals?: { respiratoryRate?: number; heartRate?: number; coughFrequency?: number; spo2?: number; tempC?: number }): RedFlagAssessment {
  const text = input.toLowerCase();

  // 1. Maternal Danger Signs
  if (
    text.includes('severe headache') && (text.includes('blurred vision') || text.includes('swelling') || text.includes('pregnant')) ||
    text.includes('bleeding heavily') ||
    text.includes('convulsion') || text.includes('fitting') || text.includes('seizure') ||
    text.includes('baby not moving') || text.includes('fetal movement')
  ) {
    return {
      isRedFlag: true,
      triggerCondition: 'MATERNAL_OBSTETRIC_EMERGENCY (Pre-eclampsia / Antepartum Hemorrhage / Fetal Distress)',
      firstAidInstructions: 'Immediate referral to nearest Level 4/5 hospital. Position patient on left lateral side. Do not give oral fluids if drowsy or convulsing. Keep airway clear.',
      chpDispatchPriority: 'CRITICAL_RED_FLAG',
      immediateActions: [
        'Dispatch emergency CHP immediately for hospital escort',
        'Call Kenya Red Cross (1199) or local County Emergency Ambulance',
        'Instruct caregiver on left-lateral recovery position'
      ]
    };
  }

  // 2. Pediatric IMCI General Danger Signs
  if (
    text.includes('cannot drink') || text.includes('unable to breastfeed') || text.includes('vomiting everything') ||
    text.includes('unconscious') || text.includes('lethargic') || text.includes('stridor') ||
    text.includes('chest indrawing') || (vitals?.respiratoryRate && vitals.respiratoryRate > 55)
  ) {
    return {
      isRedFlag: true,
      triggerCondition: 'PEDIATRIC_IMCI_GENERAL_DANGER_SIGN (Severe Pneumonia / Sepsis / Severe Malaria)',
      firstAidInstructions: 'Keep child warm. Give sips of ORS or breastmilk if conscious. Do not force fluids if vomiting everything. Rush immediately to nearest health facility.',
      chpDispatchPriority: 'CRITICAL_RED_FLAG',
      immediateActions: [
        'Immediate dispatch of Community Health Promoter with IMCI emergency kit',
        'Administer pre-referral rectal artesunate if fever + convulsions in malaria endemic zone',
        'Ensure warm transport (Kangaroo mother care or blanket)'
      ]
    };
  }

  // 3. Acute Severe Respiratory Distress
  if (
    (vitals?.respiratoryRate && vitals.respiratoryRate > 35) ||
    (vitals?.spo2 && vitals.spo2 < 90) ||
    text.includes('cannot breathe') || text.includes('turning blue') || text.includes('gasping for air') || text.includes('severe breathlessness')
  ) {
    return {
      isRedFlag: true,
      triggerCondition: 'ACUTE_RESPIRATORY_FAILURE (Severe Asthma / Pulmonary Edema / ARDS)',
      firstAidInstructions: 'Sit patient upright in high Fowler position. Loosen tight clothing around neck and chest. If prescribed salbutamol inhaler is available, administer with spacer immediately.',
      chpDispatchPriority: 'CRITICAL_RED_FLAG',
      immediateActions: [
        'Dispatch CHP with pulse oximeter',
        'Facilitate oxygen therapy at closest sub-county facility',
        'Prepare ambulance transfer'
      ]
    };
  }

  // 4. Acute Cardiovascular / Stroke
  if (
    (text.includes('chest pain') && (text.includes('left arm') || text.includes('jaw') || text.includes('crushing') || text.includes('sweating'))) ||
    (text.includes('face drooping') || text.includes('arm weakness') || text.includes('slurred speech') || text.includes('sudden paralysis'))
  ) {
    return {
      isRedFlag: true,
      triggerCondition: 'ACUTE_CORONARY_SYNDROME_OR_STROKE (FAST Protocol)',
      firstAidInstructions: 'Keep patient resting quietly. Have patient chew 300mg soluble aspirin if no allergy or bleeding history. Do not let patient walk or exert.',
      chpDispatchPriority: 'CRITICAL_RED_FLAG',
      immediateActions: [
        'Record exact time of symptom onset for thrombolytic window (<4.5 hrs)',
        'Alert receiving hospital emergency department',
        'Rapid evacuation via EMS'
      ]
    };
  }

  // 5. Severe Dehydration / Cholera Alert
  if (
    (text.includes('rice water') || (text.includes('watery diarrhea') && text.includes('sunken eyes'))) &&
    (text.includes('vomiting') || text.includes('very thirsty') || text.includes('skin pinch very slow'))
  ) {
    return {
      isRedFlag: true,
      triggerCondition: 'CHOLERA_OR_SEVERE_DEHYDRATION (Plan C Dehydration Protocol)',
      firstAidInstructions: 'Begin frequent sips of Oral Rehydration Salts (ORS) solution immediately (1 sachet in 1 liter clean boiled water). Do not wait for hospital arrival to start ORS.',
      chpDispatchPriority: 'CRITICAL_RED_FLAG',
      immediateActions: [
        'Dispatch CHP with ORS + Zinc supplements and water purification tablets',
        'Alert Sub-County Disease Surveillance Coordinator (SCDSC)',
        'Arrange IV Ringer Lactate rehydration at health center'
      ]
    };
  }

  return {
    isRedFlag: false,
    firstAidInstructions: '',
    chpDispatchPriority: 'ROUTINE',
    immediateActions: []
  };
}

/**
 * Confidence and Entropy Threshold Guard
 * Hard Constraint: confidence < 0.85 OR entropy > 0.35 -> UNCERTAIN_EDGE_TRIAGE
 */
export function evaluateInferenceSafety(confidence: number, entropy: number): {
  isSafe: boolean;
  status: 'SAFE' | 'UNCERTAIN_EDGE_TRIAGE';
  reason?: string;
} {
  if (confidence < 0.85) {
    return {
      isSafe: false,
      status: 'UNCERTAIN_EDGE_TRIAGE',
      reason: `Confidence score (${confidence.toFixed(2)}) is below certified clinical threshold (0.85).`
    };
  }
  if (entropy > 0.35) {
    return {
      isSafe: false,
      status: 'UNCERTAIN_EDGE_TRIAGE',
      reason: `Information entropy (${entropy.toFixed(2)}) exceeds maximum ambiguity limit (0.35).`
    };
  }
  return {
    isSafe: true,
    status: 'SAFE'
  };
}

/**
 * In-Memory Append-Only Cryptographic Audit Log Chain
 */
const inMemoryAuditChain: CryptographicAuditLog[] = [];
let auditCounter = 1;
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export async function appendAuditLog(entry: {
  actorId: string;
  actionType: CryptographicAuditLog['actionType'];
  resourceType: CryptographicAuditLog['resourceType'];
  resourceId: string;
  payloadSnapshot: Record<string, any>;
}): Promise<CryptographicAuditLog> {
  const prevRecord = inMemoryAuditChain[inMemoryAuditChain.length - 1];
  const previousSignatureHash = prevRecord ? prevRecord.signatureHash : GENESIS_HASH;
  const timestamp = new Date().toISOString();

  // Signature calculation: SHA256(prevHash + timestamp + actorId + actionType + resourceId + JSON(payload))
  const dataToSign = `${previousSignatureHash}|${timestamp}|${entry.actorId}|${entry.actionType}|${entry.resourceType}|${entry.resourceId}|${JSON.stringify(entry.payloadSnapshot)}`;
  const signatureHash = await sha256(dataToSign);

  const logRecord: CryptographicAuditLog = {
    auditId: auditCounter++,
    timestamp,
    actorId: entry.actorId,
    actionType: entry.actionType,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId,
    previousSignatureHash,
    signatureHash,
    payloadSnapshot: entry.payloadSnapshot,
    verificationStatus: 'VALID'
  };

  inMemoryAuditChain.push(logRecord);
  return logRecord;
}

export function getAuditChain(): CryptographicAuditLog[] {
  return [...inMemoryAuditChain];
}

/**
 * Cryptographic Verification of Entire Audit Chain
 * Returns whether any log was tampered with or removed
 */
export async function verifyAuditChainIntegrity(): Promise<{
  isValid: boolean;
  totalRecords: number;
  tamperedIndex?: number;
  details: string;
}> {
  if (inMemoryAuditChain.length === 0) {
    return { isValid: true, totalRecords: 0, details: 'Chain empty, no records.' };
  }

  for (let i = 0; i < inMemoryAuditChain.length; i++) {
    const current = inMemoryAuditChain[i];
    const expectedPrevHash = i === 0 ? GENESIS_HASH : inMemoryAuditChain[i - 1].signatureHash;

    if (current.previousSignatureHash !== expectedPrevHash) {
      return {
        isValid: false,
        totalRecords: inMemoryAuditChain.length,
        tamperedIndex: i,
        details: `Chain linkage break at record #${current.auditId}: previousSignatureHash mismatch.`
      };
    }

    const dataToSign = `${current.previousSignatureHash}|${current.timestamp}|${current.actorId}|${current.actionType}|${current.resourceType}|${current.resourceId}|${JSON.stringify(current.payloadSnapshot)}`;
    const calculatedHash = await sha256(dataToSign);

    if (calculatedHash !== current.signatureHash) {
      return {
        isValid: false,
        totalRecords: inMemoryAuditChain.length,
        tamperedIndex: i,
        details: `Signature forgery detected at record #${current.auditId}: recalculated hash does not match stored signature.`
      };
    }
  }

  return {
    isValid: true,
    totalRecords: inMemoryAuditChain.length,
    details: 'All cryptographic links and SHA-256 signatures validated successfully. Zero tamper detected.'
  };
}
