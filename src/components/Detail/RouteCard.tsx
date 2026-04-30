'use client';

import { useEffect, useState } from 'react';
import type { MapCenter, Place, RouteEstimate } from '@/types';
import { WALKING_SPEED_MPM, TRANSIT_SPEED_MPM } from '@/constants/map';

const MODE_META = {
  walk: {
    label: '도보',
    icon: '🚶',
    color: 'bg-green-50 text-green-700 border-green-200',
    activeColor: 'bg-green-500 text-white border-green-500',
  },
  transit: {
    label: '대중교통',
    icon: '🚇',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-500 text-white border-blue-500',
  },
  car: {
    label: '자차',
    icon: '🚗',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    activeColor: 'bg-orange-500 text-white border-orange-500',
  },
} as const;

function fmtMin(min: number) {
  return min < 60 ? `${min}분` : `${Math.floor(min / 60)}시간 ${min % 60}분`;
}

interface RouteCardProps {
  place: Place;
  distanceMeters: number;
  userLocation: MapCenter | null;
  selectedMode: RouteEstimate['mode'];
  onModeChange: (mode: RouteEstimate['mode']) => void;
}

export default function RouteCard({
  place,
  distanceMeters,
  userLocation,
  selectedMode,
  onModeChange,
}: RouteCardProps) {
  const [carMinutes, setCarMinutes] = useState<number | null>(null);
  const [carLoading, setCarLoading] = useState(false);

  // 카카오 모빌리티로 실제 자차 소요 시간 조회
  useEffect(() => {
    if (!userLocation) return;
    setCarLoading(true);
    const origin = `${userLocation.lng},${userLocation.lat}`;
    const destination = `${place.lng},${place.lat}`;
    fetch(`/api/directions?origin=${origin}&destination=${destination}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.car?.duration) setCarMinutes(data.car.duration);
      })
      .catch(() => {/* 실패 시 추정값 유지 */})
      .finally(() => setCarLoading(false));
  }, [userLocation, place.lat, place.lng]);

  const walkMin = Math.ceil(distanceMeters / WALKING_SPEED_MPM);
  const transitMin = Math.ceil(distanceMeters / TRANSIT_SPEED_MPM);
  const carMin = carMinutes ?? Math.ceil(distanceMeters / 300);

  const modes = [
    { mode: 'walk' as const, minutes: walkMin, real: false },
    { mode: 'transit' as const, minutes: transitMin, real: false },
    { mode: 'car' as const, minutes: carMin, real: !!carMinutes, loading: carLoading },
  ];

  const distLabel = distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(1)}km`
    : `${distanceMeters}m`;

  const kakaoWebUrl = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-3">
        {modes.map(({ mode, minutes, real, loading }) => {
          const meta = MODE_META[mode];
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border text-xs font-medium transition ${
                selectedMode === mode ? meta.activeColor : meta.color
              }`}
            >
              <span className="text-base mb-0.5">{meta.icon}</span>
              <span>{meta.label}</span>
              {loading ? (
                <span className="mt-0.5 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-bold mt-0.5">{fmtMin(minutes)}</span>
              )}
              {real && !loading && (
                <span className="text-[10px] opacity-70">실시간</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center mb-3">
        직선거리 약 {distLabel} ·{' '}
        {selectedMode === 'car' && carMinutes ? '카카오 모빌리티 기준' : '예상 소요 시간'}
      </p>

      <a
        href={kakaoWebUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold text-sm transition"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        카카오맵에서 길찾기
      </a>
    </div>
  );
}
