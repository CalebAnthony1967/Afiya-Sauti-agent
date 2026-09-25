import React from 'react';

const URGENCY_CONFIG = {
  RED: { label: 'Red — Emergency', classes: 'bg-red-100 text-red-700 border-red-300', dot: 'bg-red-500' },
  YELLOW: { label: 'Yellow — Urgent', classes: 'bg-amber-100 text-amber-700 border-amber-300', dot: 'bg-amber-500' },
  GREEN: { label: 'Green — Routine', classes: 'bg-green-100 text-green-700 border-green-300', dot: 'bg-green-500' },
  UNCERTAIN_EDGE_TRIAGE: { label: 'Uncertain — Escalated', classes: 'bg-orange-100 text-orange-700 border-orange-300', dot: 'bg-orange-500' },
};

export default function UrgencyBadge({ level, size = 'md' }) {
  const config = URGENCY_CONFIG[level] || URGENCY_CONFIG.GREEN;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.classes} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}