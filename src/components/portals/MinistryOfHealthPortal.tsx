import React, { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  FileUp,
  MapPin,
  TrendingUp,
  ShieldAlert,
  Radio,
  CheckCircle2,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { KENYA_COUNTIES, INITIAL_OUTBREAK_SIGNALS, CountyData } from '../../data/mockData';
import { OutbreakSignal } from '../../types';
import { appendAuditLog } from '../../services/safety';

export const MinistryOfHealthPortal: React.FC = () => {
  const [counties, setCounties] = useState<CountyData[]>(KENYA_COUNTIES);
  const [outbreakSignals, setOutbreakSignals] = useState<OutbreakSignal[]>(INITIAL_OUTBREAK_SIGNALS);
  const [selectedCounty, setSelectedCounty] = useState<CountyData>(KENYA_COUNTIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAlert, setFilterAlert] = useState<'ALL' | 'WARNING' | 'OUTBREAK_CONFIRMED'>('ALL');

  // Protocol upload state
  const [newProtocolTitle, setNewProtocolTitle] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const filteredCounties = counties.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.includes(searchQuery);
    if (filterAlert === 'ALL') return matchesSearch;
    return matchesSearch && c.alertLevel === filterAlert;
  });

  const handleUploadProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProtocolTitle) return;

    await appendAuditLog({
      actorId: 'MOH_EPIDEMIOLOGY_DIRECTOR',
      actionType: 'ADMIN_CONFIG_CHANGE',
      resourceType: 'SYSTEM',
      resourceId: 'PROTOCOL_DISTRIBUTION',
      payloadSnapshot: {
        title: newProtocolTitle,
        version: 'v6.2-2026-MOH',
        distributedFacilities: 4700,
        distributedCHPs: 104000
      }
    });

    setUploadSuccess(`Protocol "${newProtocolTitle}" distributed across all 47 counties via eCHIS.`);
    setNewProtocolTitle('');
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* MoH Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Ministry of Health – National Public Health Intelligence</h2>
                <span className="px-2 py-0.5 rounded text-[11px] bg-red-950 text-red-300 border border-red-800 font-mono">
                  MoH Kenya Afya House
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Division of Disease Surveillance & Epidemic Response | 47 Counties eCHIS Real-Time Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
              <span className="text-slate-500">Active CHPs Deployed:</span>{' '}
              <strong className="text-teal-400 font-mono">104,820</strong>
            </div>
            <div className="bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
              <span className="text-slate-500">Facility Accreditation:</span>{' '}
              <strong className="text-emerald-400 font-mono">98.2% UHC</strong>
            </div>
          </div>
        </div>

        {uploadSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}
      </div>

      {/* Outbreak Alert Banners */}
      <div className="space-y-3">
        {outbreakSignals.map((signal) => (
          <div
            key={signal.id}
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              signal.alertLevel === 'OUTBREAK_CONFIRMED'
                ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {signal.countyName} County ({signal.subCounty}): {signal.syndrome.replace('_', ' ')} Spike
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                    {signal.alertLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  7-Day Case Count: <strong className="text-white">{signal.caseCount7Days}</strong> (Baseline Expected:{' '}
                  {signal.baselineExpected}) — Anomaly Ratio:{' '}
                  <strong className="text-rose-400">{signal.anomalyRatio}x</strong> normal threshold.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sources: {signal.sourceStreams.join(' • ')} | Protocol: {signal.mohProtocolRef}
                </p>
              </div>
            </div>

            <button
              onClick={() => alert(`Dispatching rapid response team to ${signal.countyName}...`)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold self-start sm:self-center transition-colors cursor-pointer"
            >
              Dispatch Rapid Response Team
            </button>
          </div>
        ))}
      </div>

      {/* GIS County Anomaly Heatmap & Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* County Heatmap Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  County Anomaly Heatmap (Respiratory & Fever Telemetry)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aggregated from WhatsApp triage, USSD *384#, eCHIS, and in-home radar nodes
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search county..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <select
                  value={filterAlert}
                  onChange={(e) => setFilterAlert(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="WARNING">Warnings</option>
                  <option value="OUTBREAK_CONFIRMED">Outbreaks</option>
                </select>
              </div>
            </div>

            {/* County Heatmap Bento Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredCounties.map((county) => (
                <div
                  key={county.code}
                  onClick={() => setSelectedCounty(county)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCounty.code === county.code
                      ? 'bg-slate-800 border-teal-500 shadow-md ring-1 ring-teal-500'
                      : county.alertLevel === 'OUTBREAK_CONFIRMED'
                      ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-700'
                      : county.alertLevel === 'WARNING'
                      ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-700'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400">#{county.code}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        county.alertLevel === 'OUTBREAK_CONFIRMED'
                          ? 'bg-rose-500 animate-ping'
                          : county.alertLevel === 'WARNING'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    ></span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-1">{county.name}</h4>
                  <div className="mt-2 text-[10px] space-y-0.5 text-slate-400">
                    <div>Fever: {county.feverAnomalyRate}x</div>
                    <div>Resp: {county.respiratoryAnomalyRate}x</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: County Detailed Profile & Protocol Distribution */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>{selectedCounty.name} County Profile</span>
              <span className="text-[11px] font-mono text-teal-400">Code {selectedCounty.code}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400">Population:</span>
                <span className="font-semibold text-white">{selectedCounty.population.toLocaleString()}</span>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400">Health Facilities:</span>
                <span className="font-semibold text-white">{selectedCounty.healthFacilities}</span>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400">Active CHPs on eCHIS:</span>
                <span className="font-semibold text-teal-400">{selectedCounty.activeCHPs.toLocaleString()}</span>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-400">Primary Syndrome:</span>
                <span className="font-semibold text-rose-300">{selectedCounty.primarySyndrome}</span>
              </div>
            </div>
          </div>

          {/* Protocol Distribution Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <FileUp className="w-4 h-4 text-teal-400" />
              Upload & Distribute MoH Guideline
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Publish updated clinical protocols to all 47 counties. Automated RAG embeddings and push notifications
              will be sent to all health facilities.
            </p>

            <form onSubmit={handleUploadProtocol} className="space-y-2.5">
              <input
                type="text"
                value={newProtocolTitle}
                onChange={(e) => setNewProtocolTitle(e.target.value)}
                placeholder="e.g. Kenya Emergency Cholera Response Standard v3.1"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign & Distribute Nationally
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
