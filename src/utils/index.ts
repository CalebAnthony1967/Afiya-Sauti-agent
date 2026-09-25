<div className="flex items-center gap-2">
        <button
          onClick={onOpenFHIR}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer"
          title="Export complete record as FHIR R4 Bundle under Kenya DPA 2019 Right to Portability"
        >
          <FileDown className="w-3.5 h-3.5 text-teal-400" />
          <span>Export FHIR Record</span>
        </button>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-950/50 border border-teal-800/60 rounded-lg text-xs text-teal-300">
          <RefreshCw className="w-3 h-3 text-teal-400" />
          <span>Offline Cache Synced</span>
        </div>
      </div>
    </div>

    {/* Tab Navigation */}
    <div className="flex border-b border-slate-800 mt-5 space-x-6 text-sm">
      <button
        onClick={() => setActiveTab('timeline')}
        className={`pb-2.5 font-medium flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
          activeTab === 'timeline'
            ? 'border-teal-500 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span>Health Timeline</span>
      </button>
      <button
        onClick={() => setActiveTab('meds')}
        className={`pb-2.5 font-medium flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
          activeTab === 'meds'
            ? 'border-teal-500 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <Pill className="w-4 h-4" />
        <span>Medications & Reminders</span>
      </button>
      <button
        onClick={() => setActiveTab('consent')}
        className={`pb-2.5 font-medium flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
          activeTab === 'consent'
            ? 'border-teal-500 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <ShieldCheck className="w-4 h-4" />
        <span>Consent & Privacy (DPA 2019)</span>
      </button>
      <button
        onClick={() => setActiveTab('chat')}
        className={`pb-2.5 font-medium flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
          activeTab === 'chat'
            ? 'border-teal-500 text-teal-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>Grounded Health Assistant</span>
      </button>
    </div>
  </div>

  {/* Tab 1: Health Timeline */}
  {activeTab === 'timeline' && (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            Recent Clinical Consultations & Ambient Events
          </h3>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
            <div className="relative pl-8">
              <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-slate-950"></div>
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Today, 08:30 EAT</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                    COMPLETED
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">WhatsApp Triage Session (MNCH Domain)</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Reported symptoms: Moderate fever and dry cough in infant. Grounded IMCI protocol retrieved.
                  Advice given to monitor breathing rate and hydrate.
                </p>
                <div className="mt-2 text-[11px] font-mono text-teal-400">
                  ICD-11: CA40 (Pneumonia without specified organism) | Confidence: 94%
                </div>
              </div>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-slate-950"></div>
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Yesterday, 14:15 EAT</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px]">
                    EDGE RADAR
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">In-Home Ambient Anomaly Triage</h4>
                <p className="text-xs text-slate-300 mt-1">
                  60 GHz FMCW radar recorded resting respiratory rate of 19 breaths/min. Night cough counter: 1
                  episode. Evaluated safe; no anomaly escalation triggered.
                </p>
                <div className="mt-2 text-[11px] font-mono text-slate-400">
                  Telemetry: RR 19/min | HR 72 bpm | Confidence: 96%
                </div>
              </div>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950"></div>
              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>15 Sep 2026, 11:00 EAT</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    LEVEL 4 CLINIC
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">Clinician Review & Signed SOAP Note</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Dr. A. Omondi (Mbagathi Hospital) reviewed draft note and signed treatment plan for mild
                  hypertension. Cryptographic signature locked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            Upcoming Facility Appointments
          </h3>
          <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Kibera South Health Centre</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                Level 3
              </span>
            </div>
            <p className="text-xs text-slate-300">Routine Child Immunization (Pentavalent 3 & OPV)</p>
            <div className="text-xs text-slate-400 font-mono">📅 28 Sep 2026 at 09:00 AM</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            Community Health Promoter Assigned
          </h3>
          <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800">
            <p className="text-xs font-semibold text-white">Faith Wanjiku (CHP-041)</p>
            <p className="text-xs text-slate-400 mt-0.5">Soweto East Community Unit</p>
            <div className="mt-2 text-xs text-teal-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Active on eCHIS Field Network</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Tab 2: Medications & Reminders */}
  {activeTab === 'meds' && (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-400" />
            Prescribed Medication Regimens & Adherence
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Signed by certified human clinician. AI provides adherence reminders only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Amlodipine 5mg (Oral Tablet)</h4>
              <p className="text-xs text-slate-400">For Essential Hypertension Management</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              ACTIVE
            </span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>• Dosage: 1 tablet daily every morning after breakfast</p>
            <p>• Prescriber: Dr. A. Omondi (Mbagathi Level 4)</p>
            <p>• Supply Remaining: 18 days (Refill due 08 Oct 2026)</p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Today's Dose:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Taken at 07:45 AM
            </span>
          </div>
        </div>

        <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Oral Rehydration Salts (ORS) + Zinc</h4>
              <p className="text-xs text-slate-400">IMCI Pediatric Diarrhea Protocol</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              AS NEEDED
            </span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>• 1 sachet dissolved in exactly 1 litre clean boiled water</p>
            <p>• Dispensed by: Faith Wanjiku (CHP)</p>
            <p>• Instructions: Give sips after every loose stool</p>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Tab 3: Consent & Privacy (Kenya DPA 2019) */}
  {activeTab === 'consent' && (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Granular Consent Management & Data Rights (Kenya DPA 2019)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          You maintain sovereign control over how your health data is processed. You may revoke consent for any
          purpose at any time. Revocation executes immediate cryptographic key shredding.
        </p>
      </div>

      <div className="space-y-3">
        {consents.map((consent) => (
          <div
            key={consent.consentId}
            className="bg-slate-850 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Purpose: {consent.purposeCode}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    consent.consentState === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {consent.consentState}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {consent.purposeCode === 'TRIAGE' && 'Allows symptom processing and grounded health guidance.'}
                {consent.purposeCode === 'AMBIENT_MONITORING' &&
                  'Permits in-home 60GHz radar & acoustic cough counting with on-device feature extraction.'}
                {consent.purposeCode === 'CHP_DISPATCH' &&
                  'Permits automated alert dispatch to your assigned Community Health Promoter during emergencies.'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Consent ID: {consent.consentId} | Updated: {new Date(consent.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => toggleConsent(consent.consentId)}
              className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                consent.consentState === 'ACTIVE'
                  ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800'
                  : 'bg-emerald-900 hover:bg-emerald-800 text-white'
              }`}
            >
              {consent.consentState === 'ACTIVE' ? 'Revoke Consent' : 'Grant Consent'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Tab 4: Grounded Health Assistant */}
  {activeTab === 'chat' && (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            Grounded Health Assistant (MoH Kenya Verified)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            All responses cite official clinical protocols. PII is automatically de-identified before model
            inference.
          </p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 font-mono">
          Language: {currentLanguage.toUpperCase()}
        </span>
      </div>

      {/* Messages */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-3.5 text-xs ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : 'bg-slate-850 text-slate-200 border border-slate-800 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              {msg.citation && (
                <div className="mt-2 pt-2 border-t border-slate-750 text-[10px] text-teal-300 font-medium flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Verified Source: {msg.citation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="text-xs text-teal-400 flex items-center gap-2 italic">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Inachakata kulingana na miongozo ya matibabu...</span>
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Eleza dalili zako hapa (mfano: mtoto ana homa kali na kukohoa)..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={isProcessing || !chatInput.trim()}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Tuma</span>
        </button>
      </form>
    </div>
  )}
</div>