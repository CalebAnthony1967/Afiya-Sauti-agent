import React from 'react';
import TriageInterface from '@/components/TriageInterface';
import { Stethoscope } from 'lucide-react';

export default function ChpTriage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Field Triage</h2>
      <TriageInterface channel="mobile" />
    </div>
  );
}