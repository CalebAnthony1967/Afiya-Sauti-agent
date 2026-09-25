import React from 'react';
import ClinicalAnalytics from '@/components/clinician/ClinicalAnalytics';
import GoogleSheetsExport from '@/components/clinician/GoogleSheetsExport';

export default function ClinicianAnalyticsPage() {
  return (
    <div className="space-y-6">
      <ClinicalAnalytics />
      <GoogleSheetsExport />
    </div>
  );
}