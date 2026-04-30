'use client';

import { useEffect, useRef } from 'react';
import type { MapCenter, RadiusOption } from '@/types';
import { CIRCLE_STYLES } from '@/constants/map';

export function useRadiusCircles(
  map: kakao.maps.Map | null,
  isReady: boolean,
  center: MapCenter | null,
  radii: RadiusOption[]
) {
  const circlesRef = useRef<kakao.maps.Circle[]>([]);

  useEffect(() => {
    if (!isReady || !map || !center) return;

    // Remove old circles
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    // Draw enabled circles (outermost first so inner ones render on top)
    const sorted = [...radii].reverse();
    sorted.forEach((opt) => {
      if (!opt.enabled) return;
      const idx = [5, 10, 15].indexOf(opt.minutes);
      const style = CIRCLE_STYLES[idx] ?? CIRCLE_STYLES[0];
      const circle = new window.kakao.maps.Circle({
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        radius: opt.meters,
        strokeWeight: 1.5,
        strokeColor: style.strokeColor,
        strokeOpacity: 0.8,
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity,
        map,
      });
      circlesRef.current.push(circle);
    });

    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
    };
  }, [isReady, map, center, radii]);
}
