/**
 * AfiyaSauti In-Home Ambient Monitoring Edge Simulator
 * Hardware: Simulated 60 GHz FMCW mmWave Radar + 3-Mic Far-Field Beamforming Acoustic Array
 * Runs local inference, privacy mutes, confidence/entropy gate, and local vernacular alerts.
 */

import { EdgeTelemetryReading, KenyanLanguage } from '../types';
import { evaluateInferenceSafety } from './safety';

export interface EdgeDeviceConfig {
  deviceId: string;
  householdId: string;
  localLanguage: KenyanLanguage;
  micMuted: boolean;
  radarMuted: boolean;
  systemState: 'PASSIVE_MONITORING' | 'VOICE_ACTIVE' | 'MUTED' | 'ESCALATION';
}

export class EdgeNodeSimulator {
  private config: EdgeDeviceConfig;
  private timer: any = null;
  private listeners: ((reading: EdgeTelemetryReading) => void)[] = [];

  constructor(config?: Partial<EdgeDeviceConfig>) {
    this.config = {
      deviceId: config?.deviceId || 'EDGE-NRB-7740',
      householdId: config?.householdId || 'HH-KIBERA-SEC-41',
      localLanguage: config?.localLanguage || 'sw',
      micMuted: config?.micMuted ?? false,
      radarMuted: config?.radarMuted ?? false,
      systemState: 'PASSIVE_MONITORING'
    };
  }

  public getConfig(): EdgeDeviceConfig {
    return { ...this.config };
  }

  public setMicMute(muted: boolean): void {
    this.config.micMuted = muted;
    this.updateSystemState();
  }

  public setRadarMute(muted: boolean): void {
    this.config.radarMuted = muted;
    this.updateSystemState();
  }

  public setLanguage(lang: KenyanLanguage): void {
    this.config.localLanguage = lang;
  }

  private updateSystemState(): void {
    if (this.config.micMuted && this.config.radarMuted) {
      this.config.systemState = 'MUTED';
    } else {
      this.config.systemState = 'PASSIVE_MONITORING';
    }
  }

