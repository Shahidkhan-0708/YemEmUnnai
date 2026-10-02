import { useEffect, useRef, useState } from 'react';
import { X, MapPin, LocateFixed } from 'lucide-react';
import { useModalA11y } from '../lib/useModalA11y';
import type { FoodItem } from '../lib/types';

interface WalkInMapModalProps { isOpen: boolean; item: FoodItem | null; onClose: () => void }
export function WalkInMapModal({ isOpen, item, onClose }: WalkInMapModalProps) {
  const root = useModalA11y<HTMLDivElement>(isOpen && !!item, onClose);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState('Use your location to estimate the distance.');
  const [locating, setLocating] = useState(false);
  const generation = useRef(0);
  useEffect(() => {
    const counter = generation;
    counter.current++;
    return () => { counter.current++; };
  }, [isOpen, item?.id]);
  if (!isOpen || !item) return null;
  const hasCoordinates = Number.isFinite(item.latitude) && Number.isFinite(item.longitude);
  const locate = () => {
    if (!navigator.geolocation) { setLocationStatus('Location is unavailable in this browser. Open Google Maps for directions.'); return; }
    const revision = generation.current;
    setLocating(true); setLocationStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(position => {
      if (revision !== generation.current) return;
      const rad = Math.PI / 180;
      const a = Math.sin((item.latitude! - position.coords.latitude) * rad / 2) ** 2 + Math.cos(position.coords.latitude * rad) * Math.cos(item.latitude! * rad) * Math.sin((item.longitude! - position.coords.longitude) * rad / 2) ** 2;
      setDistance(Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
      setLocationStatus('Straight-line estimate. Open Maps for the walking route.'); setLocating(false);
    }, () => {
      if (revision !== generation.current) return;
      setLocationStatus('Unable to get your location. Allow location access or open Google Maps.'); setLocating(false);
    }, { timeout: 8000, maximumAge: 60000 });
  };
  const destination = hasCoordinates ? `${item.latitude},${item.longitude}` : `${item.vendor}, MITS, Madanapalle`;
  const mapsUrl = hasCoordinates ? `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${encodeURIComponent(destination)}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
  return (
    <div className="consumer-ui campus-overlay" onClick={onClose}>
      <div ref={root} role="dialog" aria-modal="true" aria-labelledby="map-title" className="campus-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-header"><div><p className="campus-eyebrow">{item.isOnCampus === false ? 'Just off campus' : 'Around MITS'}</p><h2 id="map-title">Find {item.vendor}</h2></div><button className="campus-icon" aria-label="Close map" onClick={onClose}><X aria-hidden="true" /></button></header>
        <div className="campus-map"><svg viewBox="0 0 360 270" role="img" aria-label="Illustrative campus map. Use Google Maps for the actual route.">
          <defs><pattern id="campus-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#192D23" /></pattern></defs>
          <rect width="360" height="270" fill="url(#campus-grid)" />
          <g fill="#192D23" stroke="#425E4F"><rect x="24" y="30" width="80" height="70" rx="12" /><rect x="190" y="22" width="144" height="64" rx="12" /><rect x="32" y="168" width="104" height="72" rx="12" /><rect x="238" y="164" width="92" height="80" rx="12" /></g>
          <g fill="#B7C9BF" fontSize="12" textAnchor="middle"><text x="64" y="68">Library</text><text x="262" y="58">Main block</text><text x="84" y="208">Hostels</text><text x="284" y="209">Food court</text></g>
          <path d="M0 132H360M164 0V270" stroke="#425E4F" strokeWidth="12" />
          <circle cx="164" cy="132" r="22" fill="#10B981" /><path d="M164 146s-10-11-10-18a10 10 0 1120 0c0 7-10 18-10 18Z" fill="#0B1510" /><circle cx="164" cy="128" r="3" fill="#10B981" />
        </svg></div>
        <div className="map-distance"><strong><MapPin size={18} className="inline" aria-hidden="true" /> {item.locationLandmark || 'MITS campus'}</strong><p className="campus-muted">Illustrative campus guide. Follow Google Maps for directions.</p></div>
        {hasCoordinates && <><button className="campus-card-action" disabled={locating} onClick={locate}><LocateFixed size={18} aria-hidden="true" />{locating ? 'Finding location…' : 'Use my location'}</button><p role="status" className="campus-muted my-3">{distance != null && `${distance} m away. `}{locationStatus}</p></>}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="campus-primary">Open Google Maps <span className="sr-only">in a new tab</span></a>
      </div>
    </div>
  );
}
