import React, { useState } from 'react';
import { GraduationCap, Play, CheckCircle2, AlertTriangle, BookOpen, RotateCcw, Sparkles } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  category: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  patientProfile: string;
  vitals: string;
  dangerSigns: string[];
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
    protocolRef: string;
  }>;
}

export const TrainingSimulationPortal: React.FC = () => {
  const scenarios: Scenario[] = [
    {
      id: 'SCEN-01',
      title: 'Pediatric Pneumonia & Lower Chest Wall Indrawing',
      category: 'IMCI Child Health',
      difficulty: 'Intermediate',
      patientProfile: '9-month-old infant brought to community health unit with cough for 3 days and fast breathing.',
      vitals: 'RR: 52 breaths/min (IMCI threshold >50), Temp: 38.6°C, SpO2: 91% on room air.',
      dangerSigns: ['Lower chest wall indrawing', 'Inability to breastfeed', 'Stridor when calm'],
      options: [
        {
          id: 'opt-1',
          text: 'Prescribe oral paracetamol syrup and instruct caregiver to return after 5 days if fever persists.',
          isCorrect: false,
          feedback:
            'Incorrect & Dangerous: Chest indrawing in a 9-month-old is a critical red flag indicating severe pneumonia requiring urgent hospital referral and injectable antibiotics.',
          protocolRef: 'Kenya Basic Paediatric Protocols & IMCI 5th Ed. Section 3.2'
        },
        {
          id: 'opt-2',
          text: 'Administer pre-referral dose of oral Amoxicillin, initiate oxygen via nasal prongs, and facilitate immediate Level 4 referral.',
          isCorrect: true,
          feedback:
            'Correct: Meets MoH IMCI standard for severe pneumonia. Pre-referral antibiotic slows bacterial progression while immediate referral prevents hypoxic decompensation.',
          protocolRef: 'Kenya Basic Paediatric Protocols & IMCI 5th Ed. Chapter 3'
        },
        {
          id: 'opt-3',
          text: 'Advise steam inhalation at home and ask the mother to monitor chest movement.',
          isCorrect: false,
          feedback: 'Incorrect: Steam inhalation provides no benefit for lower respiratory tract alveolar infection.',
          protocolRef: 'WHO / Kenya MoH Paediatric Clinical Guidelines'
        }
      ]
    },
    {
      id: 'SCEN-02',
      title: 'Severe Pre-Eclampsia at 35 Weeks Gestation',
      category: 'Obstetric Emergencies',
      difficulty: 'Advanced',
      patientProfile: '24-year-old Primigravida presenting with severe epigastric pain, visual blurring, and elevated BP.',
      vitals: 'BP: 168/112 mmHg, Urine Protein: 3+, Reflexes: Hyperreflexic with 3 beats clonus.',
      dangerSigns: ['Severe hypertension (>160/110 mmHg)', 'Neurological visual aura', 'Epigastric tenderness'],
      options: [
        {
          id: 'opt-1',
          text: 'Administer loading dose Magnesium Sulphate (IV/IM Pritchard Regimen) and IV Hydralazine / oral Nifedipine.',
          isCorrect: true,
          feedback:
            'Correct: Magnesium Sulphate is the drug of choice for eclampsia prevention in Kenya Obstetric Protocols, paired with rapid blood pressure reduction.',
          protocolRef: 'Kenya National Obstetric Protocols Section 4.3'
        },
        {
          id: 'opt-2',
          text: 'Prescribe oral paracetamol for headache and recommend bed rest at home until full term.',
          isCorrect: false,
          feedback: 'Critical Error: Imminent risk of maternal seizure (eclampsia) and placental abruption.',
          protocolRef: 'Kenya National Obstetric Protocols Section 4.3'
        }
      ]
    }
  ];

  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [scoreCount, setScoreCount] = useState({ correct: 0, total: 0 });

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    const opt = activeScenario.options.find((o) => o.id === optId);
    if (opt) {
      setScoreCount((prev) => ({
        correct: prev.correct + (opt.isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    }
  };

  const selectedOpt = activeScenario.options.find((o) => o.id === selectedOptionId);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Training & Clinical Simulation Portal</h2>
                <span className="px-2 py-0.5 rounded text-[11px] bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                  CPD Certified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Safe Clinical Practice Environment for Clinicians, Nurses, and CHPs with Grounded AI Feedback
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Simulation Score:</span>
            <span className="font-bold text-teal-400 font-mono">
              {scoreCount.correct} / {scoreCount.total} Correct
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenarios List */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Scenario Library</h3>
            <div className="space-y-2">
              {scenarios.map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => {
                    setActiveScenario(scen);
                    setSelectedOptionId(null);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeScenario.id === scen.id
                      ? 'bg-slate-800 border-purple-500'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-purple-400 font-mono font-semibold">{scen.category}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{scen.difficulty}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{scen.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Simulation Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono text-purple-400">{activeScenario.id}</span>
              <h3 className="text-base font-bold text-white mt-0.5">{activeScenario.title}</h3>
            </div>

            {/* Case Background */}
            <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-200 leading-relaxed">
                <strong className="text-white">Patient Presentation:</strong> {activeScenario.patientProfile}
              </p>
              <p className="text-slate-300 font-mono">
                <strong className="text-teal-400">Vitals & Assessment:</strong> {activeScenario.vitals}
              </p>
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                {activeScenario.dangerSigns.map((ds, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800 text-[10px]"
                  >
                    ⚠️ {ds}
                  </span>
                ))}
              </div>
            </div>

            {/* Decision Options */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300">
                Select Recommended Clinical Action according to Kenya MoH Guidelines:
              </label>

              {activeScenario.options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all text-xs ${
                    selectedOptionId === opt.id
                      ? opt.isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-500 text-rose-200'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <p>{opt.text}</p>
                </div>
              ))}
            </div>

            {/* Grounded Clinical Feedback Box */}
            {selectedOpt && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  selectedOpt.isCorrect
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {selectedOpt.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{selectedOpt.isCorrect ? 'Correct Clinical Action' : 'Action Suboptimal / Inadvisable'}</span>
                </div>
                <p className="leading-relaxed">{selectedOpt.feedback}</p>
                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  Verified Reference: {selectedOpt.protocolRef}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