  /**
   * Generates a realistic telemetry frame based on physiological parameters
   */
  public generateReading(anomalyPreset?: 'TACHYPNEA' | 'COUGH_BURST' | 'UNCERTAIN_NOISE' | 'NORMAL'): EdgeTelemetryReading {
    const timestamp = new Date().toISOString();
    const readingId = `RDG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    if (this.config.systemState === 'MUTED') {
      return {
        readingId,
        timestamp,
        householdId: this.config.householdId,
        deviceId: this.config.deviceId,
        respiratoryRate: 0,
        heartRate: 0,
        coughCount1Min: 0,
        ambientTempC: 22.5,
        confidenceScore: 1.0,
        inputEntropy: 0.0,
        flaggedAnomaly: false,
        privacyMicMuted: true,
        privacyRadarMuted: true,
        systemState: 'MUTED',
        status: 'NORMAL'
      };
    }

    let rr = 18 + (Math.random() * 4 - 2); // default normal 16-20
    let hr = 72 + (Math.random() * 8 - 4); // default normal 68-76
    let coughs = Math.random() < 0.15 ? 1 : 0;
    let confidence = 0.94 - Math.random() * 0.05;
    let entropy = 0.12 + Math.random() * 0.08;
    let flaggedAnomaly = false;
    let anomalyType: EdgeTelemetryReading['anomalyType'] | undefined = undefined;

    if (anomalyPreset === 'TACHYPNEA') {
      rr = 38 + (Math.random() * 6 - 3); // High pediatric or adult tachypnea
      hr = 108 + (Math.random() * 10);
      coughs = 3;
      flaggedAnomaly = true;
      anomalyType = 'TACHYPNEA';
      confidence = 0.92;
      entropy = 0.18;
    } else if (anomalyPreset === 'COUGH_BURST') {
      coughs = 7 + Math.floor(Math.random() * 4);
      rr = 26;
      flaggedAnomaly = true;
      anomalyType = 'COUGH_BURST';
      confidence = 0.89;
      entropy = 0.22;
    } else if (anomalyPreset === 'UNCERTAIN_NOISE') {
      // Intentionally low confidence / high entropy to test UNCERTAIN_EDGE_TRIAGE gate
      confidence = 0.72; // Below 0.85
      entropy = 0.44; // Above 0.35
      flaggedAnomaly = true;
      anomalyType = 'IRREGULAR_RESPIRATION';
      rr = 29;
    }

    // Hardware mute overrides
    if (this.config.radarMuted) {
      rr = 0;
      hr = 0;
    }
    if (this.config.micMuted) {
      coughs = 0;
    }

    const safetyCheck = evaluateInferenceSafety(confidence, entropy);
    const status: EdgeTelemetryReading['status'] = !safetyCheck.isSafe
      ? 'UNCERTAIN_EDGE_TRIAGE'
      : flaggedAnomaly
      ? 'ANOMALY_HIGH_CONFIDENCE'
      : 'NORMAL';

    return {
      readingId,
      timestamp,
      householdId: this.config.householdId,
      deviceId: this.config.deviceId,
      respiratoryRate: parseFloat(rr.toFixed(1)),
      heartRate: parseFloat(hr.toFixed(1)),
      coughCount1Min: coughs,
      ambientTempC: 23.4,
      confidenceScore: parseFloat(confidence.toFixed(2)),
      inputEntropy: parseFloat(entropy.toFixed(2)),
      flaggedAnomaly,
      anomalyType,
      privacyMicMuted: this.config.micMuted,
      privacyRadarMuted: this.config.radarMuted,
      systemState: status === 'ANOMALY_HIGH_CONFIDENCE' ? 'ESCALATION' : this.config.systemState,
      status
    };
  }

  /**
   * Vernacular Voice Alert strings for local device speaker
   */
  public getLocalVernacularAlert(anomalyType: string): string {
    const lang = this.config.localLanguage;
    const alerts: Record<KenyanLanguage, string> = {
      sw: 'Tahadhari ya AfiyaSauti: Mfumo umegundua kupumua kwa kasi na kukohoa mara kwa mara. Tafadhali pumzika na uwasiliane na mhudumu wa afya wa jamii (CHP).',
      en: 'AfiyaSauti Alert: Fast breathing and frequent cough detected. Please rest and contact your Community Health Promoter (CHP).',
      ki: 'Mũkaana wa AfiyaSauti: Nĩtwona mĩhũmũ ya kũhũha na kũkorora mũno. Hurũka na wĩte mwarimũ wa ũgima wa mwĩrĩ (CHP).',
      luo: 'Koko mar AfiyaSauti: Muma oyudo yueyo matek gi nyuok mang\'eny. Yie iywe kendo iluong jachiw kony mar ngima (CHP).',
      luy: 'AfiyaSauti Indasio: Omubiri kulolekhele khukhuma amabeka nende khukholola. Khwitsilile khupumule oye omurambi we bilwale (CHP).',
      kal: 'Kanyalilisyetab AfiyaSauti: Kekas kasesutab korosto ak kootik che chang\'. Itegeeny ak ikuut chito nebo kalyet (CHP).',
      kam: 'Mukano wa AfiyaSauti: Kwoneka kuveva muki na kukolola kwingi. No nginya uthumue na utavie mundu wa uima wa mwii (CHP).',
      gus: 'Eng\'ana ya AfiyaSauti: Tokanyora ogosika kwo obwoya n\'ogokorora gokong\'u. Sasimoka erio orore omwimanyi bwo oborwaire (CHP).',
      mer: 'Mũkaana jwa AfiyaSauti: Twona kũũmĩa kwa mĩhũmũ na gĩkororo kĩingĩ. Hurũka na wĩte mũtetheria wa ũgima bwa mwĩrĩ (CHP).'
    };

    return alerts[lang] || alerts.sw;
  }

  // Interactive UI helpers
  public getState() {
    const reading = this.generateReading();
    return {
      nodeId: this.config.deviceId,
      householdId: this.config.householdId,
      preferredLanguage: this.config.localLanguage,
      micMuted: this.config.micMuted,
      radarMuted: this.config.radarMuted,
      batteryPercent: 88,
      nodeStatus: this.config.systemState === 'MUTED' ? 'MUTED' : reading.status === 'ANOMALY_HIGH_CONFIDENCE' ? 'EMERGENCY_ALARM' : 'PASSIVE_MONITORING',
      telemetry: {
        respiratoryRate: reading.respiratoryRate,
        heartRate: reading.heartRate,
        coughCount24h: reading.coughCount1Min,
        presenceDetected: !this.config.radarMuted,
        lastReadingTime: reading.timestamp
      }
    };
  }

  public setMute(type: 'mic' | 'radar', muted: boolean) {
    if (type === 'mic') this.setMicMute(muted);
    if (type === 'radar') this.setRadarMute(muted);
    return this.getState();
  }

  public simulateAnomaly(type: string) {
    const reading = this.generateReading('TACHYPNEA');
    return {
      anomalyType: 'TACHYPNEA',
      reading,
      alertMessage: this.getLocalVernacularAlert('TACHYPNEA')
    };
  }

  public setTelemetry(custom: Partial<any>) {
    // Allows resetting normal state
  }
}

export const edgeSimulator = new EdgeNodeSimulator();
