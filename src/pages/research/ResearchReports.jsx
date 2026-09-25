import React from 'react';
import { FileText, FileDown } from 'lucide-react';

export default function ResearchReports() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Exportable Reports</h2>
      <p className="text-sm text-muted-foreground">Generate and download research reports from your queries.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border p-4">
          <FileText className="w-8 h-8 text-blue-600 mb-2" />
          <p className="font-medium text-sm">Malaria Surveillance Report</p>
          <p className="text-xs text-muted-foreground mt-1">Aggregated case data, trends, and citations.</p>
          <button className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium min-h-[44px]">
            <FileDown className="w-4 h-4" /> Download PDF
          </button>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <FileText className="w-8 h-8 text-violet-600 mb-2" />
          <p className="font-medium text-sm">Respiratory Anomaly Report</p>
          <p className="text-xs text-muted-foreground mt-1">Edge telemetry analysis with FHIR export.</p>
          <button className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium min-h-[44px]">
            <FileDown className="w-4 h-4" /> Download FHIR Bundle
          </button>
        </div>
      </div>
    </div>
  );
}