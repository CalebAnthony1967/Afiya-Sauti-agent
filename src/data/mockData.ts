/**
 * AfiyaSauti Mock Data Store & National Kenyan Healthcare Entities
 * Real counties, community health units, verified protocols, and realistic clinical records.
 */

import { CHPTask, ConsentRecord, KenyanLanguage, OutbreakSignal, SystemHealthMetrics, TriageSession } from '../types';

export interface CountyData {
  code: string;
  name: string;
  region: string;
  population: number;
  healthFacilities: number;
  activeCHPs: number;
  feverAnomalyRate: number; // relative to baseline (1.0 = normal)
  respiratoryAnomalyRate: number;
  alertLevel: 'NORMAL' | 'WARNING' | 'OUTBREAK_CONFIRMED';
  primarySyndrome: string;
}

export const KENYA_COUNTIES: CountyData[] = [
  { code: '047', name: 'Nairobi', region: 'Central', population: 4397073, healthFacilities: 614, activeCHPs: 4200, feverAnomalyRate: 1.15, respiratoryAnomalyRate: 1.82, alertLevel: 'WARNING', primarySyndrome: 'Acute Respiratory Infection' },
  { code: '001', name: 'Mombasa', region: 'Coast', population: 1208333, healthFacilities: 172, activeCHPs: 1450, feverAnomalyRate: 2.45, respiratoryAnomalyRate: 1.20, alertLevel: 'OUTBREAK_CONFIRMED', primarySyndrome: 'Dengue & Malaria' },
  { code: '042', name: 'Kisumu', region: 'Nyanza', population: 1155574, healthFacilities: 218, activeCHPs: 2300, feverAnomalyRate: 2.10, respiratoryAnomalyRate: 1.35, alertLevel: 'OUTBREAK_CONFIRMED', primarySyndrome: 'Plasmodium Falciparum Malaria' },
  { code: '032', name: 'Nakuru', region: 'Rift Valley', population: 2162202, healthFacilities: 320, activeCHPs: 3100, feverAnomalyRate: 0.98, respiratoryAnomalyRate: 1.10, alertLevel: 'NORMAL', primarySyndrome: 'None' },
  { code: '022', name: 'Kiambu', region: 'Central', population: 2417735, healthFacilities: 390, activeCHPs: 3400, feverAnomalyRate: 1.05, respiratoryAnomalyRate: 1.40, alertLevel: 'NORMAL', primarySyndrome: 'Influenza-like Illness' },
  { code: '037', name: 'Kakamega', region: 'Western', population: 1867579, healthFacilities: 240, activeCHPs: 2800, feverAnomalyRate: 1.78, respiratoryAnomalyRate: 1.25, alertLevel: 'WARNING', primarySyndrome: 'Pediatric Pneumonia / Malaria' },
  { code: '016', name: 'Machakos', region: 'Eastern', population: 1421932, healthFacilities: 210, activeCHPs: 1950, feverAnomalyRate: 0.92, respiratoryAnomalyRate: 1.05, alertLevel: 'NORMAL', primarySyndrome: 'None' },
  { code: '045', name: 'Kisii', region: 'South Nyanza', population: 1266860, healthFacilities: 195, activeCHPs: 2100, feverAnomalyRate: 1.30, respiratoryAnomalyRate: 1.15, alertLevel: 'NORMAL', primarySyndrome: 'None' },
  { code: '012', name: 'Meru', region: 'Eastern', population: 1545714, healthFacilities: 235, activeCHPs: 2200, feverAnomalyRate: 1.12, respiratoryAnomalyRate: 1.08, alertLevel: 'NORMAL', primarySyndrome: 'None' },
  { code: '027', name: 'Uasin Gishu', region: 'Rift Valley', population: 1163186, healthFacilities: 185, activeCHPs: 1800, feverAnomalyRate: 0.95, respiratoryAnomalyRate: 1.12, alertLevel: 'NORMAL', primarySyndrome: 'None' },
  { code: '003', name: 'Kilifi', region: 'Coast', population: 1453787, healthFacilities: 160, activeCHPs: 1750, feverAnomalyRate: 1.95, respiratoryAnomalyRate: 1.10, alertLevel: 'WARNING', primarySyndrome: 'Malaria' },
  { code: '023', name: 'Turkana', region: 'Rift Valley', population: 926976, healthFacilities: 125, activeCHPs: 1100, feverAnomalyRate: 1.85, respiratoryAnomalyRate: 1.45, alertLevel: 'WARNING', primarySyndrome: 'Severe Acute Malnutrition & Diarrhea' }
];

