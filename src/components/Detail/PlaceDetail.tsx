'use client';

import { useState } from 'react';
import type { Place, MapCenter, RouteEstimate } from '@/types';
import { KAKAO_CATEGORY_LABELS } from '@/constants/map';
import RouteCard from './RouteCard';

function haversineDistance(a: MapCenter, b: MapCenter): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const a2 =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
}

const CATEGORY_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  FD6: { bg: 'bg-orange-50', text: 'text-orange-600', icon: '🍽️' },
  CE7: { bg: 'bg-violet-50', text: 'text-violet-600', icon: '☕' },
};

interface PlaceDetailProps {
  place: Place;
  userLocation: MapCenter | null;
  originLabel: string | null;
}

export default function PlaceDetail({ place, userLocation, originLabel }: PlaceDetailProps) {
  const [routeMode, setRouteMode] = useState<RouteEstimate['mode']>('walk');

  const categoryLabel =
    KAKAO_CATEGORY_LABELS[place.categoryGroupCode] ??
    place.category.split(' > ')[0];
  const catStyle = CATEGORY_STYLE[place.categoryGroupCode] ?? {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    icon: '📍',
  };

  const distanceMeters = userLocation
    ? Math.round(haversineDistance(userLocation, { lat: place.lat, lng: place.lng }))
    : null;

  const distLabel =
    distanceMeters !== null
      ? distanceMeters >= 1000
        ? `${(distanceMeters / 1000).toFixed(1)}km`
        : `${distanceMeters}m`
      : null;

  return (
    <div className="px-4 pb-8 pt-3">
      {/* Category + distance */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${catStyle.bg} ${catStyle.text}`}>
          <span>{catStyle.icon}</span>
          {categoryLabel}
        </span>
        {distLabel && (
          <span className="text-xs text-slate-400">현재 위치에서 약 {distLabel}</span>
        )}
      </div>

      {/* Info cards */}
      <div className="space-y-2 mb-4">
        {place.address && (
          <div className="flex items-start gap-3 bg-slate-50 rounded-xl px-3.5 py-3">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm text-slate-700">{place.address}</p>
              {place.addressLegacy && place.addressLegacy !== place.address && (
                <p className="text-xs text-slate-400 mt-0.5">{place.addressLegacy}</p>
              )}
            </div>
          </div>
        )}

        {place.phone && (
          <a
            href={`tel:${place.phone}`}
            className="flex items-center gap-3 bg-slate-50 rounded-xl px-3.5 py-3 group"
          >
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm text-blue-600 font-medium group-hover:underline">{place.phone}</span>
          </a>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-5">
        <a
          href={place.placeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          카카오맵
        </a>
        {place.phone && (
          <a
            href={`tel:${place.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            전화
          </a>
        )}
      </div>

      {/* Route comparison */}
      {distanceMeters !== null && distanceMeters > 0 && (
        <RouteCard
          place={place}
          distanceMeters={distanceMeters}
          userLocation={userLocation}
          originLabel={originLabel ?? '현재 위치'}
          selectedMode={routeMode}
          onModeChange={setRouteMode}
        />
      )}
    </div>
  );
}
