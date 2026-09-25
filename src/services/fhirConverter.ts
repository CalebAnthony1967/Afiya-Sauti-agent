/**
 * AfiyaSauti FHIR R4 Resource Converter
 * Standards compliant: HL7 FHIR Release 4 (R4)
 * Enables seamless interoperability with OpenHIM, KenyaEMR, eCHIS, and Right to Portability
 */

import { ConsentRecord, CryptographicAuditLog, EdgeTelemetryReading, TriageSession } from '../types';

export interface FHIRResource {
  resourceType: string;
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
  [key: string]: any;
}

/**
 * Converts Edge Telemetry Readings to standard FHIR R4 Observation
 */
export function telemetryToFHIRObservation(telemetry: EdgeTelemetryReading): FHIRResource {
  return {
    resourceType: 'Observation',
    id: `obs-${telemetry.readingId}`,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns'],
      lastUpdated: telemetry.timestamp
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '85353-1',
          display: 'Vital signs panel'
        }
      ],
      text: 'AfiyaSauti Ambient In-Home Radar & Acoustic Telemetry'
    },
    subject: {
      identifier: {
        system: 'urn:afiyasauti:household-hash',
        value: telemetry.householdId
      },
      display: 'Pseudonymised Kenyan Household'
    },
    effectiveDateTime: telemetry.timestamp,
    device: {
      display: `Edge Node ${telemetry.deviceId} (60GHz mmWave + 3-Mic Array)`
    },
    component: [
      {
        code: {
          coding: [{ system: 'http://loinc.org', code: '9279-1', display: 'Respiratory rate' }]
        },
        valueQuantity: {
          value: telemetry.respiratoryRate,
          unit: 'breaths/minute',
          system: 'http://unitsofmeasure.org',
          code: '/min'
        }
      },
      {
        code: {
          coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }]
        },
        valueQuantity: {
          value: telemetry.heartRate,
          unit: 'beats/minute',
          system: 'http://unitsofmeasure.org',
          code: '/min'
        }
      },
      {
        code: {
          coding: [{ system: 'urn:afiyasauti:codes', code: 'COUGH_RATE', display: 'Acoustic cough frequency' }]
        },
        valueQuantity: {
          value: telemetry.coughCount1Min,
          unit: 'coughs/minute',
          system: 'http://unitsofmeasure.org',
          code: '/min'
        }
      },
      {
        code: {
          coding: [{ system: 'urn:afiyasauti:codes', code: 'INFERENCE_CONFIDENCE', display: 'Edge inference confidence' }]
        },
        valueQuantity: {
          value: telemetry.confidenceScore,
          unit: 'score 0..1',
          system: 'http://unitsofmeasure.org',
          code: '1'
        }
      }
    ],
    extension: [
      {
        url: 'http://afiyasauti.moh.go.ke/fhir/StructureDefinition/entropy-score',
        valueDecimal: telemetry.inputEntropy
      },
      {
        url: 'http://afiyasauti.moh.go.ke/fhir/StructureDefinition/edge-status',
        valueString: telemetry.status
      }
    ]
  };
}

/**
 * Converts Triage Session & Draft SOAP Note to FHIR R4 DiagnosticReport
 */
export function triageToFHIRDiagnosticReport(session: TriageSession): FHIRResource {
  return {
    resourceType: 'DiagnosticReport',
    id: `diag-${session.sessionId}`,
    meta: {
      lastUpdated: session.createdAt
    },
    status: 'final',
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '11488-4',
          display: 'Consultation note'
        }
      ],
      text: `AfiyaSauti Multi-Channel Clinical Triage (${session.detectedDomain})`
    },
    subject: {
      identifier: {
        system: 'urn:afiyasauti:anonymized-hash',
        value: session.anonymizedHash
      },
      display: 'Consented De-identified Patient'
    },
    effectiveDateTime: session.createdAt,
    conclusion: session.groundedGuidance,
    conclusionCode: session.icd11Codes.map(c => ({
      coding: [
        {
          system: 'http://id.who.int/icd/release/11/mms',
          code: c.code,
          display: c.title
        }
      ]
    })),
    extension: [
      {
        url: 'http://afiyasauti.moh.go.ke/fhir/StructureDefinition/urgency-triage',
        valueCode: session.urgencyLevel
      },
      {
        url: 'http://afiyasauti.moh.go.ke/fhir/StructureDefinition/red-flag-emergency',
        valueBoolean: session.isRedFlag
      },
      {
        url: 'http://afiyasauti.moh.go.ke/fhir/StructureDefinition/citations',
        valueString: JSON.stringify(session.citations)
      },
      {
        url: 'http://afiyasauti.moh.go.ke/fhir/StructureDefinition/feature-attribution-weights',
        valueString: JSON.stringify(session.featureWeights)
      }
    ]
  };
}

/**
 * Converts Patient Consent to FHIR R4 Consent resource
 */
