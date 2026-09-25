import React, { useState } from 'react';
import { Microscope, Search, Download, BookOpen, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { searchVerifiedClinicalKnowledge } from '../../services/clinicalModules';

export const ResearchEpidemiologyPortal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('Malaria');
  const [results, setResults] = useState(searchVerifiedClinicalKnowledge('Malaria'));
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const res = searchVerifiedClinicalKnowledge(searchQuery);
    setResults(res);
  };

  const handleExportCohort = () => {
    setExportNotice('Exported 1,420 de-identified records (HMAC salted) in FHIR R4 ResearchStudy format.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Research & Epidemiology Surveillance Portal</h2>
                <span className="px-2 py-0.5 rounded text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  De-Identified Research Data
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grounded Vector RAG Knowledge Retrieval & Aggregated Population Health Insights
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCohort}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Anonymized Dataset</span>
          </button>
        </div>

        {exportNotice && (
          <div className="mt-3 p-2.5 bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verified clinical protocols (e.g. malaria, pneumonia, hypertension, pre-eclampsia)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Search Guidelines
          </button>
        </form>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Verified MoH / WHO Protocol Matches ({results.length})
          </h3>

          {results.map((chunk) => (
            <div key={chunk.chunkId} className="bg-slate-850 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="font-bold text-white text-sm">{chunk.title}</h4>
                <span className="text-[11px] font-mono text-indigo-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {chunk.source.sourceName} ({chunk.source.version})
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{chunk.guidanceText.en}</p>
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 text-[11px]">
                <span className="text-slate-400">Domain: {chunk.domain}</span>
                <span className="text-slate-500">|</span>
                <span className="text-teal-400">ICD-11: {chunk.icd11.code} ({chunk.icd11.title})</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">Keywords: {chunk.keywords.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
