import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { generateSoapNote } from '@/lib/aiAgents';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState, EmptyState } from '@/components/States';
import { FileText, Save, PenLine, Lock } from 'lucide-react';
import { signNote } from '@/lib/safety';

export default function ClinicianScribe() {
  const [input, setInput] = useState('');
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [signing, setSigning] = useState(null);

  useEffect(() => { loadNotes(); }, []);
  const loadNotes = async () => {
    try { setNotes(await base44.entities.ClinicalSoapNote.list('-created_date', 20) || []); }
    catch (e) { console.error(e); }
  };

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await generateSoapNote({ inputText: input, clinicianId: 'self', sessionId: 'draft' });
      setDraft(result);
    } finally { setLoading(false); }
  };

  const saveDraft = async () => {
    if (!draft) return;
    await base44.entities.ClinicalSoapNote.create({
      session_id: 'draft',
      clinician_id: 'self',
      subjective: draft.subjective,
      objective: draft.objective,
      assessment: draft.assessment,
      plan: draft.plan,
      icd11_codes: draft.icd11_codes || [],
      citations: draft.citations || [],
      feature_attribution_weights: draft.feature_attribution_weights || {},
      ai_draft: true,
      signed: false,
      locked: false,
    });
    setDraft(null);
    setInput('');
    loadNotes();
  };

  const sign = async (note) => {
    setSigning(note.id);
    try {
      const sigHash = await signNote(note.id, 'self', note.assessment || '');
      await base44.entities.ClinicalSoapNote.update(note.id, {
        signed: true,
        signed_by: 'self',
        signed_at: new Date().toISOString(),
        signature_hash: sigHash,
        locked: true,
      });
      loadNotes();
    } finally { setSigning(null); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Ambient Scribe</h2>
      <p className="text-sm text-muted-foreground">AI generates draft SOAP notes. Clinician review and signature required.</p>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Dictate or type clinical encounter..." rows={5} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none" />
        <button onClick={generate} disabled={loading || !input.trim()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px] disabled:opacity-50">
          {loading ? <LoadingState message="Drafting..." /> : <><PenLine className="w-4 h-4" /> Generate Draft SOAP</>}
        </button>
      </div>

      {draft && (
        <div className="space-y-3">
          <AIRecommendation
            title="Draft SOAP Note"
            agentName="scribe_agent"
            confidence={0.85}
            citations={draft.citations || [{ source: 'WHO', title: 'Clinical Guidelines' }]}
          >
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">S:</span> {draft.subjective}</div>
              <div><span className="font-semibold">O:</span> {draft.objective}</div>
              <div><span className="font-semibold">A:</span> {draft.assessment}</div>
              <div><span className="font-semibold">P:</span> {draft.plan}</div>
              {draft.icd11_codes?.length > 0 && <div><span className="font-semibold">ICD-11:</span> {draft.icd11_codes.join(', ')}</div>}
              {draft.feature_attribution_weights && Object.keys(draft.feature_attribution_weights).length > 0 && (
                <div>
                  <span className="font-semibold">Feature Attribution:</span>
                  <ul className="ml-4 mt-1">
                    {Object.entries(draft.feature_attribution_weights).map(([k, v]) => (
                      <li key={k} className="text-xs">• {k}: {(Number(v) * 100).toFixed(0)}%</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AIRecommendation>
          <button onClick={saveDraft} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium min-h-[44px]">
            <Save className="w-4 h-4" /> Save Draft for Review
          </button>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Draft Notes Awaiting Signature</h3>
        {notes.filter(n => !n.signed).length === 0 ? (
          <EmptyState icon={FileText} title="No drafts pending" />
        ) : (
          <div className="space-y-2">
            {notes.filter(n => !n.signed).map(n => (
              <div key={n.id} className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-sm"><span className="font-medium">Assessment:</span> {n.assessment}</p>
                <button onClick={() => sign(n)} disabled={signing === n.id} className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium min-h-[44px]">
                  {signing === n.id ? <LoadingState message="Signing..." /> : <><Lock className="w-4 h-4" /> Sign & Lock</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2">Signed & Locked Notes</h3>
        {notes.filter(n => n.signed).length === 0 ? (
          <p className="text-sm text-muted-foreground">No signed notes yet.</p>
        ) : (
          <div className="space-y-2">
            {notes.filter(n => n.signed).map(n => (
              <div key={n.id} className="bg-green-50 rounded-lg border border-green-200 p-4">
                <p className="text-sm"><span className="font-medium">Assessment:</span> {n.assessment}</p>
                <p className="text-xs text-green-700 mt-1">Signed by {n.signed_by} at {n.signed_at ? new Date(n.signed_at).toLocaleString() : ''}</p>
                <p className="text-xs text-green-600 mt-0.5">Signature: {n.signature_hash?.substring(0, 16)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}