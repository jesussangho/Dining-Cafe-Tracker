'use client';

import type { Place, RouteEstimate } from '@/types';
import {
  WALKING_SPEED_MPM,
  TRANSIT_SPEED_MPM,
  CAR_SPEED_MPM,
} from '@/constants/map';

const MODE_META = {
  walk: {
    label: '도보',
    icon: '🚶',
    speed: WALKING_SPEED_MPM,
    color: 'bg-green-50 text-green-700 border-green-200',
    activeColor: 'bg-green-500 text-white border-green-500',
    navBy: 'FOOT',
  },
  transit: {
    label: '대중교통',
    icon: '🚇',
    speed: TRANSIT_SPEED_MPM,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-500 text-white border-blue-500',
    navBy: 'PUBLICTRANSIT',
  },
  car: {
    label: '자차',
    icon: '🚗',
    speed: CAR_SPEED_MPM,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    activeColor: 'bg-orange-500 text-white border-orange-500',
    navBy: 'CAR',
  },
} as const;

interface RouteCardProps {
  place: Place;
  distanceMeters: number;
  selectedMode: RouteEstimate['mode'];
  onModeChange: (mode: RouteEstimate['mode']) => void;
}

export default function RouteCard({
  place,
  distanceMeters,
  selectedMode,
  onModeChange,
}: RouteCardProps) {
  const modes = (['walk', 'transit', 'car'] as const).map((mode) => {
    const meta = MODE_META[mode];
    const minutes = Math.ceil(distanceMeters / meta.speed);
    return { mode, meta, minutes };
  });

  const activeMode = MODE_META[selectedMode];
  const kakaoWebUrl = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-3">
        {modes.map(({ mode, meta, minutes }) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border text-xs font-medium transition ${
              selectedMode === mode ? meta.activeColor : meta.color
            }`}
          >
            <span className="text-base mb-0.5">{meta.icon}</span>
            <span>{meta.label}</span>
            <span className="font-bold mt-0.5">
              {minutes < 60 ? `${minutes}분` : `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mb-3">
        * {activeMode.label} 기준 약 {distanceMeters >= 1000
          ? `${(distanceMeters / 1000).toFixed(1)}km`
          : `${distanceMeters}m`} 거리 예상 소요 시간
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
