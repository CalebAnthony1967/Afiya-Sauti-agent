import React, { useState } from 'react';
import GlobalHealthcareAgent from '@/components/ai/GlobalHealthcareAgent';
import { Bot, Sparkles, MessageSquare, Radio, MapPin, Search } from 'lucide-react';

export default function HealthcareChatbot() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <GlobalHealthcareAgent
        isOpen={isOpen}
        onClose={() => {}}
        currentRole="general"
      />
    </div>
  );
}
