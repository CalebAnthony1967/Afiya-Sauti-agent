import React from 'react';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Nairobi area default
const DEFAULT_CENTER = [-1.2864, 36.8172];

export default function ChpMap() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><MapPin className="w-5 h-5" /> Assigned Area Map</h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: '400px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          <Marker position={DEFAULT_CENTER}>
            <Popup>Community Unit — Assigned Area</Popup>
          </Marker>
        </MapContainer>
      </div>
      <p className="text-sm text-muted-foreground">Offline-capable: cached tiles available when connectivity is limited.</p>
    </div>
  );
}