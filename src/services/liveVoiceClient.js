/**
 * Live Voice Client for gemini-3.8-live
 * Connects via WebSocket to /live, captures 16kHz PCM audio from microphone,
 * streams to server, and plays back 24kHz PCM response from Gemini Live API.
 */

function float32To16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export class LiveVoiceSession {
  constructor({ onStatusChange, onTranscript, onAudioVolume, onError }) {
    this.onStatusChange = onStatusChange || (() => {});
    this.onTranscript = onTranscript || (() => {});
    this.onAudioVolume = onAudioVolume || (() => {});
    this.onError = onError || (() => {});

    this.ws = null;
    this.inputAudioCtx = null;
    this.outputAudioCtx = null;
    this.mediaStream = null;
    this.processor = null;
    this.playbackState = { nextStartTime: 0 };
    this.isConnected = false;
    this.isMuted = false;
  }

  async start() {
    try {
      this.onStatusChange('CONNECTING');

      // Initialize WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        console.log('[Live Voice] Connected to /live endpoint');
        this.isConnected = true;
        this.onStatusChange('CONNECTED');
        await this.initMicrophone();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            console.error('[Live Voice Server Error]', msg.error);
            this.onError(msg.error);
          }
          if (msg.interrupted) {
            this.stopPlayback();
            this.onTranscript({ text: '', interrupted: true });
          }
          if (msg.text) {
            this.onTranscript({ text: msg.text, role: 'model' });
          }
          if (msg.audio) {
            this.playAudioChunk(msg.audio);
          }
        } catch (e) {
          console.warn('[Live Voice Parse Error]', e);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[Live Voice WS Error]', err);
        this.onError('Live WebSocket connection failed');
        this.onStatusChange('ERROR');
      };

      this.ws.onclose = () => {
        console.log('[Live Voice WS Closed]');
        this.isConnected = false;
        this.onStatusChange('DISCONNECTED');
        this.cleanup();
      };
    } catch (err) {
      console.error('[Live Voice Start Error]', err);
      this.onError(err.message || 'Could not start live voice session');
      this.onStatusChange('ERROR');
      this.cleanup();
    }
  }

  async initMicrophone() {
    try {
      this.inputAudioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });
      this.outputAudioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000,
      });

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const source = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
      // ScriptProcessor for real-time PCM capture
      this.processor = this.inputAudioCtx.createScriptProcessor(2048, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (!this.isConnected || this.isMuted) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);

        // Simple volume calculation for visualizer
        let sum = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          sum += inputChannelData[i] * inputChannelData[i];
        }
        const rms = Math.sqrt(sum / inputChannelData.length);
        this.onAudioVolume(Math.min(1, rms * 5));

        // Convert to 16-bit PCM little-endian
        const pcmBuffer = float32To16BitPCM(inputChannelData);
        const base64Audio = arrayBufferToBase64(pcmBuffer);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      source.connect(this.processor);
      this.processor.connect(this.inputAudioCtx.destination);
      this.onStatusChange('SPEAKING');
    } catch (err) {
      console.error('[Microphone Init Error]', err);
      this.onError('Microphone access denied or audio initialization failed.');
      this.onStatusChange('ERROR');
    }
  }

  playAudioChunk(base64Pcm) {
    if (!this.outputAudioCtx) {
      this.outputAudioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000,
      });
    }

    if (this.outputAudioCtx.state === 'suspended') {
      this.outputAudioCtx.resume();
    }

    try {
      const binaryString = window.atob(base64Pcm);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16View = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16View.length);
      for (let i = 0; i < int16View.length; i++) {
        float32[i] = int16View[i] / (int16View[i] < 0 ? 0x8000 : 0x7fff);
      }

      const audioBuffer = this.outputAudioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioCtx.destination);

      const currentTime = this.outputAudioCtx.currentTime;
      if (this.playbackState.nextStartTime < currentTime) {
        this.playbackState.nextStartTime = currentTime;
      }
      source.start(this.playbackState.nextStartTime);
      this.playbackState.nextStartTime += audioBuffer.duration;
    } catch (e) {
      console.warn('[Audio Playback Error]', e);
    }
  }

  stopPlayback() {
    this.playbackState.nextStartTime = 0;
    if (this.outputAudioCtx) {
      try {
        this.outputAudioCtx.close();
      } catch {}
      this.outputAudioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000,
      });
    }
  }

  sendTextMessage(text) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ text }));
      this.onTranscript({ text, role: 'user' });
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  cleanup() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch {}
      this.processor = null;
    }
    if (this.inputAudioCtx) {
      try {
        this.inputAudioCtx.close();
      } catch {}
      this.inputAudioCtx = null;
    }
    if (this.outputAudioCtx) {
      try {
        this.outputAudioCtx.close();
      } catch {}
      this.outputAudioCtx = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.isConnected = false;
    this.playbackState.nextStartTime = 0;
  }

  stop() {
    this.cleanup();
    this.onStatusChange('IDLE');
  }
}
