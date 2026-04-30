'use client';

import { useEffect, useRef } from 'react';
import type { Place } from '@/types';

// 카테고리별 마커 색상
const MARKER_COLOR: Record<string, string> = {
  FD6: '#F97316', // 음식점 – 주황
  CE7: '#7C3AED', // 카페 – 보라
};

function buildMarkerImage(categoryCode: string): kakao.maps.MarkerImage {
  const fill = MARKER_COLOR[categoryCode] ?? '#2563EB';
  // SVG 핀 (30×40): 컬러 몸통 + 흰 원 내부
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40">
    <path d="M15 0C8.925 0 3 5.925 3 12c0 8.5 12 28 12 28S27 20.5 27 12C27 5.925 21.075 0 15 0z"
      fill="${fill}" stroke="white" stroke-width="1.5"/>
    <circle cx="15" cy="12" r="6.5" fill="white" fill-opacity="0.95"/>
  </svg>`;
  const encoded = encodeURIComponent(svg);
  return new window.kakao.maps.MarkerImage(
    `data:image/svg+xml;charset=utf-8,${encoded}`,
    new window.kakao.maps.Size(30, 40),
    { offset: new window.kakao.maps.Point(15, 40) }
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
  // 콜백 레퍼런스를 최신 상태로 유지 (stale closure 방지)
  onMarkerClickRef.current = onMarkerClick;

  useEffect(() => {
    if (!isReady || !map) return;

    // 이전 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (places.length === 0) return;

    places.forEach((place) => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      const image = buildMarkerImage(place.categoryGroupCode);
      const marker = new window.kakao.maps.Marker({ position, map, image, clickable: true });
      marker.setTitle(place.name);

      // InfoWindow 없이 직접 콜백 호출 (가로막힘 방지)
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClickRef.current(place);
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [isReady, map, places]); // onMarkerClick 제외 → ref로 최신값 참조
}
