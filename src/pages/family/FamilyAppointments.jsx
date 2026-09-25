import React from 'react';
import { Users, Calendar, Pill, AlertTriangle } from 'lucide-react';

export default function FamilyAppointments() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Calendar className="w-5 h-5" /> Shared Appointments</h2>
      <p className="text-sm text-muted-foreground">View appointments for the patient you care for.</p>
      <div className="bg-white rounded-xl border p-4 text-sm text-muted-foreground">No upcoming appointments.</div>
    </div>
  );
}

export function FamilyMedications() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Pill className="w-5 h-5" /> Medication List</h2>
      <p className="text-sm text-muted-foreground">Help coordinate medication reminders.</p>
      <div className="bg-white rounded-xl border p-4 text-sm text-muted-foreground">No active medications.</div>
    </div>
  );
}

export function FamilyEmergency() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Emergency Contacts</h2>
      <div className="bg-white rounded-xl border p-4 space-y-3 text-sm">
        <div className="flex justify-between"><span>Emergency Services</span><span className="font-bold text-red-600">999</span></div>
        <div className="flex justify-between"><span>Poison Control</span><span className="font-medium">+254 20 271 6253</span></div>
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-800 text-xs">
          In a medical emergency, call 999 or go to the nearest health facility immediately.
        </div>
      </div>
    </div>
  );
}