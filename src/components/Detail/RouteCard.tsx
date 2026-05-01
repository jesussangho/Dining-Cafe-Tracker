'use client';

import { useEffect, useState } from 'react';
import type { MapCenter, Place, RouteEstimate } from '@/types';
import { WALKING_SPEED_MPM, TRANSIT_SPEED_MPM } from '@/constants/map';

const MODE_META = {
  walk:    { label: '도보',     icon: '🚶', color: 'bg-emerald-50 text-emerald-700 border-emerald-100',  active: 'bg-emerald-500 text-white border-emerald-500'  },
  transit: { label: '대중교통', icon: '🚇', color: 'bg-blue-50   text-blue-700   border-blue-100',       active: 'bg-blue-500   text-white border-blue-500'   },
  car:     { label: '자차',     icon: '🚗', color: 'bg-orange-50 text-orange-700 border-orange-100',     active: 'bg-orange-500 text-white border-orange-500' },
} as const;

function fmtMin(min: number) {
  if (min < 60) return `${min}분`;
  return `${Math.floor(min / 60)}시간 ${min % 60 > 0 ? `${min % 60}분` : ''}`.trim();
}

interface RealTimes {
  car: number | null;
  transit: number | null;
}

interface RouteCardProps {
  place: Place;
  distanceMeters: number;
  userLocation: MapCenter | null;
  originLabel: string;
  selectedMode: RouteEstimate['mode'];
  onModeChange: (mode: RouteEstimate['mode']) => void;
  onRouteModeChange?: (mode: RouteEstimate['mode']) => void; // AppShell까지 전파
}

export default function RouteCard({
  place,
  distanceMeters,
  userLocation,
  originLabel,
  selectedMode,
  onModeChange,
  onRouteModeChange,
}: RouteCardProps) {
  const [realTimes, setRealTimes] = useState<RealTimes>({ car: null, transit: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userLocation) return;
    setLoading(true);
    const origin = `${userLocation.lng},${userLocation.lat}`;
    const destination = `${place.lng},${place.lat}`;

    fetch(`/api/directions?origin=${origin}&destination=${destination}`)
      .then((r) => r.json())
      .then((data) => {
        setRealTimes({
          car:     data.car?.duration     ?? null,
          transit: data.transit?.duration ?? null,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userLocation, place.lat, place.lng]);

  const walkMin    = Math.ceil(distanceMeters / WALKING_SPEED_MPM);
  const transitMin = realTimes.transit ?? Math.ceil(distanceMeters / TRANSIT_SPEED_MPM);
  const carMin     = realTimes.car     ?? Math.ceil(distanceMeters / 300);

  const modes = [
    { mode: 'walk'    as const, minutes: walkMin,    real: false,               isLoading: false   },
    { mode: 'transit' as const, minutes: transitMin, real: !!realTimes.transit, isLoading: loading },
    { mode: 'car'     as const, minutes: carMin,     real: !!realTimes.car,     isLoading: loading },
  ];

  const distLabel =
    distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(1)}km`
      : `${distanceMeters}m`;

  const kakaoWebUrl = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

  return (
    <div>
      {/* Origin → Destination header */}
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-xs text-slate-500 truncate max-w-[110px]">{originLabel}</span>
        </div>
        <svg className="w-3 h-3 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-700 truncate max-w-[110px]">{place.name}</span>
        </div>
      </div>

      {/* Mode cards */}
      <div className="flex gap-2 mb-3">
        {modes.map(({ mode, minutes, real, isLoading }) => {
          const meta = MODE_META[mode];
          const isActive = selectedMode === mode;
          return (
            <button
              key={mode}
              onClick={() => { onModeChange(mode); onRouteModeChange?.(mode); }}
              className={`flex-1 flex flex-col items-center py-3 rounded-2xl border text-xs font-medium transition ${
                isActive ? meta.active : meta.color
              }`}
            >
              <span className="text-lg mb-0.5">{meta.icon}</span>
              <span className="font-medium">{meta.label}</span>
              {isLoading ? (
                <span className="mt-1 w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-bold mt-0.5 text-sm">{fmtMin(minutes)}</span>
              )}
              {real && !isLoading && (
                <span className="text-[9px] opacity-70 mt-0.5 font-normal">실시간</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Meta info */}
      <p className="text-xs text-slate-400 text-center mb-4">
        직선거리 약 {distLabel}
        {(realTimes.car || realTimes.transit) && ' · 실시간 반영'}
      </p>

      {/* CTA */}
      <a
        href={kakaoWebUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-sm transition"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        카카오맵에서 길찾기
      </a>
    </div>
  );
}
