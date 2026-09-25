import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { GraduationCap, Plus, X, Play } from 'lucide-react';

export default function TrainingHome() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', domain_module: 'general', initial_complaint: '', difficulty: 'intermediate', patient_persona: '' });

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setScenarios(await base44.entities.TrainingScenario.list('-created_date', 50) || []); }
    finally { setLoading(false); }
  };

  const create = async () => {
    if (!form.title || !form.initial_complaint) return;
    await base44.entities.TrainingScenario.create({ ...form, target_role: 'both', correct_steps: [] });
    setForm({ title: '', domain_module: 'general', initial_complaint: '', difficulty: 'intermediate', patient_persona: '' });
    setShowForm(false); load();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Scenario Library</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'New Scenario'}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">Safe practice environment. No real patient data used.</p>

      {showForm && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <input type="text" placeholder="Scenario title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
          <textarea placeholder="Initial patient complaint" value={form.initial_complaint} onChange={e => setForm({ ...form, initial_complaint: e.target.value })} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm resize-none" />
          <textarea placeholder="Patient persona description" value={form.patient_persona} onChange={e => setForm({ ...form, patient_persona: e.target.value })} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.domain_module} onChange={e => setForm({ ...form, domain_module: e.target.value })} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
              <option value="maternal_child">Maternal & Child</option>
              <option value="ncd">NCD</option>
              <option value="infectious">Infectious</option>
              <option value="mental_health">Mental Health</option>
              <option value="emergency">Emergency</option>
              <option value="general">General</option>
            </select>
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="rounded-lg border px-3 py-2 text-sm min-h-[44px]">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button onClick={create} className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px]">Create Scenario</button>
        </div>
      )}

      {scenarios.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No scenarios" description="Create practice scenarios for clinicians and CHPs." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {scenarios.map(s => (
            <div key={s.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{s.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.difficulty === 'advanced' ? 'bg-red-100 text-red-700' : s.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{s.difficulty}</span>
              </div>
              <p className="text-xs text-muted-foreground capitalize">{s.domain_module.replace('_', ' ')}</p>
              <p className="text-sm text-slate-700 mt-2">"{s.initial_complaint}"</p>
              {s.patient_persona && <p className="text-xs text-muted-foreground mt-1">{s.patient_persona}</p>}
              <Link to="/training/practice" className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-100 text-violet-700 text-sm font-medium min-h-[44px] w-full">
                <Play className="w-4 h-4" /> Start Practice
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}