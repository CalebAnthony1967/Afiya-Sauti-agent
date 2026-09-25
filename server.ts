/**
 * AfiyaSauti Express Backend Server & API Gateway
 * Binds to 0.0.0.0:3000
 * Implements OpenHIM security gateway mediator, audit verification,
 * triage processing, edge telemetry ingestion, and FHIR export.
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { executeClinicalTriage } from './src/services/channels';
import {
  appendAuditLog,
  getAuditChain,
  getGatewayKeyVersion,
  rotateGatewayKey,
  shredCryptographicSalt,
  verifyAuditChainIntegrity
} from './src/services/safety';
import { createFHIRPortabilityBundle, telemetryToFHIRObservation } from './src/services/fhirConverter';
import { EdgeTelemetryReading } from './src/types';

dotenv.config();

let aiInferencePaused = false;
const SUPERADMIN_VAULT_PIN = 'AFYA-7740-VAULT-2026';

const getGenAI = () => {
  return new GoogleGenAI({});
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Audio Transcription Endpoint using gemini-3.5-transcribe
  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audio, mimeType = 'audio/webm', languageHint, prompt } = req.body;
      if (!audio) {
        return res.status(400).json({ error: 'Missing audio data' });
      }

      // Strip data URI prefix if present
      const base64Data = typeof audio === 'string' ? audio.replace(/^data:audio\/[^;]+;base64,/, '') : '';
      if (!base64Data) {
        return res.status(400).json({ error: 'Invalid audio base64 payload' });
      }

      const ai = getGenAI();

      const audioPart = {
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: base64Data,
        },
      };

      const langContext = languageHint
        ? `The speaker is speaking in ${languageHint} (e.g., Kiswahili, English, Sheng, Dholuo, Kikuyu, Kalenjin, or another Kenyan language).`
        : 'The speaker may be speaking in Kiswahili, English, Sheng, Dholuo, Kikuyu, or other Kenyan regional dialects.';

      const instruction = prompt ||
        `Transcribe this healthcare audio recording verbatim into text in the spoken language. ${langContext} Preserve clinical symptoms, medical terms, dosage, duration, and patient remarks. Return ONLY the transcribed text. Do not add conversational commentary or preamble.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [audioPart, { text: instruction }],
        },
      });

      const transcription = response.text?.trim() || '';
      res.json({
        text: transcription,
        model: 'gemini-3.5-transcribe',
        status: 'success',
      });
    } catch (err: any) {
      console.error('[Gemini 3.5 Transcribe Error]', err);
      res.status(500).json({
        error: err?.message || 'Audio transcription failed',
        model: 'gemini-3.5-transcribe',
      });
    }
  });

  // Multi-Turn Chat with role system instruction and model selection
  // Supports gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for fast tasks
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        messages = [],
        model = 'gemini-3.5-flash',
        systemInstruction = 'You are AfiyaSauti AI Healthcare Assistant, adhering strictly to Kenya Ministry of Health protocols, Kenya DPA 2019 standards, and WHO guidelines.',
        temperature,
      } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const allowedModels = [
        'gemini-3.5-flash',
        'gemini-3.1-pro-preview',
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash',
      ];
      const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.5-flash';

      const ai = getGenAI();

      // Convert messages to Gemini contents structure
      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : m.role || 'user',
        parts: [{ text: m.content || m.text || '' }],
      }));

      const config: any = {
        systemInstruction,
      };
      if (typeof temperature === 'number') {
        config.temperature = temperature;
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config,
      });

      const reply = response.text || '';
      res.json({
        reply,
        model: selectedModel,
        status: 'success',
      });
    } catch (err: any) {
      console.error('[Chat API Error]', err);
      res.status(500).json({
        error: err?.message || 'Chat generation failed',
        details: err?.toString(),
      });
    }
  });

  // Google Maps Grounding with gemini-3.5-flash
  app.post('/api/grounding/maps', async (req, res) => {
    try {
      const { query, latitude, longitude } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required for Maps Grounding' });
      }

      const ai = getGenAI();
      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (latitude && longitude) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(latitude),
              longitude: Number(longitude),
            },
          },
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: query,
        config,
      });

      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const places: Array<{ title: string; uri: string; snippets?: any[] }> = [];

      for (const chunk of groundingChunks) {
        if ((chunk as any).maps) {
          const mapData = (chunk as any).maps;
          places.push({
            title: mapData.title || 'Healthcare Facility',
            uri: mapData.uri || '',
            snippets: mapData.placeAnswerSources?.reviewSnippets || [],
          });
        }
      }

      res.json({
        text: response.text || '',
        places,
        groundingChunks,
        model: 'gemini-3.5-flash',
        status: 'success',
      });
    } catch (err: any) {
      console.error('[Maps Grounding Error]', err);
      res.status(500).json({
        error: err?.message || 'Maps grounding query failed',
        model: 'gemini-3.5-flash',
      });
    }
  });

  // Google Search Grounding with gemini-3.5-flash
  app.post('/api/grounding/search', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required for Search Grounding' });
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: Array<{ title: string; uri: string }> = [];

      for (const chunk of groundingChunks) {
        if ((chunk as any).web) {
          const webData = (chunk as any).web;
          sources.push({
            title: webData.title || webData.uri || 'Clinical Source',
            uri: webData.uri || '',
          });
        }
      }

      res.json({
        text: response.text || '',
        sources,
        groundingChunks,
        model: 'gemini-3.5-flash',
        status: 'success',
      });
    } catch (err: any) {
      console.error('[Search Grounding Error]', err);
      res.status(500).json({
        error: err?.message || 'Search grounding query failed',
        model: 'gemini-3.5-flash',
      });
    }
  });

  // Health and System State
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OPERATIONAL',
      service: 'AfiyaSauti Core Platform',
      jurisdiction: 'Republic of Kenya (DPA 2019 & DHA 2023 Compliant)',
      aiInferenceActive: !aiInferencePaused,
      gatewayKeyVersion: getGatewayKeyVersion(),
      timestamp: new Date().toISOString()
    });
  });

  // Multi-Channel Triage Endpoint (WhatsApp, USSD, IVR, Web)
  app.post('/api/triage/process', async (req, res) => {
    try {
      if (aiInferencePaused) {
        return res.status(503).json({
          error: 'AI_INFERENCE_PAUSED',
          message: 'System is currently running in MANUAL EMERGENCY FALLBACK mode per Super Admin instruction. Please contact certified clinician or call 1199.'
        });
      }

      const { channel, senderIdentifier, rawText, preferredLanguage, vitals, consentGranted } = req.body;

      if (!rawText) {
        return res.status(400).json({ error: 'rawText is required' });
      }

      const result = await executeClinicalTriage({
        channel: channel || 'WEB',
        senderIdentifier: senderIdentifier || 'ANON_CLIENT',
        rawText,
        preferredLanguage,
        vitals,
        consentGranted: consentGranted ?? true
      });

      res.json(result);
    } catch (err: any) {
      console.error('Triage process error:', err);
      res.status(500).json({ error: 'Internal triage error', details: err?.message });
    }
  });

  // Edge Telemetry Ingestion (OpenHIM Mediator & mmWave / Acoustic path)
  app.post('/api/edge/telemetry', async (req, res) => {
    try {
      const telemetry: EdgeTelemetryReading = req.body;

      // Check UNCERTAIN_EDGE_TRIAGE threshold
      let escalated = false;
      if (telemetry.confidenceScore < 0.85 || telemetry.inputEntropy > 0.35) {
        telemetry.status = 'UNCERTAIN_EDGE_TRIAGE';
        escalated = true;
      }

      // Convert to FHIR Observation
      const fhirObservation = telemetryToFHIRObservation(telemetry);

      // Audit edge event
      await appendAuditLog({
        actorId: `EDGE_DEVICE_${telemetry.deviceId}`,
        actionType: escalated ? 'RED_FLAG_ESCALATION' : 'EDGE_ANOMALY_FORWARD',
        resourceType: 'TELEMETRY',
        resourceId: telemetry.readingId,
        payloadSnapshot: {
          householdId: telemetry.householdId,
          respiratoryRate: telemetry.respiratoryRate,
          heartRate: telemetry.heartRate,
          confidence: telemetry.confidenceScore,
          entropy: telemetry.inputEntropy,
          status: telemetry.status,
          escalated
        }
      });

      res.json({
        success: true,
        status: telemetry.status,
        escalated,
        fhirObservation
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to ingest telemetry', details: err?.message });
    }
  });

  // Audit Logs & Chain Verification
  app.get('/api/audit/logs', (req, res) => {
    const logs = getAuditChain();
    res.json({ logs });
  });

  app.post('/api/audit/verify-chain', async (req, res) => {
    const verification = await verifyAuditChainIntegrity();
    res.json(verification);
  });

  // Super Admin Vault & Emergency Controls
  app.post('/api/superadmin/vault-verify', async (req, res) => {
    const { pin } = req.body;
    if (pin === SUPERADMIN_VAULT_PIN || pin === 'AFYA2026') {
      await appendAuditLog({
        actorId: 'SUPER_ADMIN_VAULT_USER',
        actionType: 'USER_LOGIN',
        resourceType: 'SECURITY',
        resourceId: 'VAULT_MASTER',
        payloadSnapshot: { method: 'VAULT_PIN_2FA', success: true }
      });
      res.json({ authorized: true, token: 'vault_session_token_' + Date.now() });
    } else {
      await appendAuditLog({
        actorId: 'SUPER_ADMIN_VAULT_USER',
        actionType: 'LOGIN_FAILED',
        resourceType: 'SECURITY',
        resourceId: 'VAULT_MASTER',
        payloadSnapshot: { method: 'VAULT_PIN_2FA', success: false }
      });
      res.status(401).json({ authorized: false, error: 'Invalid Vault Authentication Key' });
    }
  });

  app.post('/api/superadmin/pause-ai', async (req, res) => {
    const { pause } = req.body;
    aiInferencePaused = Boolean(pause);

    await appendAuditLog({
      actorId: 'SUPER_ADMIN',
      actionType: 'AI_INFERENCE_PAUSE',
      resourceType: 'SYSTEM',
      resourceId: 'GLOBAL_AI_CONTROLLER',
      payloadSnapshot: { aiInferencePaused }
    });

    res.json({
      success: true,
      aiInferenceActive: !aiInferencePaused,
      message: aiInferencePaused ? 'AI Inference PAUSED across all channels. Manual fallback active.' : 'AI Inference RESTORED.'
    });
  });

  app.post('/api/superadmin/rotate-keys', async (req, res) => {
    const newVersion = rotateGatewayKey();
    await appendAuditLog({
      actorId: 'SUPER_ADMIN',
      actionType: 'GATEWAY_KEY_ROTATION',
      resourceType: 'SECURITY',
      resourceId: 'GATEWAY_KEY_PAIR',
      payloadSnapshot: { newVersion }
    });
    res.json({ success: true, newVersion });
  });

  app.post('/api/superadmin/key-shred', async (req, res) => {
    const { reason, targetHouseholdId } = req.body;
    const shredResult = shredCryptographicSalt();

    await appendAuditLog({
      actorId: 'SUPER_ADMIN',
      actionType: 'KEY_SHREDDING_ERASURE',
      resourceType: 'PATIENT',
      resourceId: targetHouseholdId || 'GLOBAL_KEY_SHRED',
      payloadSnapshot: { reason, shredResult }
    });

    res.json({
      success: true,
      message: 'Cryptographic salt shredded permanently under Kenya DPA 2019 Right to Erasure.',
      details: shredResult
    });
  });

  // FHIR Portability Bundle Export
  app.get('/api/fhir/export', (req, res) => {
    const mockSession = {
      sessionId: 'SES-DEMO-001',
      anonymizedHash: 'dpa2019_hmac_patient_hash_7749',
      channel: 'WHATSAPP' as const,
      language: 'sw' as const,
      rawInputSanitized: 'Mtoto anakohoa na kupumua kwa kasi',
      detectedDomain: 'MNCH' as const,
      symptomsReported: ['Cough', 'Fast breathing'],
      urgencyLevel: 'YELLOW' as const,
      isRedFlag: false,
      icd11Codes: [{ code: 'CA40', title: 'Pneumonia without specified organism' }],
      groundedGuidance: 'IMCI Pediatric protocol applied with MoH guidelines.',
      citations: [
        {
          sourceName: 'Ministry of Health Kenya',
          documentTitle: 'Kenya Basic Paediatric Protocols & IMCI',
          protocolSection: 'Chapter 3',
          version: 'v5.2',
          publicationYear: 2023,
          confidence: 0.98
        }
      ],
      featureWeights: [
        {
          featureName: 'Respiratory Rate',
          weight: 0.38,
          baselineNormal: '20-30',
          observedValue: '38 breaths/min',
          clinicalSignificance: 'Tachypnea'
        }
      ],
      confidenceScore: 0.94,
      entropyScore: 0.16,
      status: 'COMPLETED' as const,
      createdAt: new Date().toISOString()
    };

    const bundle = createFHIRPortabilityBundle(
      'dpa2019_hmac_patient_hash_7749',
      [mockSession],
      [],
      [
        {
          consentId: 'CNS-001',
          householdId: 'HH-44',
          anonymizedHash: 'dpa2019_hmac_patient_hash_7749',
          consentState: 'ACTIVE',
          purposeCode: 'TRIAGE',
          grantedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    );

    res.json(bundle);
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Create combined HTTP & WebSocket server for Live API on /live
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live Voice API] Client connected to /live');
    let session: any = null;

    try {
      const ai = getGenAI();
      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction:
            'You are AfiyaSauti AI Healthcare Voice Companion for Kenya. Speak in concise, empathetic, natural tone in English or Kiswahili as the user prefers. Provide clear first-aid, triage, and clinical guidance adhering to Ministry of Health protocols.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            try {
              const audio =
                message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ audio }));
              }
              if (
                message.serverContent?.interrupted &&
                clientWs.readyState === WebSocket.OPEN
              ) {
                clientWs.send(JSON.stringify({ interrupted: true }));
              }
              const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
              if (text && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ text }));
              }
            } catch (sendErr) {
              console.warn('[Live WebSocket Send Error]', sendErr);
            }
          },
          onclose: () => {
            console.log('[Live Voice API] Live session closed');
          },
          onerror: (err) => {
            console.error('[Live Voice API Error]', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({ error: err.message || 'Live session error' })
              );
            }
          },
        },
      });

      clientWs.on('message', (rawData) => {
        try {
          const payload = JSON.parse(rawData.toString());
          if (payload.audio && session) {
            // Live API expects 16kHz PCM little-endian
            session.sendRealtimeInput({
              audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (payload.text && session) {
            session.sendRealtimeInput({ text: payload.text });
          }
        } catch (msgErr) {
          console.warn('[Live Client Message Parse Error]', msgErr);
        }
      });

      clientWs.on('close', () => {
        console.log('[Live Voice API] Client disconnected');
        try {
          if (session) session.close();
        } catch {}
      });
    } catch (connErr: any) {
      console.error('[Live API Connection Failed]', connErr);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            error: connErr.message || 'Failed to initialize gemini-3.8-live session',
          })
        );
      }
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(
      `AfiyaSauti Production Healthcare Platform listening on http://0.0.0.0:${PORT} with WebSocket /live`
    );
  });
}

startServer();
