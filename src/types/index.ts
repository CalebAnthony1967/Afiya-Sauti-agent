/**
 * AfiyaSauti - Type Definitions
 * Single Source of Truth for Clinical Triage, Ambient Monitoring,
 * FHIR R4 Structures, Audit Trails, and System Telemetry.
 */

export type KenyanLanguage =
  | 'sw' // Kiswahili
  | 'en' // English
  | 'ki' // Kikuyu (Gĩkũyũ)
  | 'luo' // Dholuo
  | 'luy' // Luhya (Luluhya)
  | 'kal' // Kalenjin
  | 'kam' // Kamba (Kikamba)
  | 'gus' // Ekegusii (Kisii)
  | 'mer'; // Kimeru (Meru)

export interface LanguageMeta {
  code: KenyanLanguage;
  name: string;
  nativeName: string;
  region: string;
}

export type TriageUrgency = 'GREEN' | 'YELLOW' | 'RED';

export type ClinicalDomain =
  | 'MNCH' // Maternal, Newborn and Child Health
  | 'NCD' // Non-Communicable Diseases (Hypertension, Diabetes, Asthma, Sickle Cell)
  | 'INFECTIOUS' // Malaria, Tuberculosis, Cholera, Dengue, HIV
  | 'MENTAL_HEALTH' // Mental Health and Psychosocial Support
  | 'EMERGENCY'; // Emergency First-Response

export type SystemPortal =
  | 'patient'
  | 'family'
  | 'chp_field'
  | 'hospital_clinic'
  | 'ngo'
  | 'regional_admin'
  | 'moh_government'
  | 'research_epi'
  | 'insurance_payer'
  | 'training_sim'
  | 'community_intel'
  | 'admin'
  | 'super_admin'
  | 'developer'
  | 'ambient_node';

export interface UserProfile {
  id: string;
  anonymizedHash: string; // HMAC-SHA-256 salted hash
  role: SystemPortal;
  name?: string; // Stored securely only with explicit consent, never forwarded to external models
  phoneHash: string;
  countyCode: string;
  subCounty: string;
  communityUnitId: string;
  preferredLanguage: KenyanLanguage;
  consentGranted: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  createdAt: string;
}

export interface ConsentRecord {
  consentId: string;
  householdId: string;
  anonymizedHash: string;
  consentState: 'ACTIVE' | 'REVOKED' | 'PENDING';
  purposeCode: 'TRIAGE' | 'AMBIENT_MONITORING' | 'RESEARCH_ANONYMIZED' | 'CHP_DISPATCH' | 'THIRD_PARTY_PAYER';
  grantedAt: string;
  updatedAt: string;
  revocationHash?: string;
}

export interface GroundedCitation {
  sourceName: string;
  documentTitle: string;
  protocolSection: string;
  version: string;
  publicationYear: number;
  uri?: string;
  confidence: number;
}

export interface FeatureAttribution {
  featureName: string;
  weight: number; // e.g. 0.35 (35% influence)
  baselineNormal: string;
  observedValue: string | number;
  clinicalSignificance: string;
}

export interface TriageSession {
  sessionId: string;
  anonymizedHash: string;
  channel: 'WHATSAPP' | 'USSD' | 'IVR' | 'WEB' | 'EDGE_NODE';
  language: KenyanLanguage;
  rawInputSanitized: string;
  detectedDomain: ClinicalDomain;
  symptomsReported: string[];
  vitalSigns?: {
    respiratoryRate?: number;
    heartRate?: number;
    coughFrequency?: number;
    temperatureC?: number;
    spo2?: number;
  };
  urgencyLevel: TriageUrgency;
  isRedFlag: boolean;
  redFlagDetails?: {
    trigger: string;
    firstAidInstructions: string;
    chpDispatched: boolean;
    dispatchTimestamp: string;
  };
  icd11Codes: Array<{
    code: string;
    title: string;
  }>;
  groundedGuidance: string;
  citations: GroundedCitation[];
  featureWeights: FeatureAttribution[];
  confidenceScore: number;
  entropyScore: number;
  status: 'COMPLETED' | 'ESCALATED' | 'UNCERTAIN_EDGE_TRIAGE' | 'RED_FLAG_DISPATCHED';
  draftSoapNote?: ClinicalSOAPNote;
  createdAt: string;
}

