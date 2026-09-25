/**
 * FHIR R4 Helpers — AfiyaSauti
 * Converts internal records to standard FHIR R4 resources.
 * Used for edge-to-cloud and inter-system exchanges.
 *
 * SUPABASE MIGRATION: These helpers are framework-agnostic. In Supabase,
 * consider a Postgres function or Edge Function for FHIR transformation
 * at the OpenHIM gateway layer.
 */

// Build FHIR R4 Observation (vital telemetry)
export function buildFhirObservation(telemetry) {
  return {
    resourceType: 'Observation',
    id: telemetry.telemetry_id,
    status: 'final',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
        code: 'vital-signs',
      }],
    }],
    subject: { reference: `Household/${telemetry.household_id}` },
    device: { reference: `Device/${telemetry.device_id}` },
    effectiveDateTime: telemetry.timestamp || new Date().toISOString(),
    component: [
      telemetry.respiratory_rate != null && {
        code: { coding: [{ system: 'http://loinc.org', code: '9279-1', display: 'Respiratory rate' }] },
        valueQuantity: { value: telemetry.respiratory_rate, unit: 'breaths/min' },
      },
      telemetry.heart_rate != null && {
        code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
        valueQuantity: { value: telemetry.heart_rate, unit: 'beats/min' },
      },
      telemetry.cough_count_1min != null && {
        code: { coding: [{ system: 'http://afiyaSauti.org/fhir', code: 'cough-count', display: 'Cough count (1 min)' }] },
        valueQuantity: { value: telemetry.cough_count_1min, unit: 'counts' },
      },
      telemetry.ambient_temp_c != null && {
        code: { coding: [{ system: 'http://loinc.org', code: '8310-5', display: 'Ambient temperature' }] },
        valueQuantity: { value: telemetry.ambient_temp_c, unit: 'C' },
      },
    ].filter(Boolean),
    extension: telemetry.confidence_score != null ? [{
      url: 'http://afiyaSauti.org/fhir/StructureDefinition/confidence-score',
      valueDecimal: telemetry.confidence_score,
    }] : undefined,
  };
}

// Build FHIR R4 DiagnosticReport (triage session)
export function buildFhirDiagnosticReport(session) {
  return {
    resourceType: 'DiagnosticReport',
    id: session.session_id,
    status: 'final',
    code: {
      coding: [{
        system: 'http://afiyaSauti.org/fhir',
        code: session.domain_module || 'general-triage',
        display: 'AfiyaSauti Triage Assessment',
      }],
    },
    subject: { reference: `Patient/${session.profile_id}` },
    effectiveDateTime: session.created_at || new Date().toISOString(),
    conclusion: session.ai_response || '',
    conclusionCode: {
      coding: (session.icd11_codes || []).map(code => ({
        system: 'http://hl7.org/fhir/sid/icd-11',
        code,
      })),
    },
    extension: [
      {
        url: 'http://afiyaSauti.org/fhir/StructureDefinition/urgency-level',
        valueString: session.urgency_level,
      },
      {
        url: 'http://afiyaSauti.org/fhir/StructureDefinition/red-flag',
        valueBoolean: session.red_flag_detected || false,
      },
      {
        url: 'http://afiyaSauti.org/fhir/StructureDefinition/feature-attribution',
        valueString: JSON.stringify(session.feature_weights || {}),
      },
    ],
  };
}

// Build FHIR R4 Consent
export function buildFhirConsent(consent) {
  return {
    resourceType: 'Consent',
    id: consent.consent_id,
    status: consent.consent_state === 'ACTIVE' ? 'active' : consent.consent_state === 'REVOKED' ? 'revoked' : 'draft',
    scope: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/consentscope', code: 'patient-privacy' }],
    },
    category: [{
      coding: [{ system: 'http://loinc.org', code: '59284-0', display: 'Consent' }],
    }],
    patient: { reference: `Patient/${consent.profile_id}` },
    dateTime: consent.granted_at || new Date().toISOString(),
    provision: {
      type: 'permit',
      purpose: [{ system: 'http://afiyaSauti.org/fhir/purpose', code: consent.purpose_code }],
    },
  };
}

// Build FHIR R4 AuditEvent
export function buildFhirAuditEvent(audit) {
  return {
    resourceType: 'AuditEvent',
    id: audit.audit_id,
    type: {
      code: audit.action_type,
      system: 'http://afiyaSauti.org/fhir/audit-action',
    },
    recorded: audit.timestamp || new Date().toISOString(),
    agent: [{
      who: { reference: `Practitioner/${audit.actor_id}` },
      role: [{ text: audit.actor_role }],
      requestor: true,
    }],
    source: { observer: { display: 'AfiyaSauti Platform' } },
    entity: [{
      what: { reference: `${audit.resource_type}/${audit.resource_id}` },
      signature: audit.signature_hash,
    }],
  };
}

// Build FHIR R4 Bundle (for export / portability)
export function buildFhirBundle(resources) {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: resources.map(resource => ({ resource })),
  };
}