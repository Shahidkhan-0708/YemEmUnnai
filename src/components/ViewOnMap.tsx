import React, { useState } from 'react';
import { MapPin, Navigation, Copy, Check, ExternalLink, Compass } from 'lucide-react';
import { playTapSound } from '../lib/celebration';

export interface ViewOnMapProps {
  locationName: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  walkTime?: string;
  distance?: string;
  onNavigate?: () => void;
  className?: string;
}

export const ViewOnMap: React.FC<ViewOnMapProps> = ({
  locationName,
  address,
  coordinates,
  walkTime = '2 min walk',
  distance = '160m',
  onNavigate,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    navigator.clipboard?.writeText(`${locationName}, ${address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleOpenExternalMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    const query = encodeURIComponent(`${locationName}, ${address}`);
    const url = coordinates
      ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = () => {
    playTapSound();
    if (onNavigate) {
      onNavigate();
    } else {
      handleOpenExternalMap({ stopPropagation: () => {} } as React.MouseEvent);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#E8ECEF] border border-[#D6DCE2] p-3.5 shadow-md transition-all duration-300 hover:shadow-xl hover:border-[#FE7200]/40 cursor-pointer font-sans ${className}`}
      style={{
        boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 5px 5px 12px rgba(163,174,187,0.4)',
      }}
    >
      {/* Map Graphic Preview Header */}
      <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-[#0F1E17] border border-black/10">
        {/* Stylized vector map background roads & blocks */}
        <svg
          viewBox="0 0 320 144"
          className="h-full w-full object-cover opacity-80"
          preserveAspectRatio="none"
        >
          <rect width="320" height="144" fill="#14261D" />
          {/* Roads & Paths */}
          <path
            d="M-20 70 Q 100 90, 180 50 T 340 75"
            fill="none"
            stroke="#2E4A3B"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M-20 70 Q 100 90, 180 50 T 340 75"
            fill="none"
            stroke="#FE7200"
            strokeWidth="3"
            strokeDasharray="6 6"
            className="animate-pulse"
          />
          <path
            d="M160 -10 L160 160"
            fill="none"
            stroke="#273F32"
            strokeWidth="16"
          />
          <path
            d="M40 0 L100 150"
            fill="none"
            stroke="#21352A"
            strokeWidth="10"
          />
          <path
            d="M240 0 L220 150"
            fill="none"
            stroke="#21352A"
            strokeWidth="12"
          />

          {/* Building outlines */}
          <rect x="25" y="15" width="45" height="35" rx="6" fill="#1B3125" stroke="#335643" strokeWidth="1" />
          <rect x="200" y="20" width="55" height="40" rx="6" fill="#1B3125" stroke="#335643" strokeWidth="1" />
          <rect x="70" y="95" width="60" height="35" rx="6" fill="#1B3125" stroke="#335643" strokeWidth="1" />
          <rect x="230" y="85" width="65" height="45" rx="6" fill="#1B3125" stroke="#335643" strokeWidth="1" />

          {/* Destination Pin Pulse Ripple */}
          <circle cx="160" cy="55" r="24" fill="#FE7200" fillOpacity="0.18" className="animate-ping" />
          <circle cx="160" cy="55" r="14" fill="#FE7200" fillOpacity="0.3" />
        </svg>

        {/* Floating Map Pin Badge */}
        <div className="absolute left-1/2 top-11 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FE7200] text-white shadow-lg ring-4 ring-white/30 transform transition-transform group-hover:scale-110">
            <MapPin className="h-5 w-5 fill-white stroke-[2]" />
          </div>
          <div className="mt-1 rounded-md bg-[#1F140A]/90 px-2 py-0.5 text-[9px] font-black text-white backdrop-blur-xs shadow-md border border-white/20 whitespace-nowrap">
            {locationName}
          </div>
        </div>

        {/* Distance / Walk Time Overlay Chip */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-[#1F140A]/85 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md border border-white/20 shadow-sm">
          <Compass className="h-3 w-3 text-[#FE7200] animate-spin" style={{ animationDuration: '8s' }} />
          <span>{distance} • {walkTime}</span>
        </div>

        {/* Open in External Maps Button */}
        <button
          type="button"
          onClick={handleOpenExternalMap}
          title="Open in Google Maps"
          aria-label="Open in Google Maps"
          className="absolute top-2.5 right-2.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-white/90 text-[#1F140A] hover:bg-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
        >
          <ExternalLink className="h-3.5 w-3.5 stroke-[2.2]" />
        </button>
      </div>

      {/* Information Row */}
      <div className="mt-3 px-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-extrabold text-[#1F140A] group-hover:text-[#FE7200] transition-colors">
              {locationName}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-[#7A6658]">
              {address}
            </p>
          </div>

          {/* Quick Copy Address Button */}
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard!' : 'Copy address'}
            aria-label="Copy address"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-[#D6DCE2] text-[#1F140A] hover:bg-[#F4F6F8] shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-[#7A6658] stroke-[2]" />
            )}
          </button>
        </div>

        {/* Navigation Action Bar */}
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#D6DCE2]/60 pt-2.5">
          <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verified Campus Spot
          </span>

          <button
            type="button"
            onClick={handleOpenExternalMap}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FE7200] px-3 py-1.5 text-[11px] font-extrabold text-white btn-orange-shadow hover:bg-[#E05D00] active:scale-95 transition-all cursor-pointer"
          >
            <Navigation className="h-3 w-3 fill-white" />
            <span>Navigate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOnMap;
