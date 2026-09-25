import React, { useState } from 'react';
import {
  Stethoscope,
  Activity,
  FileCheck,
  AlertOctagon,
  Lock,
  CheckCircle2,
  Share2,
  TrendingUp,
  Cpu,
  FileText,
  BadgeAlert,
  Bed,
  Plus,
  Minus,
  Calendar,
  UserCheck,
  Clock,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ClinicalSOAPNote, TriageUrgency } from '../../types';
import { appendAuditLog, sha256 } from '../../services/safety';

interface TriagePatient {
  id: string;
  patientHash: string;
  ageBand: string;
  chiefComplaint: string;
  urgency: TriageUrgency;
  vitals: {
    rr: number;
    hr: number;
    spo2: number;
    temp: number;
  };
  waveformHistory: Array<{ time: string; rr: number; hr: number }>;
  draftNote: ClinicalSOAPNote;
}

export interface HospitalClinicPortalProps {
  activeTab?: string;
}

export const HospitalClinicPortal: React.FC<HospitalClinicPortalProps> = ({ activeTab = 'triage_queue' }) => {
  const [patients, setPatients] = useState<TriagePatient[]>([
    {
      id: 'TRIAGE-PAT-001',
      patientHash: 'dpa2019_hmac_patient_hash_7749',
      ageBand: 'Infant (8 Months)',
      chiefComplaint: 'Fast breathing, persistent cough, and high fever',
      urgency: 'RED',
      vitals: { rr: 42, hr: 138, spo2: 92, temp: 38.8 },
      waveformHistory: [
        { time: '02:00', rr: 24, hr: 88 },
        { time: '04:00', rr: 26, hr: 92 },
        { time: '06:00', rr: 31, hr: 104 },
        { time: '08:00', rr: 36, hr: 120 },
        { time: '10:00', rr: 42, hr: 138 }
      ],
      draftNote: {
        noteId: 'SOAP-NRB-8812',
        sessionId: 'SES-9941',
        patientHash: 'dpa2019_hmac_patient_hash_7749',
        subjective:
          'Caregiver reports 3-day history of worsening cough and fast breathing. Child refuses solid food but accepts small sips of breastmilk.',
        objective:
          'Physical examination & ambient radar telemetry: Respiratory rate 42 breaths/min (Tachypneic per IMCI age-threshold >50/40), Heart rate 138 bpm, Temp 38.8 °C. Lower chest wall indrawing noted on quiet respiration.',
        assessment:
          'Severe Pneumonia per IMCI guidelines / Suspected acute lower respiratory tract infection. ICD-11: CA40.',
        plan:
          'Immediate oxygen supplementation via nasal prongs to maintain SpO2 >94%. Administer first dose IV Ampicillin + Gentamicin as per Kenya Basic Paediatric Protocols. Blood slide for malaria parasites and full hemogram.',
        icd11Codes: [
          { code: 'CA40', title: 'Pneumonia without specified organism' },
          { code: 'MD81', title: 'Tachypnoea' }
        ],
        featureAttribution: [
          {
            featureName: 'Respiratory Rate (mmWave Radar)',
            weight: 0.42,
            baselineNormal: '20 - 30 breaths/min',
            observedValue: '42 breaths/min',
            clinicalSignificance: 'Exceeds IMCI 40/min threshold; high indicator of pediatric pneumonia'
          },
          {
            featureName: 'SpO2 Saturation',
            weight: 0.28,
            baselineNormal: '95 - 100%',
            observedValue: '92%',
            clinicalSignificance: 'Hypoxemia requiring supplemental oxygen'
          },
          {
            featureName: 'Pyrexia (Axillary Temp)',
            weight: 0.18,
            baselineNormal: '36.5 - 37.5 °C',
            observedValue: '38.8 °C',
            clinicalSignificance: 'Acute systemic inflammatory response'
          }
        ],
        citations: [
          {
            sourceName: 'Ministry of Health Kenya',
            documentTitle: 'Kenya Basic Paediatric Protocols & IMCI 5th Ed.',
            protocolSection: 'Chapter 3: Acute Respiratory Infections in Children',
            version: 'v5.2',
            publicationYear: 2023,
            confidence: 0.98
          }
        ],
        clinicianReviewed: false,
        locked: false
      }
    },
    {
      id: 'TRIAGE-PAT-002',
      patientHash: 'dpa2019_hmac_patient_hash_3310',
      ageBand: 'Adult (46 Years)',
      chiefComplaint: 'Throbbing frontal headache and blurred vision for 2 days',
      urgency: 'YELLOW',
      vitals: { rr: 18, hr: 84, spo2: 98, temp: 36.8 },
      waveformHistory: [
        { time: '02:00', rr: 16, hr: 72 },
        { time: '04:00', rr: 17, hr: 74 },
        { time: '06:00', rr: 18, hr: 80 },
        { time: '08:00', rr: 18, hr: 82 },
        { time: '10:00', rr: 18, hr: 84 }
      ],
      draftNote: {
        noteId: 'SOAP-NRB-8813',
        sessionId: 'SES-9942',
        patientHash: 'dpa2019_hmac_patient_hash_3310',
        subjective:
          'Patient complains of recurrent severe headaches over 48 hours. Denies chest pain, numbness, or loss of consciousness.',
        objective:
          'Blood pressure seated: 168/104 mmHg. Heart rate regular at 84 bpm. Neurological exam gross motor intact.',
        assessment: 'Stage 2 Essential Hypertension with symptom manifestation. ICD-11: BA00.',
        plan:
          'Initiate oral Amlodipine 5mg OD + Telmisartan 40mg OD. Order fasting lipid profile, serum creatinine, and urinalysis. Advise DASH diet with low sodium.',
        icd11Codes: [{ code: 'BA00', title: 'Essential hypertension' }],
        featureAttribution: [
          {
            featureName: 'Systolic / Diastolic BP',
            weight: 0.65,
            baselineNormal: '< 130/85 mmHg',
            observedValue: '168/104 mmHg',
            clinicalSignificance: 'Stage 2 Hypertension requiring dual therapeutic intervention'
          }
        ],
        citations: [
          {
            sourceName: 'Ministry of Health Kenya - NCD Division',
            documentTitle: 'Kenya National Strategy for the Prevention and Control of NCDs',
            protocolSection: 'Clinical Protocol 2: Management of Essential Hypertension',
            version: 'v2.0',
            publicationYear: 2023,
            confidence: 0.96
          }
        ],
        clinicianReviewed: false,
        locked: false
      }
    }
  ]);

  const [selectedPatientId, setSelectedPatientId] = useState<string>('TRIAGE-PAT-001');
  const [clinicianId, setClinicianId] = useState('DR-OMONDI-MBAGATHI-44');
  const [signingSuccess, setSigningSuccess] = useState<string | null>(null);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleSignSOAPNote = async () => {
    const note = selectedPatient.draftNote;
    if (note.locked) return;

    const signatureData = `${note.noteId}|${clinicianId}|${new Date().toISOString()}|${note.assessment}`;
    const signatureHash = await sha256(signatureData);

    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              draftNote: {
                ...p.draftNote,
                clinicianReviewed: true,
                signedByClinicianId: clinicianId,
                signatureHash,
                signedAt: new Date().toISOString(),
                locked: true
              }
            }
          : p
      )
    );

    // Cryptographic audit log
    await appendAuditLog({
      actorId: clinicianId,
      actionType: 'SOAP_NOTE_SIGN',
      resourceType: 'SOAP_NOTE',
      resourceId: note.noteId,
      payloadSnapshot: {
        noteId: note.noteId,
        patientHash: note.patientHash,
        clinicianId,
        signatureHash,
        assessment: note.assessment
      }
    });

    setSigningSuccess(`Clinical SOAP Note locked and cryptographically signed by ${clinicianId}.`);
    setTimeout(() => setSigningSuccess(null), 5000);
  };

  const [facilitiesBeds, setFacilitiesBeds] = useState([
    { id: 'FAC-01', name: 'Mbagathi County Level 4 Hospital', county: 'Nairobi', totalBeds: 320, occupied: 268, icuBeds: 12, icuOccupied: 10 },
    { id: 'FAC-02', name: 'Kenyatta National Hospital (Level 6)', county: 'Nairobi', totalBeds: 1800, occupied: 1642, icuBeds: 60, icuOccupied: 58 },
    { id: 'FAC-03', name: 'Mama Lucy Kibaki Hospital (Level 5)', county: 'Nairobi', totalBeds: 450, occupied: 412, icuBeds: 16, icuOccupied: 15 },
    { id: 'FAC-04', name: 'Pumwani Maternity Hospital (Level 4)', county: 'Nairobi', totalBeds: 350, occupied: 295, icuBeds: 8, icuOccupied: 6 },
    { id: 'FAC-05', name: 'Kiambu Level 5 Hospital', county: 'Kiambu', totalBeds: 400, occupied: 310, icuBeds: 14, icuOccupied: 11 },
  ]);

  const [appointments, setAppointments] = useState([
    { id: 'APT-01', patientName: 'Fatuma Hassan', age: '28y', time: '09:00 AM', reason: 'Postnatal checkup & infant immunization', status: 'In Consultation', doctor: 'Dr. Arnold Omondi', room: 'Consultation Room 3' },
    { id: 'APT-02', patientName: 'Joseph Mwangi', age: '54y', time: '10:15 AM', reason: 'Hypertension follow-up & refill', status: 'Waiting', doctor: 'Dr. Arnold Omondi', room: 'Waiting Bay B' },
    { id: 'APT-03', patientName: 'Amina Abdi', age: '32y', time: '11:00 AM', reason: 'Fever and joint pain screening', status: 'Waiting', doctor: 'Dr. Arnold Omondi', room: 'Triage Waiting' },
    { id: 'APT-04', patientName: 'David Kiprono', age: '41y', time: '02:00 PM', reason: 'Diabetes management review', status: 'Scheduled', doctor: 'Dr. Arnold Omondi', room: 'Clinic 2' },
  ]);

  const handleAdjustBeds = (id: string, delta: number) => {
    setFacilitiesBeds(prev => prev.map(f => {
      if (f.id === id) {
        const newOcc = Math.max(0, Math.min(f.totalBeds, f.occupied + delta));
        return { ...f, occupied: newOcc };
      }
      return f;
    }));
  };

  if (activeTab === 'beds') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bed className="w-5 h-5 text-blue-600" />
                Hospital Ward & ICU Bed Management
              </h2>
              <p className="text-xs text-slate-500">
                Live county facility occupancy across Nairobi & Kiambu under Kenya MoH Master Facility List
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 w-fit">
              Regional Total: {facilitiesBeds.reduce((acc, f) => acc + f.occupied, 0)} / {facilitiesBeds.reduce((acc, f) => acc + f.totalBeds, 0)} Beds Occupied
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilitiesBeds.map(fac => {
            const pct = Math.round((fac.occupied / fac.totalBeds) * 100);
            return (
              <div key={fac.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{fac.name}</h3>
                    <p className="text-xs text-slate-500">{fac.county} County • ID: {fac.id}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    pct >= 90 ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    pct >= 80 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {pct}% Capacity
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>General Ward Occupancy</span>
                    <span className="font-semibold text-slate-800">{fac.occupied} / {fac.totalBeds} Beds</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct >= 90 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 pt-1">
                    <span>ICU / High Dependency: <strong className="text-slate-700">{fac.icuOccupied} / {fac.icuBeds}</strong></span>
                    <span>Available: <strong className="text-emerald-600 font-semibold">{fac.totalBeds - fac.occupied}</strong></span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Live Intake Adjustment:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdjustBeds(fac.id, -1)}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                      title="Discharge / Free bed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs font-semibold text-slate-800 w-8 text-center">{fac.occupied}</span>
                    <button
                      onClick={() => handleAdjustBeds(fac.id, 1)}
                      className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white cursor-pointer"
                      title="Admit patient"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeTab === 'appointments') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Outpatient Consultation Queue
            </h2>
            <p className="text-xs text-slate-500">
              Scheduled clinical appointments for Dr. Arnold Omondi • Today's Clinic
            </p>
          </div>
          <button
            onClick={() => alert('New appointment booking dialog')}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer shadow-sm w-fit"
          >
            + Book Outpatient Visit
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {appointments.map(apt => (
              <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{apt.patientName}</span>
                      <span className="text-xs text-slate-500 font-mono">({apt.age})</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        apt.status === 'In Consultation' ? 'bg-emerald-100 text-emerald-700' :
                        apt.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{apt.reason}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Time: {apt.time} • Room: {apt.room}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Starting consultation for ${apt.patientName}`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer"
                  >
                    Consult
                  </button>
                  <button
                    onClick={() => alert(`Rescheduling ${apt.patientName}`)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clinic Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">eCHIS Clinical Triage & Ambient Scribing Workspace</h2>
                <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-teal-300 border border-slate-700 font-mono">
                  Mbagathi County Level 4 Hospital
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged Clinician: <span className="text-white font-medium">Dr. Arnold Omondi (MBChB, Reg #44129)</span> | Facility ID: KE-HOSP-047-01
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-950/60 text-teal-300 border border-teal-800 rounded-lg text-xs font-mono">
              Human Signature Required
            </span>
          </div>
        </div>

        {signingSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{signingSuccess}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Urgency-Sorted Intake Queue */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                Urgency Triage Queue ({patients.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">MoH Triage Standard</span>
            </div>

            <div className="space-y-2.5">
              {patients.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => setSelectedPatientId(pat.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedPatient.id === pat.id
                      ? 'bg-slate-800 border-teal-500 shadow-md'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pat.urgency === 'RED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                          : pat.urgency === 'YELLOW'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      URGENCY: {pat.urgency}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{pat.ageBand}</span>
                  </div>

                  <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">{pat.chiefComplaint}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>RR: {pat.vitals.rr}/min</span>
                    <span>HR: {pat.vitals.hr} bpm</span>
                    <span>SpO2: {pat.vitals.spo2}%</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-mono">{pat.patientHash.slice(0, 16)}...</span>
                    <span
                      className={`font-medium ${
                        pat.draftNote.locked ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {pat.draftNote.locked ? 'Locked & Signed' : 'Draft Pending Review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 24-Hour Vital Waveform Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                24-Hour Vital Trends (Radar & Scribe)
              </span>
              <span className="text-[10px] text-teal-400 font-mono">{selectedPatient.id}</span>
            </h4>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedPatient.waveformHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="rr" name="Respiratory Rate" stroke="#14b8a6" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="hr" name="Heart Rate" stroke="#f43f5e" strokeWidth={1.5} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Draft SOAP Note & Review Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">AI Ambient Scribe Draft SOAP Note</h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      selectedPatient.draftNote.locked
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {selectedPatient.draftNote.locked ? 'LOCKED & SIGNED' : 'DRAFT FOR HUMAN REVIEW'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generated via Multi-Agent Clinical Scribing Engine with MoH RAG Grounding
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedPatient.draftNote.locked ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/50 border border-emerald-800 px-3 py-1.5 rounded-lg">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Signed: {selectedPatient.draftNote.signedByClinicianId}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSignSOAPNote}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Review & Digitally Sign Note</span>
                  </button>
                )}
              </div>
            </div>

            {/* SOAP Content Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px]">
                  [S] Subjective
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedPatient.draftNote.subjective}</p>
              </div>

              <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px]">
                  [O] Objective
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedPatient.draftNote.objective}</p>
              </div>

              <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px]">
                  [A] Assessment
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedPatient.draftNote.assessment}</p>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {selectedPatient.draftNote.icd11Codes.map((icd) => (
                    <span
                      key={icd.code}
                      className="px-2 py-0.5 rounded bg-slate-900 text-teal-300 border border-slate-700 font-mono text-[10px]"
                    >
                      ICD-11 {icd.code}: {icd.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-850 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px]">
                  [P] Plan
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedPatient.draftNote.plan}</p>
              </div>
            </div>

            {/* Feature Attribution Weights (Explainable AI) */}
            <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-teal-400" />
                  Clinical Feature-Attribution Weights (Explainable AI)
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">KernelSHAP Attribution</span>
              </div>

              <div className="space-y-2.5">
                {selectedPatient.draftNote.featureAttribution.map((feat, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{feat.featureName}</span>
                      <span className="font-mono text-teal-400 font-semibold">
                        {(feat.weight * 100).toFixed(0)}% Influence
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                        style={{ width: `${feat.weight * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Observed: {feat.observedValue} (Normal: {feat.baselineNormal})</span>
                      <span className="text-slate-500">{feat.clinicalSignificance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Citations */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span className="text-slate-300">
                  Grounded Citation: {selectedPatient.draftNote.citations[0]?.documentTitle} (
                  {selectedPatient.draftNote.citations[0]?.protocolSection})
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                Confidence: {(selectedPatient.draftNote.citations[0]?.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
