/**
 * AfiyaSauti Comprehensive Clinical Safety, Cryptographic Audit & FHIR Test Suite
 * Executed with: npm test (tsx test/systemTests.ts)
 */

import { executeClinicalTriage } from '../src/services/channels';
import {
  appendAuditLog,
  detectRedFlags,
  evaluateInferenceSafety,
  getAuditChain,
  hmacSha256,
  sanitizeInputForModel,
  sha256,
  shredCryptographicSalt,
  verifyAuditChainIntegrity
} from '../src/services/safety';
import {
  createFHIRPortabilityBundle,
  generateFHIRDiagnosticReport,
  telemetryToFHIRObservation
} from '../src/services/fhirConverter';
import { edgeSimulator } from '../src/services/edgeSimulator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✔ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✖ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('   AfiyaSauti Production Safety & Compliance Tests    ');
  console.log('   Jurisdiction: Republic of Kenya (DPA 2019 / DHA 2023)');
  console.log('======================================================\n');

  // Test Suite 1: Clinical Safety & Red Flag Detection
  console.log('1. Clinical Safety & Emergency Triage Tests:');
  const pediatricDanger = detectRedFlags(
    'infant cannot breastfeed, severe chest indrawing, stridor at rest'
  );
  assert(pediatricDanger.isRedFlag, 'IMCI Pediatric danger signs trigger immediate RED flag');
  assert(pediatricDanger.immediateActions.length > 0, 'First-aid emergency guidance is provided');

  const normalSymptom = detectRedFlags('mild runny nose without cough');
  assert(!normalSymptom.isRedFlag, 'Mild non-critical symptoms do NOT trigger emergency dispatch');

  // Test Suite 2: Edge Confidence & Entropy Gating (<0.85 or >0.35 -> UNCERTAIN_EDGE_TRIAGE)
  console.log('\n2. Edge Gating (Confidence & Entropy) Tests:');
  const safeInference = evaluateInferenceSafety(0.92, 0.15);
  assert(safeInference.isSafe, 'Confidence 0.92 & Entropy 0.15 passes edge safety gate');

  const lowConfidence = evaluateInferenceSafety(0.78, 0.18);
  assert(!lowConfidence.isSafe, 'Confidence 0.78 (< 0.85 threshold) marked as UNCERTAIN');

  const highEntropy = evaluateInferenceSafety(0.90, 0.42);
  assert(!highEntropy.isSafe, 'Entropy 0.42 (> 0.35 threshold) marked as UNCERTAIN');

  const testReading = edgeSimulator.generateReading('UNCERTAIN_NOISE');
  assert(
    testReading.status === 'UNCERTAIN_EDGE_TRIAGE',
    'Simulated sensor noise correctly flags status as UNCERTAIN_EDGE_TRIAGE'
  );

  // Test Suite 3: PII De-Identification & HMAC Salt Hashing (Kenya DPA 2019)
  console.log('\n3. Privacy & PII Sanitization Tests:');
  const rawPIIText = 'Jina langu ni Wanjiku Kamau nambari ya simu ni 0712345678 na ID 12345678';
  const { sanitized, redactedEntities } = sanitizeInputForModel(rawPIIText);
  assert(!sanitized.includes('0712345678'), 'Phone number is stripped before model ingestion');
  assert(!sanitized.includes('12345678'), 'National ID number is stripped before model ingestion');
  assert(redactedEntities.length >= 2, 'Redacted entities properly registered in audit metadata');

  const hashed1 = await hmacSha256('+254712345678');
  const hashed2 = await hmacSha256('+254712345678');
  assert(hashed1 === hashed2, 'HMAC-SHA-256 salted hashing is deterministic for identical phone number');
  assert(hashed1.length === 64, 'Output hash is 256-bit hexadecimal string');

  // Test Suite 4: Cryptographic Audit Trail & Merkle Chaining
  console.log('\n4. Cryptographic Tamper-Evident Audit Chain Tests:');
  await appendAuditLog({
    actorId: 'TEST_CHP_WORKER',
    actionType: 'USER_LOGIN',
    resourceType: 'SYSTEM',
    resourceId: 'LOGIN_GATEWAY',
    payloadSnapshot: { method: 'USSD_PIN' }
  });

  await appendAuditLog({
    actorId: 'TEST_CLINICIAN',
    actionType: 'SOAP_NOTE_SIGN',
    resourceType: 'SOAP_NOTE',
    resourceId: 'NOTE-TEST-001',
    payloadSnapshot: { test: true }
  });

  const chainVerification = await verifyAuditChainIntegrity();
  assert(chainVerification.isValid, 'Audit chain sequential previousSignatureHash verification passes');
  assert(chainVerification.totalRecords >= 2, 'Multiple audit records chained together');

  // Test Suite 5: Key Shredding & Right to Erasure
  console.log('\n5. Cryptographic Salt Shredding (Right to Erasure) Tests:');
  const shred = shredCryptographicSalt();
  assert(Boolean(shred.newSaltHash), 'Cryptographic salt successfully overwritten with cryptographic random bytes');

  // Test Suite 6: HL7 FHIR R4 Output & Standards Compliance
  console.log('\n6. HL7 FHIR R4 Interoperability Tests:');
  const fhirObs = telemetryToFHIRObservation(edgeSimulator.generateReading('NORMAL'));
  assert(fhirObs.resourceType === 'Observation', 'Telemetry generates FHIR R4 Observation resource');
  assert(fhirObs.code?.coding?.[0]?.system === 'http://loinc.org', 'Observation uses LOINC standardized terminology');

  const fhirDiag = generateFHIRDiagnosticReport({
    sessionId: 'SES-TEST',
    chiefComplaint: 'Pediatric cough and tachypnea',
    urgency: 'YELLOW',
    primaryProtocol: 'IMCI Chapter 3'
  });
  assert(fhirDiag.resourceType === 'DiagnosticReport', 'Triage generates FHIR R4 DiagnosticReport resource');

  const bundle = createFHIRPortabilityBundle('patient-hash-test', [], [], []);
  assert(bundle.resourceType === 'Bundle', 'Portability export generates valid FHIR R4 Bundle');

  // Summary
  console.log('\n======================================================');
  console.log(`   Tests Completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All AfiyaSauti compliance tests passed cleanly!\n');
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
