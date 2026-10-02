import React, { useState, useEffect } from 'react';
import { X, Footprints, Navigation, MapPin, Compass } from 'lucide-react';
import { useModalA11y } from '../lib/useModalA11y';
import { ViewOnMap } from './ViewOnMap';
import type { FoodItem } from '../lib/types';

interface WalkInMapModalProps {
  isOpen: boolean;
  item: FoodItem | null;
  onClose: () => void;
}

// MITS campus center coordinates (Madanapalle, AP)
const MITS_CAMPUS_LAT = 13.6288;
const MITS_CAMPUS_LNG = 78.5020;

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const WalkInMapModal: React.FC<WalkInMapModalProps> = ({ isOpen, item, onClose }) => {
  const sheetRef = useModalA11y<HTMLDivElement>(isOpen && !!item, onClose);
  const [activeTab, setActiveTab] = useState<'schematic' | 'gps'>('schematic');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [liveDistance, setLiveDistance] = useState<number | null>(null);

  // Fetch live browser GPS if available
  useEffect(() => {
    if (!isOpen || !item) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          const destLat = item.latitude ?? MITS_CAMPUS_LAT;
          const destLng = item.longitude ?? MITS_CAMPUS_LNG;
          const meters = calculateDistanceMeters(loc.lat, loc.lng, destLat, destLng);
          setLiveDistance(meters);
        },
        () => {
          // Fallback to campus center if GPS permission denied
          const destLat = item.latitude ?? 13.6289;
          const destLng = item.longitude ?? 78.5022;
          const meters = calculateDistanceMeters(MITS_CAMPUS_LAT, MITS_CAMPUS_LNG, destLat, destLng);
          setLiveDistance(meters || 160);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const vendor = item.vendor || 'MITS Canteen';
  const vLower = vendor.toLowerCase();

  // Dynamic landmark and schematic coordinate resolution
  let buildingName = 'Canteen';
  let landmarkText = item.locationLandmark || 'Campus Food Court • Ground Floor';
  let pinX = 197;
  let pinY = 464;
  let routePath = 'M88 550H140V445H210V480';

  if (vLower.includes('ekdant') || vLower.includes('library')) {
    buildingName = 'Central Library';
    landmarkText = item.locationLandmark || 'Beside Central Library Lawn';
    pinX = 72;
    pinY = 355;
    routePath = 'M88 550H88V415';
  } else if (vLower.includes('lickies') || item.isOnCampus === false) {
    buildingName = 'Gate 1 (Off-Campus)';
    landmarkText = item.locationLandmark || 'Opposite Campus Gate 1';
    pinX = 265;
    pinY = 425;
    routePath = 'M88 550H140V445H275';
  } else if (vLower.includes('new') || vLower.includes('hostel')) {
    buildingName = 'Hostel Block';
    landmarkText = item.locationLandmark || 'Near Boys Hostel Block B';
    pinX = 77;
    pinY = 549;
    routePath = 'M88 550H88V570';
  } else if (vLower.includes('cafe')) {
    buildingName = 'Main Block';
    landmarkText = item.locationLandmark || 'Near Main Block Lawn';
    pinX = 195;
    pinY = 360;
    routePath = 'M88 550H140V390H195';
  } else {
    buildingName = 'Canteen';
    landmarkText = item.locationLandmark || 'Campus Food Court • Ground Floor';
    pinX = 197;
    pinY = 464;
    routePath = 'M88 550H140V445H210V480';
  }

  // Calculate dynamic walk time based on meters (avg walking speed ~80m/min)
  const computedMeters = liveDistance ?? (item.isOnCampus === false ? 450 : 160);
  const dynamicMinutes = Math.max(1, Math.round(computedMeters / 80));
  const displayWalkTime = `${dynamicMinutes} min walk (${computedMeters}m)`;

  const openGoogleMaps = () => {
    let url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor + ', MITS Campus, Madanapalle')}`;
    if (item.latitude && item.longitude) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
    }
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(3, 42, 21, 0.45)' }}
      onClick={onClose}
    >
      {/* Bottom Sheet Modal */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Walk-in map for ${vendor}`}
        className="mx-3 mb-4 rounded-[28px] bg-[#E8ECEF] border border-white/80 p-5 flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200"
        style={{ boxShadow: '-6px -6px 14px rgba(255,255,255,0.9), 8px 8px 20px rgba(163,174,187,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle */}
        <div className="w-11.25 h-1 rounded-full bg-[#D6DCE2] mx-auto mb-2 shrink-0" />

        {/* Top Header Row with Close button */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FE7200]">
                Walk-In Map
              </span>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                item.isOnCampus !== false
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {item.isOnCampus !== false ? 'On campus' : 'Off-campus'}
              </span>
            </div>
            <h2 className="text-[18px] font-black text-[#1F140A] leading-tight mt-0.5">
              {vendor}
            </h2>
            <p className="text-[11px] font-semibold text-[#7A6658]">
              {landmarkText}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7.5 h-7.5 rounded-full bg-[#E8ECEF] border border-white flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors shadow-xs"
          >
            <X className="w-4.5 h-4.5 text-[#1F140A]" strokeWidth={2.2} />
          </button>
        </div>

        {/* View Switcher: Schematic Campus Map vs Live GPS Radar */}
        <div className="mt-3 flex items-center p-1 rounded-full bg-[#DDE2E8] border border-[#D6DCE2] shadow-inner text-[10px] font-extrabold">
          <button
            type="button"
            onClick={() => setActiveTab('schematic')}
            className={`flex-1 py-1 rounded-full text-center transition-all cursor-pointer ${
              activeTab === 'schematic'
                ? 'bg-[#FE7200] text-white shadow-xs'
                : 'text-[#1F140A] hover:bg-black/5'
            }`}
          >
            🗺️ Campus Schematic
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gps')}
            className={`flex-1 py-1 rounded-full text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'gps'
                ? 'bg-[#FE7200] text-white shadow-xs'
                : 'text-[#1F140A] hover:bg-black/5'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>📍 Live GPS Radar</span>
          </button>
        </div>

        {/* Content Tab 1: Campus Vector Schematic */}
        {activeTab === 'schematic' && (
          <div
            className="w-full h-56.25 my-3 rounded-[20px] overflow-hidden relative border border-[#C4D2CB] shrink-0"
            style={{ background: '#D8E5D6', boxShadow: 'inset 2px 2px 5px rgba(160,175,165,0.4)' }}
          >
            <svg
              viewBox="28 348 319 277"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
              role="img"
              aria-label="Schematic campus walking route"
            >
              <defs>
                <clipPath id="wim-map-clip">
                  <rect x="28" y="348" width="319" height="277" rx="20" />
                </clipPath>
              </defs>

              <g clipPath="url(#wim-map-clip)">
                {/* Water body (right edge) */}
                <path
                  d="M285 340C260 430 333 457 311 539S300 603 335 644H380V340Z"
                  fill="#B1D6DC"
                />

                {/* Buildings with active highlight */}
                <g>
                  {/* Library */}
                  <rect
                    x="47" y="375" width="70" height="45" rx="6"
                    fill={buildingName.includes('Library') ? '#93BC8F' : '#D6DCE2'}
                    stroke={buildingName.includes('Library') ? '#FE7200' : '#C9D0D8'}
                    strokeWidth={buildingName.includes('Library') ? 2 : 1}
                  />
                  <text x="82" y="400.5" fontSize="9" fontWeight="700" fill={buildingName.includes('Library') ? '#1F140A' : '#668064'} textAnchor="middle">
                    Library
                  </text>

                  {/* Main Block */}
                  <rect
                    x="157" y="367" width="90" height="48" rx="6"
                    fill={buildingName.includes('Main') ? '#93BC8F' : '#D6DCE2'}
                    stroke={buildingName.includes('Main') ? '#FE7200' : '#C9D0D8'}
                    strokeWidth={buildingName.includes('Main') ? 2 : 1}
                  />
                  <text x="202" y="394" fontSize="9" fontWeight={buildingName.includes('Main') ? 700 : 600} fill={buildingName.includes('Main') ? '#1F140A' : '#668064'} textAnchor="middle">Main Block</text>

                  {/* Lab */}
                  <rect x="56" y="466" width="65" height="58" rx="6" fill="#D6DCE2" stroke="#C9D0D8" />
                  <text x="88.5" y="498" fontSize="9" fontWeight="600" fill="#668064" textAnchor="middle">Lab</text>

                  {/* Canteen */}
                  <rect
                    x="173" y="490" width="80" height="43" rx="6"
                    fill={buildingName.includes('Canteen') ? '#93BC8F' : '#D6DCE2'}
                    stroke={buildingName.includes('Canteen') ? '#FE7200' : '#C9D0D8'}
                    strokeWidth={buildingName.includes('Canteen') ? 2 : 1}
                  />
                  <text x="213" y="514.5" fontSize="9" fontWeight="700" fill={buildingName.includes('Canteen') ? '#1F140A' : '#668064'} textAnchor="middle">
                    Canteen
                  </text>

                  {/* Hostel */}
                  <rect
                    x="55" y="569" width="64" height="34" rx="6"
                    fill={buildingName.includes('Hostel') ? '#93BC8F' : '#D6DCE2'}
                    stroke={buildingName.includes('Hostel') ? '#FE7200' : '#C9D0D8'}
                    strokeWidth={buildingName.includes('Hostel') ? 2 : 1}
                  />
                  <text x="87" y="589" fontSize="9" fontWeight="700" fill={buildingName.includes('Hostel') ? '#1F140A' : '#668064'} textAnchor="middle">
                    Hostel
                  </text>
                </g>

                {/* Roads: 25px with center overlay */}
                <g fill="none">
                  <path d="M33 445H275 M139 351V633 M140 548H313" stroke="#BED0BD" strokeWidth="25" />
                  <path d="M33 445H275 M139 351V633 M140 548H313" stroke="#F5F7EC" strokeWidth="19" />
                </g>

                {/* Dynamic walking route */}
                <g fill="none" strokeLinejoin="round">
                  <path d={routePath} stroke="#FFFFFF" strokeWidth="8" />
                  <path
                    d={routePath}
                    stroke="#10B981"
                    strokeWidth="4"
                    className="animate-route-dash"
                    strokeLinecap="round"
                  />
                </g>

                {/* Origin: current location */}
                <circle cx="88" cy="550" r="14" fill="#10B981" opacity="0.3" className="animate-pulse" />
                <circle cx="88" cy="550" r="6" fill="#FE7200" stroke="#FFF" strokeWidth="2.5" />

                {/* Destination pin (dynamic position) */}
                <g transform={`translate(${pinX} ${pinY}) scale(1.15)`}>
                  <path
                    d="M12 22S4 14 4 9a8 8 0 1 1 16 0c0 5-8 13-8 13Z M12 6a3 3 0 1 0 0 6a3 3 0 0 0 0-6"
                    fill="#F26A00"
                    stroke="#B44B00"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            </svg>

            {/* ETA chip floating top-left inside map */}
            <div
              className="absolute left-3 top-3 px-3 py-1.5 rounded-full bg-[#E8ECEF]/95 backdrop-blur-xs flex items-center gap-1.5 shadow-md border border-white/60"
            >
              <Footprints className="w-4 h-4 text-[#FE7200] shrink-0" strokeWidth={2.2} />
              <span className="text-[11px] font-extrabold text-[#1F140A]">{displayWalkTime}</span>
            </div>

            {/* Target Building chip top-right */}
            <div className="absolute right-3 top-3 px-2.5 py-1 rounded-full bg-[#FE7200]/90 backdrop-blur-xs flex items-center gap-1.5 shadow-md border border-orange-300/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-extrabold uppercase text-[#FFEAD9]">Target: {buildingName}</span>
            </div>
          </div>
        )}

        {/* Content Tab 2: Live GPS Radar & Heading */}
        {activeTab === 'gps' && (
          <div className="w-full h-56.25 my-3 rounded-[20px] bg-[#121F17] border border-emerald-900/60 p-4 flex flex-col items-center justify-between text-white relative overflow-hidden">
            {/* Ambient concentric radar rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-44 h-44 rounded-full border border-orange-300" />
              <div className="absolute w-32 h-32 rounded-full border border-orange-300" />
              <div className="absolute w-20 h-20 rounded-full border border-orange-300" />
            </div>

            <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-300 z-10">
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live GPS Radar</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {item.latitude ? `${item.latitude.toFixed(4)}°N, ${item.longitude?.toFixed(4)}°E` : 'Campus Coords'}
              </span>
            </div>

            {/* Radar Center Metric */}
            <div className="flex flex-col items-center z-10">
              <div className="w-14 h-14 rounded-full bg-[#FE7200] border-2 border-orange-300 flex items-center justify-center shadow-lg animate-radar-ring mb-2">
                <MapPin className="w-7 h-7 text-amber-400 fill-amber-400/20" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">{computedMeters} meters away</span>
              <span className="text-xs font-semibold text-emerald-300">~{dynamicMinutes} min brisk walking time</span>
            </div>

            <div className="w-full text-center text-[10px] text-slate-400 z-10">
              {userLocation ? 'Live GPS signal acquired • High precision' : 'MITS Campus Radar Active • Using campus reference'}
            </div>
          </div>
        )}

        {/* Destination Location Card with ViewOnMap */}
        <div className="my-2.5 flex justify-center w-full">
          <ViewOnMap
            locationName={item.vendor || buildingName}
            address={item.locationLandmark ? `${item.locationLandmark}, MITS Campus, Madanapalle` : `${buildingName}, MITS Campus, Madanapalle, AP 517325`}
            distance={`${computedMeters}m`}
            walkTime={displayWalkTime}
            coordinates={item.latitude && item.longitude ? { lat: item.latitude, lng: item.longitude } : undefined}
            onNavigate={openGoogleMaps}
            className="w-full max-w-none"
          />
        </div>
      </div>
    </div>
  );
};

