import React from 'react';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HEAT_POINTS = [
  { lat: -1.2864, lng: 36.8172, name: 'Nairobi', intensity: 0.8, type: 'respiratory' },
  { lat: -0.3031, lng: 36.08, name: 'Nakuru', intensity: 0.5, type: 'fever' },
  { lat: -4.0435, lng: 39.6682, name: 'Mombasa', intensity: 0.6, type: 'respiratory' },
  { lat: -0.0917, lng: 34.7683, name: 'Kisumu', intensity: 0.4, type: 'fever' },
  { lat: -1.0501, lng: 37.0833, name: 'Kiambu', intensity: 0.7, type: 'respiratory' },
  { lat: -3.3556, lng: 40.1164, name: 'Garissa', intensity: 0.3, type: 'fever' },
  { lat: 0.4167, lng: 35.9167, name: 'Eldoret', intensity: 0.45, type: 'respiratory' },
  { lat: -1.6333, lng: 37.4167, name: 'Machakos', intensity: 0.55, type: 'fever' },
];

export default function MohHeatmap() {
  const getColor = (intensity) => {
    if (intensity >= 0.7) return '#ef4444';
    if (intensity >= 0.5) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><MapPin className="w-5 h-5" /> County Heatmap — Respiratory & Fever Anomalies</h2>
      <div className="bg-white rounded-xl border overflow-hidden">
        <MapContainer center={[-0.5, 37.5]} zoom={7} style={{ height: '500px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          {HEAT_POINTS.map((p, i) => (
            <CircleMarker key={i} center={[p.lat, p.lng]} radius={p.intensity * 25} pathOptions={{ color: getColor(p.intensity), fillColor: getColor(p.intensity), fillOpacity: 0.4 }}>
              <Popup>
                <strong>{p.name}</strong><br />
                Type: {p.type}<br />
                Intensity: {(p.intensity * 100).toFixed(0)}%
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> High (≥70%)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> Medium (50-70%)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" /> Low (&lt;50%)</div>
      </div>
    </div>
  );
}