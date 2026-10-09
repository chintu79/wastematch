'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MatchEvaluation, TechnicalStatus } from '@/types/match';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  matches: MatchEvaluation[];
  getBatchLabel: (id: string) => any;
  getSpecLabel: (id: string) => any;
  onSendInquiry: (match: MatchEvaluation) => void;
  radiusKm?: number;
  center?: [number, number];
}

// Rough coordinates for Pune industrial zones
const LOCATIONS: Record<string, [number, number]> = {
  'Bhosari MIDC, Pune': [18.6322, 73.8291],
  'Chakan Phase III, Pune': [18.7500, 73.8500],
  'Talegaon MIDC, Pune': [18.7300, 73.6800],
  'Kurkumbh MIDC': [18.4000, 74.5200]
};

export default function InteractiveMap({ matches, getBatchLabel, getSpecLabel, onSendInquiry, radiusKm = 100, center = [18.5204, 73.8567] }: InteractiveMapProps) {
  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
      <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Buyer center radius */}
        <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: 'purple', fillColor: 'purple', fillOpacity: 0.1 }} />

        <MarkerClusterGroup>
          {matches.map(match => {
            const batch = getBatchLabel(match.material_batch_id);
            const spec = getSpecLabel(match.buyer_specification_id);
            const position = LOCATIONS[batch.location] || [center[0] + (Math.random() - 0.5) * 0.1, center[1] + (Math.random() - 0.5) * 0.1];
            
            return (
              <Marker key={match.id} position={position as [number, number]}>
                <Popup className="rounded-lg shadow-sm p-0 m-0 custom-popup">
                  <div className="p-1 space-y-3 w-64">
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">{batch.title}</h4>
                      <div className="text-xs text-slate-500 mt-1">{batch.location}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Volume</div>
                        <div className="font-medium text-slate-800">{batch.volume}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Match Score</div>
                        <div className="font-medium text-slate-800">{match.compatibility_score}%</div>
                      </div>
                    </div>
                    
                    <div>
                        <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-1">Target spec</div>
                        <div className="text-xs text-slate-700 font-medium">{spec.target_material}</div>
                    </div>
                    
                    <Button 
                      onClick={(e) => {
                          e.stopPropagation();
                          onSendInquiry(match);
                      }} 
                      size="sm" 
                      className="w-full text-xs h-7"
                    >
                      Request info
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