export interface ClinicalSOAPNote {
  noteId: string;
  sessionId: string;
  patientHash: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd11Codes: Array<{ code: string; title: string }>;
  featureAttribution: FeatureAttribution[];
  citations: GroundedCitation[];
  clinicianReviewed: boolean;
  signedByClinicianId?: string;
  signatureHash?: string;
  signedAt?: string;
  locked: boolean;
}

export interface EdgeTelemetryReading {
  readingId: string;
  timestamp: string;
  householdId: string;
  deviceId: string;
  respiratoryRate: number;
  heartRate: number;
  coughCount1Min: number;
  ambientTempC: number;
  confidenceScore: number;
  inputEntropy: number;
  flaggedAnomaly: boolean;
  anomalyType?: 'TACHYPNEA' | 'BRADYCARDIA' | 'TACHYCARDIA' | 'COUGH_BURST' | 'IRREGULAR_RESPIRATION';
  privacyMicMuted: boolean;
  privacyRadarMuted: boolean;
  systemState: 'PASSIVE_MONITORING' | 'VOICE_ACTIVE' | 'MUTED' | 'ESCALATION';
  status: 'NORMAL' | 'ANOMALY_HIGH_CONFIDENCE' | 'UNCERTAIN_EDGE_TRIAGE';
}

export interface AmbientEdgeNodeState {
  nodeId: string;
  householdId: string;
  preferredLanguage: KenyanLanguage;
  micMuted: boolean;
  radarMuted: boolean;
  batteryPercent: number;
  nodeStatus: string;
  telemetry: {
    respiratoryRate: number;
    heartRate: number;
    coughCount24h: number;
    presenceDetected: boolean;
    lastReadingTime: string;
  };
}

export interface CryptographicAuditLog {
  auditId: number;
  timestamp: string;
  actorId: string;
  actionType:
    | 'USER_LOGIN'
    | 'LOGIN_FAILED'
    | 'DATA_ACCESS'
    | 'TRIAGE_EXECUTION'
    | 'AI_AGENT_INVOCATION'
    | 'GUARDRAIL_TRIGGER'
    | 'RED_FLAG_ESCALATION'
    | 'EDGE_ANOMALY_FORWARD'
    | 'SOAP_NOTE_SIGN'
    | 'ADMIN_CONFIG_CHANGE'
    | 'KEY_SHREDDING_ERASURE'
    | 'GATEWAY_KEY_ROTATION'
    | 'AI_INFERENCE_PAUSE';
  resourceType: 'PATIENT' | 'SESSION' | 'TELEMETRY' | 'SOAP_NOTE' | 'CONSENT' | 'SYSTEM' | 'SECURITY';
  resourceId: string;
  previousSignatureHash: string;
  signatureHash: string;
  payloadSnapshot: Record<string, any>;
  verificationStatus: 'VALID' | 'TAMPERED';
}

export interface CHPTask {
  taskId: string;
  chpId: string;
  chpName: string;
  householdHash: string;
  villageName: string;
  subCounty: string;
  priority: 'ROUTINE' | 'URGENT' | 'CRITICAL_RED_FLAG';
  reason: string;
  recommendedAction: string;
  guidanceProtocol: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ESCALATED';
  offlineCached: boolean;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface OutbreakSignal {
  id: string;
  countyCode: string;
  countyName: string;
  subCounty: string;
  syndrome: 'ACUTE_RESPIRATORY_INFECTION' | 'MALARIA_FEVER' | 'ACUTE_WATERY_DIARRHEA' | 'MEASLES_RASH';
  caseCount7Days: number;
  baselineExpected: number;
  anomalyRatio: number; // e.g. 2.4x baseline
  alertLevel: 'MONITOR' | 'WARNING' | 'OUTBREAK_CONFIRMED';
  sourceStreams: string[];
  detectedAt: string;
  mohProtocolRef: string;
}

export interface SystemHealthMetrics {
  inferenceActive: boolean;
  gatewayKeyVersion: string;
  averageLatencyMs: number;
  guardrailTriggerRate: number; // e.g. 3.2%
  languageAccuracyScore: number; // e.g. 98.4%
  meanModelEntropy: number; // e.g. 0.18
  confidenceDistribution: {
    high: number; // >= 0.85
    moderate: number; // 0.70 - 0.84
    uncertain: number; // < 0.70
  };
  populationStabilityIndexPSI: number; // e.g. 0.04 (< 0.10 is stable)
  humanOverrideRate: number; // e.g. 2.1%
  activeHouseholdsMonitored: number;
  totalTriageToday: number;
}
