import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  sendChatMessage,
  queryMapsGrounding,
  querySearchGrounding,
  AI_PORTAL_ROLES,
} from '@/services/aiAgentService';
import { LiveVoiceSession } from '@/services/liveVoiceClient';
import {
  MessageSquare,
  Radio,
  MapPin,
  Search,
  Sparkles,
  Send,
  Loader2,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  Shield,
  Stethoscope,
  Volume2,
  RefreshCw,
  X,
  Compass,
  Zap,
  Globe,
  Sliders,
  ChevronDown,
  Building2,
  Navigation,
} from 'lucide-react';

const PORTAL_SHORTCUTS = [
  { name: 'Patient Triage', path: '/patient/triage', role: 'patient', icon: Stethoscope },
  { name: 'Clinician Scribe', path: '/clinician/scribe', role: 'clinician', icon: Shield },
  { name: 'CHP Field Tasks', path: '/chp', role: 'chp', icon: User },
  { name: 'Ambient Edge Node', path: '/ambient', role: 'ambient', icon: Radio },
  { name: 'MoH Surveillance', path: '/moh', role: 'moh', icon: Globe },
  { name: 'Interactive Simulator', path: '/simulator', role: 'general', icon: Compass },
];

export default function GlobalHealthcareAgent({ isOpen, onClose, currentRole = 'general' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'voice' | 'maps' | 'search' | 'portals'

  // Chat State
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Jambo! I am your AfiyaSauti AI Healthcare Assistant. I connect clinical protocols, patient triage, ambient vital monitoring, and national health intelligence. How can I assist your health workflow today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Live Voice State (gemini-3.8-live)
  const [liveSession, setLiveSession] = useState(null);
  const [liveStatus, setLiveStatus] = useState('IDLE'); // 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'SPEAKING' | 'ERROR'
  const [isMuted, setIsMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [liveTranscripts, setLiveTranscripts] = useState([]);
  const [liveError, setLiveError] = useState(null);

  // Maps Grounding State (gemini-3.5-flash with googleMaps)
  const [mapQuery, setMapQuery] = useState('Find level 4 and level 5 hospitals near Nairobi Kenya with 24hr emergency triage');
  const [mapResults, setMapResults] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Search Grounding State (gemini-3.5-flash with googleSearch)
  const [searchQuery, setSearchQuery] = useState('Latest Kenya Ministry of Health guidelines on malaria and cholera rapid response 2026');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (AI_PORTAL_ROLES[currentRole]) {
      setSelectedRole(currentRole);
    }
  }, [currentRole]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Request browser geolocation for Maps Grounding
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Default to Nairobi Kenya coordinates
          setUserLocation({ lat: -1.286389, lng: 36.817223 });
        }
      );
    }
  }, []);

  // Cleanup Live Voice on unmount or close
  useEffect(() => {
    return () => {
      if (liveSession) {
        liveSession.stop();
      }
    };
  }, [liveSession]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isChatLoading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsChatLoading(true);

    try {
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage({
        messages: historyPayload,
        model: selectedModel,
        role: selectedRole,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: res.reply || 'No response returned.',
          model: res.model,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Failed to communicate with Gemini.'}`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Live Voice Handlers (gemini-3.8-live)
  const toggleLiveCall = async () => {
    if (liveStatus === 'IDLE' || liveStatus === 'ERROR' || liveStatus === 'DISCONNECTED') {
      setLiveError(null);
      const session = new LiveVoiceSession({
        onStatusChange: (status) => setLiveStatus(status),
        onTranscript: (t) => {
          if (t.interrupted) {
            setLiveTranscripts((prev) => [...prev, { text: '[Interrupted]', isSystem: true }]);
          } else if (t.text) {
            setLiveTranscripts((prev) => [
              ...prev,
              { text: t.text, role: t.role || 'model', id: Date.now() },
            ]);
          }
        },
        onAudioVolume: (vol) => setAudioVolume(vol),
        onError: (err) => setLiveError(err),
      });

      setLiveSession(session);
      await session.start();
    } else {
      if (liveSession) {
        liveSession.stop();
        setLiveSession(null);
      }
      setLiveStatus('IDLE');
    }
  };

  const toggleMute = () => {
    if (liveSession) {
      const muted = liveSession.toggleMute();
      setIsMuted(muted);
    }
  };

  // Maps Grounding Query (gemini-3.5-flash with googleMaps)
  const handleMapsSearch = async (e) => {
    e?.preventDefault();
    if (!mapQuery.trim() || mapLoading) return;

    setMapLoading(true);
    setMapResults(null);
    try {
      const data = await queryMapsGrounding({
        query: mapQuery,
        latitude: userLocation?.lat,
        longitude: userLocation?.lng,
      });
      setMapResults(data);
    } catch (err) {
      setMapResults({
        text: `Error finding facilities: ${err.message}`,
        places: [],
      });
    } finally {
      setMapLoading(false);
    }
  };

  // Search Grounding Query (gemini-3.5-flash with googleSearch)
  const handleWebSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() || searchLoading) return;

    setSearchLoading(true);
    setSearchResults(null);
    try {
      const data = await querySearchGrounding({ query: searchQuery });
      setSearchResults(data);
    } catch (err) {
      setSearchResults({
        text: `Error retrieving grounded information: ${err.message}`,
        sources: [],
      });
    } finally {
      setSearchLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentRoleConfig = AI_PORTAL_ROLES[selectedRole] || AI_PORTAL_ROLES.general;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[92vh] max-h-[850px] shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-teal-700 via-indigo-800 to-violet-800 text-white px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5 text-teal-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base sm:text-lg tracking-tight">
                  AfiyaSauti AI Healthcare Engine
                </h3>
                <span className="hidden sm:inline-block bg-teal-400/20 text-teal-200 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-teal-300/30">
                  Multimodal · Grounded
                </span>
              </div>
              <p className="text-xs text-white/80 flex items-center gap-1.5">
                <span>Unified Portal-to-Portal Intelligence</span>
                <span>•</span>
                <span className="text-teal-200">{currentRoleConfig.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between overflow-x-auto gap-2 text-xs font-semibold py-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all min-h-[38px] ${
                activeTab === 'chat'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Multi-Turn Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all min-h-[38px] ${
                activeTab === 'voice'
                  ? 'bg-white text-rose-700 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Live Voice (gemini-3.8-live)</span>
            </button>

            <button
              onClick={() => setActiveTab('maps')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all min-h-[38px] ${
                activeTab === 'maps'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Maps Grounding (Clinics & Hospitals)</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all min-h-[38px] ${
                activeTab === 'search'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span>Search Grounding (MoH Guidelines)</span>
            </button>

            <button
              onClick={() => setActiveTab('portals')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all min-h-[38px] ${
                activeTab === 'portals'
                  ? 'bg-white text-violet-700 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Compass className="w-4 h-4 text-violet-600" />
              <span>Portal Teleport</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Multi-Turn Chatbot */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
            {/* Model & Persona Selection Bar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Persona Role:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="clinician">🩺 Clinician Assistant (ICD-11 & SOAP)</option>
                  <option value="patient">👤 Patient Health Guide & Triage</option>
                  <option value="chp">🌾 Community Health Promoter (CHP Guide)</option>
                  <option value="moh">🌍 MoH National Surveillance & Epidemics</option>
                  <option value="ambient">🏠 Ambient Edge Telemetry Specialist</option>
                  <option value="general">✨ General Healthcare AI</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Gemini Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (General Triage)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Clinical)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
                </select>
              </div>
            </div>

            {/* Scrollable Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 max-w-3xl ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
                        isUser
                          ? 'bg-slate-800'
                          : m.isError
                          ? 'bg-red-600'
                          : 'bg-gradient-to-tr from-teal-600 to-indigo-600'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                        isUser
                          ? 'bg-slate-900 text-white rounded-tr-none'
                          : m.isError
                          ? 'bg-red-50 text-red-900 border border-red-200 rounded-tl-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                        <span className="font-semibold">{isUser ? 'You' : 'AfiyaSauti AI'}</span>
                        <span className="font-mono">{m.timestamp}</span>
                      </div>

                      <div className="whitespace-pre-wrap">{m.content}</div>

                      {m.model && (
                        <div className="mt-2 pt-1 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Generated by {m.model}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex items-start gap-3 max-w-md mr-auto">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Reasoning with {selectedModel}...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-400 text-[11px] flex-shrink-0">Suggestions:</span>
              <button
                type="button"
                onClick={() => setInputText('How does Kenya Level 1 Community Health Strategy handle severe acute malnutrition (SAM)?')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full whitespace-nowrap"
              >
                🌾 Malnutrition field protocol
              </button>
              <button
                type="button"
                onClick={() => setInputText('Give differential diagnoses for a 32yo female with 4-day high fever, rigors, headache, and epigastric discomfort in Kisumu county.')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full whitespace-nowrap"
              >
                🩺 Differential diagnosis
              </button>
              <button
                type="button"
                onClick={() => setInputText('Ni nini dalili za hatari za malaria wakati wa ujauzito na ninapaswa kufanya nini?')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full whitespace-nowrap"
              >
                🇰🇪 Dalili za malaria (Swahili)
              </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask ${currentRoleConfig.name} in English, Kiswahili, or Sheng...`}
                disabled={isChatLoading}
                className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isChatLoading}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Live Voice Conversation (gemini-3.8-live) */}
        {activeTab === 'voice' && (
          <div className="flex-1 flex flex-col p-6 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white overflow-y-auto">
            <div className="max-w-xl mx-auto w-full text-center space-y-6 my-auto">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-semibold">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                  Model: gemini-3.8-live (Live API)
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading">
                  Real-Time Voice Health Companion
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Hold a natural, bidirectional spoken conversation with AfiyaSauti. Speaks and listens in English, Kiswahili, and Sheng with instant zero-latency responses.
                </p>
              </div>

              {/* Glowing Pulse Visualizer */}
              <div className="relative py-8 flex items-center justify-center">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-150"
                  style={{
                    backgroundColor:
                      liveStatus === 'SPEAKING'
                        ? `rgba(244, 63, 94, ${0.4 + audioVolume * 0.6})`
                        : liveStatus === 'CONNECTED'
                        ? 'rgba(99, 102, 241, 0.3)'
                        : 'rgba(71, 85, 105, 0.2)',
                    boxShadow:
                      liveStatus === 'SPEAKING'
                        ? `0 0 ${30 + audioVolume * 60}px rgba(244, 63, 94, 0.8)`
                        : liveStatus === 'CONNECTED'
                        ? '0 0 25px rgba(99, 102, 241, 0.5)'
                        : 'none',
                    transform: `scale(${1 + audioVolume * 0.25})`,
                  }}
                >
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    {liveStatus === 'SPEAKING' ? (
                      <Volume2 className="w-8 h-8 text-rose-200 animate-bounce" />
                    ) : liveStatus === 'CONNECTING' ? (
                      <Loader2 className="w-8 h-8 text-indigo-300 animate-spin" />
                    ) : (
                      <Radio className="w-8 h-8 text-white/70" />
                    )}
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="text-sm font-medium">
                {liveStatus === 'IDLE' && (
                  <p className="text-slate-400">Tap Start Call to talk to the AI healthcare agent.</p>
                )}
                {liveStatus === 'CONNECTING' && (
                  <p className="text-amber-300 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Connecting to gemini-3.8-live WebSocket...
                  </p>
                )}
                {liveStatus === 'CONNECTED' && (
                  <p className="text-teal-300">Live Voice Connected — Ready to listen</p>
                )}
                {liveStatus === 'SPEAKING' && (
                  <p className="text-rose-300">Listening & Speaking simultaneously (16kHz PCM Little-Endian / 24kHz Audio)...</p>
                )}
                {liveError && <p className="text-red-400 text-xs">{liveError}</p>}
              </div>

              {/* Voice Controls */}
              <div className="flex items-center justify-center gap-4 pt-2">
                {liveStatus === 'IDLE' || liveStatus === 'DISCONNECTED' || liveStatus === 'ERROR' ? (
                  <button
                    onClick={toggleLiveCall}
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-base shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                  >
                    <PhoneCall className="w-5 h-5" />
                    <span>Start Voice Call</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={toggleMute}
                      className={`p-3.5 rounded-full border transition-all ${
                        isMuted
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                      title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={toggleLiveCall}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-105"
                    >
                      <PhoneOff className="w-5 h-5" />
                      <span>End Call</span>
                    </button>
                  </>
                )}
              </div>

              {/* Live Transcripts Box */}
              {liveTranscripts.length > 0 && (
                <div className="mt-6 bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-left max-h-48 overflow-y-auto space-y-2 text-xs">
                  <p className="font-semibold text-slate-400 border-b border-slate-800 pb-1">
                    Live Session Transcript:
                  </p>
                  {liveTranscripts.map((t, idx) => (
                    <div key={idx} className={t.role === 'user' ? 'text-teal-300' : 'text-slate-200'}>
                      <span className="font-semibold text-[10px] uppercase text-slate-400 mr-1.5">
                        {t.role === 'user' ? 'You:' : 'Gemini 3.8 Live:'}
                      </span>
                      {t.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Google Maps Grounding (gemini-3.5-flash with googleMaps) */}
        {activeTab === 'maps' && (
          <div className="flex-1 flex flex-col p-5 bg-slate-50 overflow-y-auto space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Google Maps Grounding — Healthcare Facility Locator
                    </h4>
                    <p className="text-xs text-slate-500">
                      Powered by model <span className="font-mono font-semibold text-emerald-700">gemini-3.5-flash</span> with <span className="font-mono font-semibold text-emerald-700">googleMaps tool</span>
                    </p>
                  </div>
                </div>

                {userLocation && (
                  <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded font-mono">
                    Coords: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </span>
                )}
              </div>

              <form onSubmit={handleMapsSearch} className="flex gap-2">
                <input
                  type="text"
                  value={mapQuery}
                  onChange={(e) => setMapQuery(e.target.value)}
                  placeholder="e.g. Find 24-hour pharmacies and level 4 hospitals in Eldoret Kenya..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={mapLoading || !mapQuery.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {mapLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  <span>Find on Maps</span>
                </button>
              </form>

              {/* Sample Queries */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-slate-400">Quick searches:</span>
                <button
                  type="button"
                  onClick={() => setMapQuery('Level 5 referral hospitals in Nairobi with emergency ICUs')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
                >
                  Nairobi Level 5 Hospitals
                </button>
                <button
                  type="button"
                  onClick={() => setMapQuery('Clinics and health centres in Kisumu offering maternal child healthcare')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
                >
                  Kisumu Maternal Clinics
                </button>
                <button
                  type="button"
                  onClick={() => setMapQuery('24 hour pharmacies in Mombasa Kenya')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
                >
                  Mombasa 24hr Pharmacies
                </button>
              </div>
            </div>

            {/* Results Display */}
            {mapLoading && (
              <div className="text-center py-10 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                <p className="text-sm font-medium text-slate-700">Querying Google Maps grounding with gemini-3.5-flash...</p>
                <p className="text-xs text-slate-400">Retrieving official hospital locations, reviews, and navigation links</p>
              </div>
            )}

            {mapResults && (
              <div className="space-y-4">
                {/* Extracted Google Maps Links (MANDATORY REQUIREMENT) */}
                {mapResults.places && mapResults.places.length > 0 && (
                  <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Grounded Google Maps Places & Navigation Links:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {mapResults.places.map((place, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1.5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <h6 className="font-semibold text-sm text-slate-900">{place.title}</h6>
                            {place.uri && (
                              <a
                                href={place.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold bg-white px-2 py-1 rounded border border-emerald-300 shadow-sm"
                              >
                                <span>Directions</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {place.snippets?.length > 0 && (
                            <p className="text-xs text-slate-600 italic">
                              "{place.snippets[0]}"
                            </p>
                          )}
                          {place.uri && (
                            <a
                              href={place.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-emerald-600 hover:underline block truncate"
                            >
                              {place.uri}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounded Text Overview */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                  <h5 className="font-semibold text-sm text-slate-800">Grounded Clinical Summary:</h5>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {mapResults.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Google Search Grounding (gemini-3.5-flash with googleSearch) */}
        {activeTab === 'search' && (
          <div className="flex-1 flex flex-col p-5 bg-slate-50 overflow-y-auto space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Google Search Grounding — Live Clinical Guidelines & Epidemic Intelligence
                  </h4>
                  <p className="text-xs text-slate-500">
                    Powered by model <span className="font-mono font-semibold text-blue-700">gemini-3.5-flash</span> with <span className="font-mono font-semibold text-blue-700">googleSearch tool</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleWebSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Kenya MoH official alert on measles outbreak containment in Garissa..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={searchLoading || !searchQuery.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search Grounded</span>
                </button>
              </form>

              {/* Sample Queries */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-slate-400">Trending topics:</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('Kenya Social Health Authority (SHA) benefit package essential benefits 2026')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
                >
                  Kenya SHA benefits
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery('WHO latest guidelines on severe malaria treatment with artesunate in Africa')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
                >
                  WHO Artesunate malaria
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery('Kenya Ministry of Health cholera surveillance guidelines and oral cholera vaccine OCV')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
                >
                  MoH Cholera & OCV
                </button>
              </div>
            </div>

            {/* Results Display */}
            {searchLoading && (
              <div className="text-center py-10 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-sm font-medium text-slate-700">Grounding query with Google Search & gemini-3.5-flash...</p>
                <p className="text-xs text-slate-400">Verifying peer-reviewed literature, MoH advisories, and clinical evidence</p>
              </div>
            )}

            {searchResults && (
              <div className="space-y-4">
                {/* Clickable Citations & Source Links */}
                {searchResults.sources && searchResults.sources.length > 0 && (
                  <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Grounded Web Evidence Sources:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-blue-600" />
                          <span className="truncate max-w-xs">{source.title || source.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounded Summary */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                  <h5 className="font-semibold text-sm text-slate-800">Verified Clinical Evidence:</h5>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {searchResults.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Portal Teleport (Seamless Interconnectivity) */}
        {activeTab === 'portals' && (
          <div className="flex-1 p-6 bg-slate-50 overflow-y-auto space-y-5">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Seamless Portal-to-Portal Interconnectivity
              </h4>
              <p className="text-xs text-slate-500">
                Instant navigation between patient care, field worker tasks, clinician signing, edge monitoring, and national surveillance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PORTAL_SHORTCUTS.map((portal) => {
                const Icon = portal.icon;
                return (
                  <button
                    key={portal.path}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(portal.path);
                    }}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-300 text-left transition-all group flex items-start justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-700 flex items-center justify-center transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {portal.name}
                        </h5>
                        <p className="text-xs text-slate-500 capitalize">{portal.role} portal</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                  </button>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-800">
                  Kenya DPA 2019 Cryptographic Anonymization
                </p>
                <p className="text-slate-600">
                  Patient identifiers are HMAC-SHA256 pseudonymized across all portals. Full FHIR R4 interoperability.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/developer/fhir');
                }}
                className="px-3 py-1.5 bg-teal-700 text-white rounded-lg font-semibold hover:bg-teal-800 transition-colors whitespace-nowrap"
              >
                FHIR Portability ↗
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
