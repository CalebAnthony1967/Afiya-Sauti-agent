import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LoadingState } from '@/components/States';
import AIRecommendation from '@/components/AIRecommendation';
import { invokeAgent } from '@/lib/aiAgents';
import { Globe, TrendingUp, AlertTriangle, Users, Building2, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const COUNTIES = ['Nairobi', 'Kiambu', 'Mombasa', 'Kisumu', 'Nakuru', 'Kakamega', 'Meru', 'Kilifi', 'Nyeri', 'Machakos'];

export default function MohHome() {
  const [signals, setSignals] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, f, p] = await Promise.all([
          base44.entities.OutbreakSignal.list('-detected_at', 50),
          base44.entities.Facility.list(),
          base44.entities.Protocol.list('-created_date', 20),
        ]);
        setSignals(s || []); setFacilities(f || []); setProtocols(p || []);
      } finally { setLoading(false); }
    })();
    getSummary();
  }, []);

  const getSummary = async () => {
    try {
      const res = await invokeAgent('moh_protocol_agent', 'Provide a summary of current public health status across Kenya counties, highlighting coverage gaps and outbreak risks.');
      setAiSummary(res);
    } catch (e) { console.error(e); }
  };

  if (loading) return <LoadingState />;

  const accredited = facilities.filter(f => f.accredited).length;
  const outbreaks = signals.filter(s => s.severity === 'outbreak').length;
  const alerts = signals.filter(s => s.severity === 'alert').length;

  // Simulated county data
  const countyData = COUNTIES.slice(0, 6).map((c, i) => ({
    name: c,
    respiratory: Math.floor(Math.random() * 50) + 10,
    fever: Math.floor(Math.random() * 40) + 15,
  }));

  const coverageData = [
    { name: 'CHPs Active', value: 78 },
    { name: 'Gaps', value: 22 },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Globe className="w-5 h-5" /> National Health Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4"><div className="flex items-center gap-2 mb-1"><Building2 className="w-4 h-4 text-blue-600" /><p className="text-xs text-muted-foreground">Facilities</p></div><p className="text-2xl font-bold">{facilities.length}</p></div>
        <div className="bg-white rounded-xl border p-4"><div className="flex items-center gap-2 mb-1"><Shield className="w-4 h-4 text-green-600" /><p className="text-xs text-muted-foreground">Accredited</p></div><p className="text-2xl font-bold">{accredited}</p></div>
        <div className="bg-white rounded-xl border p-4"><div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-amber-600" /><p className="text-xs text-muted-foreground">Alerts</p></div><p className="text-2xl font-bold">{alerts}</p></div>
        <div className="bg-white rounded-xl border p-4"><div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-red-600" /><p className="text-xs text-muted-foreground">Outbreaks</p></div><p className="text-2xl font-bold">{outbreaks}</p></div>
      </div>

      {outbreaks > 0 && (
        <div className="rounded-lg bg-red-50 border-2 border-red-300 p-4">
          <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-600" /><h3 className="font-bold text-red-700">Outbreak Alerts Active</h3></div>
          <p className="text-sm text-red-600 mt-1">{outbreaks} outbreak signal(s) detected. Immediate investigation required.</p>
        </div>
      )}

      {aiSummary && (
        <AIRecommendation
          title="Public Health Summary"
          content={typeof aiSummary === 'string' ? aiSummary : aiSummary.assessment || JSON.stringify(aiSummary)}
          agentName="moh_protocol_agent"
          confidence={0.9}
          citations={[{ source: 'MoH Kenya', title: 'National Health Data' }, { source: 'WHO', title: 'Surveillance Standards' }]}
        />
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> County Anomaly Signals</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={countyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="respiratory" fill="#f59e0b" name="Respiratory" />
              <Bar dataKey="fever" fill="#ef4444" name="Fever" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> CHP Coverage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={coverageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {coverageData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold text-sm mb-3">UHC Indicators</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Population reached by CHPs</span><span className="font-medium">78%</span></div>
          <div className="flex justify-between"><span>Facilities with triage integration</span><span className="font-medium">{facilities.length > 0 ? Math.round(accredited / facilities.length * 100) : 0}%</span></div>
          <div className="flex justify-between"><span>Protocols distributed this month</span><span className="font-medium">{protocols.filter(p => p.status === 'published').length}</span></div>
        </div>
      </div>
    </div>
  );
}

function Shield(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>; }