export const INITIAL_CHP_TASKS: CHPTask[] = [
  {
    taskId: 'TASK-CHP-081',
    chpId: 'CHP-NRB-WANJIKU-41',
    chpName: 'Faith Wanjiku (CHP Soweto East)',
    householdHash: 'dpa_hh_kbr_9941_salted',
    villageName: 'Soweto East, Kibera',
    subCounty: 'Langata / Kibra',
    priority: 'CRITICAL_RED_FLAG',
    reason: 'Ambient Radar Alert: Tachypnea (RR 39/min) in infant with chest indrawing report',
    recommendedAction: 'Immediate household visit with IMCI paediatric assessment kit and referral envelope',
    guidanceProtocol: 'Kenya Basic Paediatric Protocols & IMCI 5th Ed. Chapter 3',
    status: 'IN_PROGRESS',
    offlineCached: true,
    createdAt: new Date(Date.now() - 35 * 60000).toISOString()
  },
  {
    taskId: 'TASK-CHP-082',
    chpId: 'CHP-NRB-WANJIKU-41',
    chpName: 'Faith Wanjiku (CHP Soweto East)',
    householdHash: 'dpa_hh_kbr_7712_salted',
    villageName: 'Silanga Zone B',
    subCounty: 'Kibra',
    priority: 'URGENT',
    reason: 'Maternal care follow-up: 34 weeks gestation, skipped antenatal visit at Level 3 Center',
    recommendedAction: 'Verify blood pressure, check for ankle edema, encourage ANC attendance',
    guidanceProtocol: 'Kenya Obstetric Protocols Section 4.1',
    status: 'PENDING',
    offlineCached: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    taskId: 'TASK-CHP-083',
    chpId: 'CHP-NRB-WANJIKU-41',
    chpName: 'Faith Wanjiku (CHP Soweto East)',
    householdHash: 'dpa_hh_kbr_3301_salted',
    villageName: 'Lindi Zone 4',
    subCounty: 'Kibra',
    priority: 'ROUTINE',
    reason: 'Hypertension chronic regimen refill check & salt reduction counselling',
    recommendedAction: 'Confirm Amlodipine 5mg adherence, record 2 seated BP readings',
    guidanceProtocol: 'Kenya National Strategy for NCDs Clinical Protocol 2',
    status: 'COMPLETED',
    offlineCached: true,
    createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    notes: 'BP measured 134/82 mmHg. Patient confirms daily adherence. Advised on low sodium intake.'
  }
];

export const INITIAL_OUTBREAK_SIGNALS: OutbreakSignal[] = [
  {
    id: 'SIG-MOMBASA-01',
    countyCode: '001',
    countyName: 'Mombasa',
    subCounty: 'Nyali & Kisauni',
    syndrome: 'MALARIA_FEVER',
    caseCount7Days: 482,
    baselineExpected: 195,
    anomalyRatio: 2.47,
    alertLevel: 'OUTBREAK_CONFIRMED',
    sourceStreams: ['USSD *384# Triage', 'WhatsApp Ingestion', 'Coast General Level 5 Lab Reports'],
    mohProtocolRef: 'MoH Kenya Epidemic Preparedness Protocol EP-MAL-2024',
    detectedAt: new Date(Date.now() - 14 * 3600000).toISOString()
  },
  {
    id: 'SIG-NAIROBI-02',
    countyCode: '047',
    countyName: 'Nairobi',
    subCounty: 'Kibra & Mathare',
    syndrome: 'ACUTE_RESPIRATORY_INFECTION',
    caseCount7Days: 612,
    baselineExpected: 336,
    anomalyRatio: 1.82,
    alertLevel: 'WARNING',
    sourceStreams: ['Ambient Radar Edge Nodes', 'eCHIS Triage Feeds', 'Pumwani Outpatient Scribes'],
    mohProtocolRef: 'MoH National ARI Surveillance Guideline 2023',
    detectedAt: new Date(Date.now() - 8 * 3600000).toISOString()
  }
];

export const INITIAL_SYSTEM_METRICS: SystemHealthMetrics = {
  inferenceActive: true,
  gatewayKeyVersion: 'v2.4.1-202609-HSM',
  averageLatencyMs: 245,
  guardrailTriggerRate: 0.032, // 3.2%
  languageAccuracyScore: 0.984, // 98.4%
  meanModelEntropy: 0.184,
  confidenceDistribution: {
    high: 0.88, // 88% >= 0.85
    moderate: 0.09, // 9% 0.70-0.84
    uncertain: 0.03 // 3% < 0.70
  },
  populationStabilityIndexPSI: 0.042, // <0.10 indicates stable non-drifted distribution
  humanOverrideRate: 0.021, // 2.1%
  activeHouseholdsMonitored: 14820,
  totalTriageToday: 3290
};
