import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function RegionalLogistics() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Logistics Overview</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm font-medium">Medical Supplies</p>
          <p className="text-xs text-muted-foreground mt-1">Stock levels across regional facilities</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Antimalarials</span><span className="text-green-600 font-medium">In stock</span></div>
            <div className="flex justify-between"><span>Antibiotics</span><span className="text-amber-600 font-medium">Low</span></div>
            <div className="flex justify-between"><span>RDT kits</span><span className="text-green-600 font-medium">In stock</span></div>
            <div className="flex justify-between"><span>Oxygen cylinders</span><span className="text-red-600 font-medium">Critical</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm font-medium">Transport & Dispatch</p>
          <p className="text-xs text-muted-foreground mt-1">CHP dispatch status</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Active dispatches</span><span>12</span></div>
            <div className="flex justify-between"><span>En route</span><span>5</span></div>
            <div className="flex justify-between"><span>On site</span><span>4</span></div>
            <div className="flex justify-between"><span>Resolved</span><span>3</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}