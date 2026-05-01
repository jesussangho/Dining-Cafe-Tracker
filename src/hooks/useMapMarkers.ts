'use client';

import { useEffect, useRef } from 'react';
import type { Place } from '@/types';

const MARKER_COLOR: Record<string, string> = {
  FD6: '#F97316', // 음식점 – 주황
  CE7: '#7C3AED', // 카페 – 보라
};

// 터치 타깃 최소 48×48 dp 확보 (iOS/Android 가이드라인)
const W = 40;
const H = 52;
const R = 12; // 원 반지름

function buildMarkerImage(categoryCode: string): kakao.maps.MarkerImage {
  const fill = MARKER_COLOR[categoryCode] ?? '#2563EB';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
    </filter>
    <path d="M${W / 2} 1C${W / 2 - 11} 1 ${W / 2 - 19} 8.7 ${W / 2 - 19} 18c0 11 ${W / 2 - 1} 33 ${W / 2 - 1} 33S${W - 1} 29 ${W - 1} 18C${W - 1} 8.7 ${W / 2 + 11} 1 ${W / 2} 1z"
      fill="${fill}" filter="url(#s)" stroke="white" stroke-width="1.5"/>
    <circle cx="${W / 2}" cy="18" r="${R}" fill="white" fill-opacity="0.95"/>
  </svg>`;
  const encoded = encodeURIComponent(svg);
  return new window.kakao.maps.MarkerImage(
    `data:image/svg+xml;charset=utf-8,${encoded}`,
    new window.kakao.maps.Size(W, H),
    { offset: new window.kakao.maps.Point(W / 2, H) }
  );
}

export function useMapMarkers(
  map: kakao.maps.Map | null,
  isReady: boolean,
  places: Place[],
  onMarkerClick: (place: Place) => void
) {
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  useEffect(() => {
    if (!isReady || !map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (places.length === 0) return;

    places.forEach((place) => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      const image = buildMarkerImage(place.categoryGroupCode);
      const marker = new window.kakao.maps.Marker({
        position,
        map,
        image,
        clickable: true,
        zIndex: 3,
      });
      marker.setTitle(place.name);

      window.kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClickRef.current(place);
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [isReady, map, places]);
}
