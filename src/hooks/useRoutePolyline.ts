'use client';

import { useEffect, useRef } from 'react';
import type { MapCenter } from '@/types';

export function useRoutePolyline(
  map: kakao.maps.Map | null,
  isReady: boolean,
  origin: MapCenter | null,
  destination: MapCenter | null
) {
  const polylineRef = useRef<kakao.maps.Polyline | null>(null);

  useEffect(() => {
    // 기존 폴리라인 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!isReady || !map || !origin || !destination) return;

    const o = `${origin.lng},${origin.lat}`;
    const d = `${destination.lng},${destination.lat}`;

    fetch(`/api/directions?origin=${o}&destination=${d}`)
      .then((r) => r.json())
      .then((data) => {
        const pts: number[][] = data?.car?.polyline;
        if (!pts?.length) return;

        const path = pts.map(
          ([lng, lat]) => new window.kakao.maps.LatLng(lat, lng)
        );

        const line = new window.kakao.maps.Polyline({
          path,
          strokeWeight: 5,
          strokeColor: '#2563EB',
          strokeOpacity: 0.85,
          strokeStyle: 'solid',
          endArrow: true,
        });
        line.setMap(map);
        polylineRef.current = line;
      })
      .catch(() => {});

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [isReady, map, origin?.lat, origin?.lng, destination?.lat, destination?.lng]);
}
