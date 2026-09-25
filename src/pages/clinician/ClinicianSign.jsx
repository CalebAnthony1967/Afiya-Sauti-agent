import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState, EmptyState } from '@/components/States';
import { signNote } from '@/lib/safety';
import { ShieldCheck, Lock } from 'lucide-react';

export default function ClinicianSign() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { setNotes(await base44.entities.ClinicalSoapNote.list('-created_date', 50) || []); }
    finally { setLoading(false); }
  };

  const sign = async (note) => {
    setSigning(note.id);
    try {
      const sigHash = await signNote(note.id, 'self', note.assessment || '');
      await base44.entities.ClinicalSoapNote.update(note.id, {
        signed: true, signed_by: 'self', signed_at: new Date().toISOString(),
        signature_hash: sigHash, locked: true,
      });
      load();
    } finally { setSigning(null); }
  };

  if (loading) return <LoadingState />;

  const unsigned = notes.filter(n => !n.signed);
  const signed = notes.filter(n => n.signed);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Signing Workspace</h2>
      <p className="text-sm text-muted-foreground">Review and sign draft SOAP notes. Signed notes are cryptographically locked.</p>

      <div>
        <h3 className="font-semibold mb-2">Awaiting Signature ({unsigned.length})</h3>
        {unsigned.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Nothing to sign" />
        ) : (
          <div className="space-y-2">
            {unsigned.map(n => (
              <div key={n.id} className="bg-white rounded-lg border p-4">
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">S:</span> {n.subjective}</p>
                  <p><span className="font-medium">O:</span> {n.objective}</p>
                  <p><span className="font-medium">A:</span> {n.assessment}</p>
                  <p><span className="font-medium">P:</span> {n.plan}</p>
                </div>
                <button onClick={() => sign(n)} disabled={signing === n.id} className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium min-h-[44px]">
                  {signing === n.id ? <LoadingState message="Signing..." /> : <><Lock className="w-4 h-4" /> Sign & Lock Record</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2">Signed Records ({signed.length})</h3>
        {signed.length === 0 ? <p className="text-sm text-muted-foreground">No signed records.</p> : (
          <div className="space-y-2">
            {signed.map(n => (
              <div key={n.id} className="bg-green-50 rounded-lg border border-green-200 p-3">
                <p className="text-sm">{n.assessment}</p>
                <p className="text-xs text-green-700 mt-1">Signed {n.signed_at ? new Date(n.signed_at).toLocaleString() : ''} · Hash: {n.signature_hash?.substring(0, 20)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}