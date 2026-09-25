import React, { useState } from 'react';
import { invokeAgent } from '@/lib/aiAgents';
import AIRecommendation from '@/components/AIRecommendation';
import { LoadingState } from '@/components/States';
import { Stethoscope, Send } from 'lucide-react';

export default function TrainingPractice() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'trainee', text: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await invokeAgent('training_agent', `Trainee says: ${input}. Respond as a simulated patient. Keep responses brief.`, {
        responseSchema: {
          type: 'object',
          properties: {
            patient_response: { type: 'string' },
            feedback: { type: 'string' },
          },
        },
      });
      setMessages(m => [...m, { role: 'patient', text: res.patient_response || (typeof res === 'string' ? res : '') }]);
      if (res.feedback) setFeedback(res.feedback);
    } finally { setLoading(false); }
  };

  const endSession = async () => {
    setLoading(true);
    try {
      const res = await invokeAgent('training_agent', 'Provide grounded feedback on this practice session.', {
        responseSchema: {
          type: 'object',
          properties: {
            feedback: { type: 'string' },
            strengths: { type: 'array', items: { type: 'string' } },
            improvements: { type: 'array', items: { type: 'string' } },
            citations: { type: 'array', items: { type: 'object' } },
          },
        },
      });
      setFeedback(res.feedback + '\n\nStrengths: ' + (res.strengths || []).join(', ') + '\nImprovements: ' + (res.improvements || []).join(', '));
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Practice Session</h2>
      <p className="text-sm text-muted-foreground">Interact with a simulated patient. No real patient data.</p>

      <div className="bg-white rounded-xl border p-4 min-h-[300px] space-y-2">
        {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Start by asking the patient about their complaint...</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'trainee' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${m.role === 'trainee' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
              <span className="text-xs font-medium block mb-0.5">{m.role === 'trainee' ? 'You' : 'Simulated Patient'}</span>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-center"><LoadingState message="Patient responding..." /></div>}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask the patient..." className="flex-1 rounded-lg border px-3 py-2 text-sm min-h-[44px]" />
        <button onClick={send} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px] disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </div>

      <button onClick={endSession} disabled={loading || messages.length === 0} className="w-full px-4 py-2.5 rounded-lg bg-violet-100 text-violet-700 text-sm font-medium min-h-[44px] disabled:opacity-50">
        End Session & Get Feedback
      </button>

      {feedback && (
        <AIRecommendation title="Practice Feedback" content={feedback} agentName="training_agent" confidence={0.9} citations={[{ source: 'IMCI', title: 'Training Standards' }]} />
      )}
    </div>
  );
}