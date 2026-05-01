'use client';

import { useEffect, useRef } from 'react';
import type { MapCenter, TransportMode } from '@/types';

export function useRoutePolyline(
  map: kakao.maps.Map | null,
  isReady: boolean,
  origin: MapCenter | null,
  destination: MapCenter | null,
  mode: TransportMode
) {
  const polylineRef = useRef<kakao.maps.Polyline | null>(null);

  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!isReady || !map || !origin || !destination) return;

    if (mode === 'car') {
      // 자차 — Kakao Mobility API 실제 경로
      const o = `${origin.lng},${origin.lat}`;
      const d = `${destination.lng},${destination.lat}`;
      fetch(`/api/directions?origin=${o}&destination=${d}`)
        .then((r) => r.json())
        .then((data) => {
          const pts: number[][] = data?.car?.polyline;
          if (!pts?.length) return;
          const path = pts.map(([lng, lat]) => new window.kakao.maps.LatLng(lat, lng));
          const line = new window.kakao.maps.Polyline({
            path,
            strokeWeight: 5,
            strokeColor: '#2563EB',
            strokeOpacity: 0.9,
            strokeStyle: 'solid',
            endArrow: true,
          });
          line.setMap(map);
          polylineRef.current = line;
        })
        .catch(() => {});
    } else {
      // 도보(초록 점선) / 버스(파란 점선) — 직선 근사
      const path = [
        new window.kakao.maps.LatLng(origin.lat, origin.lng),
        new window.kakao.maps.LatLng(destination.lat, destination.lng),
      ];
      const line = new window.kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: mode === 'walk' ? '#10B981' : '#3B82F6',
        strokeOpacity: 0.8,
        strokeStyle: 'dashed',
      });
      line.setMap(map);
      polylineRef.current = line;
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, map, origin?.lat, origin?.lng, destination?.lat, destination?.lng, mode]);
}
