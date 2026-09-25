import React from 'react';
import CriticalAlertSystem from '@/components/clinician/CriticalAlertSystem';
import TriageDashboard from '@/components/clinician/TriageDashboard';

export default function ClinicianDashboard() {
  return (
    <div className="space-y-6">
      <CriticalAlertSystem />
      <TriageDashboard />
    </div>
  );
}