export function consentToFHIRConsent(consent: ConsentRecord): FHIRResource {
  return {
    resourceType: 'Consent',
    id: `consent-${consent.consentId}`,
    meta: {
      lastUpdated: consent.updatedAt
    },
    status: consent.consentState.toLowerCase(),
    scope: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/consentscope',
          code: 'patient-privacy',
          display: 'Privacy Consent'
        }
      ]
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'INFA',
            display: 'information access'
          }
        ]
      }
    ],
    patient: {
      identifier: {
        system: 'urn:afiyasauti:patient-hash',
        value: consent.anonymizedHash
      }
    },
    dateTime: consent.grantedAt,
    provision: {
      type: consent.consentState === 'ACTIVE' ? 'permit' : 'deny',
      purpose: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActReason',
          code: consent.purposeCode,
          display: consent.purposeCode
        }
      ]
    }
  };
}

/**
 * Converts Cryptographic Audit Log to FHIR R4 AuditEvent
 */
export function auditLogToFHIR(audit: CryptographicAuditLog): FHIRResource {
  return {
    resourceType: 'AuditEvent',
    id: `audit-${audit.auditId}`,
    recorded: audit.timestamp,
    type: {
      system: 'http://terminology.hl7.org/CodeSystem/audit-event-type',
      code: 'rest',
      display: 'RESTful Operation'
    },
    subtype: [
      {
        system: 'urn:afiyasauti:audit-action',
        code: audit.actionType,
        display: audit.actionType
      }
    ],
    action: audit.actionType.includes('LOGIN') ? 'E' : 'R',
    outcome: '0',
    outcomeDesc: `Cryptographic Signature: ${audit.signatureHash.substring(0, 16)}... Prev: ${audit.previousSignatureHash.substring(0, 16)}...`,
    agent: [
      {
        altId: audit.actorId,
        name: audit.actorId,
        requestor: true
      }
    ],
    entity: [
      {
        what: {
          reference: `${audit.resourceType}/${audit.resourceId}`
        },
        type: {
          system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
          code: '2',
          display: 'System Object'
        }
      }
    ]
  };
}

/**
 * Packages all patient resources into an exportable FHIR R4 Bundle (Right to Portability)
 */
export function createFHIRPortabilityBundle(
  patientHash: string,
  triageSessions: TriageSession[],
  telemetry: EdgeTelemetryReading[],
  consents: ConsentRecord[]
): FHIRResource {
  const entries: any[] = [];

  // Patient resource placeholder with pseudonymised identifier
  entries.push({
    fullUrl: `urn:uuid:pat-${patientHash.substring(0, 12)}`,
    resource: {
      resourceType: 'Patient',
      id: `pat-${patientHash.substring(0, 12)}`,
      identifier: [
        {
          system: 'urn:afiyasauti:dpa2019-hash',
          value: patientHash
        }
      ],
      active: true
    }
  });

  consents.forEach(c => {
    entries.push({
      fullUrl: `urn:uuid:consent-${c.consentId}`,
      resource: consentToFHIRConsent(c)
    });
  });

  triageSessions.forEach(s => {
    entries.push({
      fullUrl: `urn:uuid:diag-${s.sessionId}`,
      resource: triageToFHIRDiagnosticReport(s)
    });
  });

  telemetry.forEach(t => {
    entries.push({
      fullUrl: `urn:uuid:obs-${t.readingId}`,
      resource: telemetryToFHIRObservation(t)
    });
  });

  return {
    resourceType: 'Bundle',
    id: `bundle-portability-${patientHash.substring(0, 12)}`,
    type: 'collection',
    timestamp: new Date().toISOString(),
    total: entries.length,
    entry: entries
  };
}

export const generateFHIRDiagnosticReport = (params: {
  sessionId?: string;
  patientHash?: string;
  chiefComplaint?: string;
  urgency?: 'GREEN' | 'YELLOW' | 'RED';
  primaryProtocol?: string;
  icd11Codes?: Array<{ code: string; title: string }>;
  confidence?: number;
}) => {
  return triageToFHIRDiagnosticReport({
    sessionId: params.sessionId || 'SES-DEFAULT',
    anonymizedHash: params.patientHash || 'pat-anon-hash',
    channel: 'WHATSAPP',
    language: 'sw',
    rawInputSanitized: params.chiefComplaint || 'Consultation triage',
    detectedDomain: 'MNCH',
    symptomsReported: [params.chiefComplaint || ''],
    urgencyLevel: params.urgency || 'GREEN',
    isRedFlag: params.urgency === 'RED',
    icd11Codes: params.icd11Codes || [{ code: 'CA40', title: 'Pneumonia' }],
    groundedGuidance: params.primaryProtocol || 'Standard MoH Protocol',
    citations: [],
    featureWeights: [],
    confidenceScore: params.confidence || 0.95,
    entropyScore: 0.12,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });
};

export const generateFHIRConsent = consentToFHIRConsent;
