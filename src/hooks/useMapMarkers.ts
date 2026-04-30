'use client';

import { useEffect, useRef } from 'react';
import type { Place } from '@/types';

export function useMapMarkers(
  map: kakao.maps.Map | null,
  isReady: boolean,
  places: Place[],
  onMarkerClick: (place: Place) => void
) {
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const infoWindowRef = useRef<kakao.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!isReady || !map) return;

    // Clean up previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    infoWindowRef.current?.close();

    if (places.length === 0) return;

    const infoWindow = new window.kakao.maps.InfoWindow({ removable: true });
    infoWindowRef.current = infoWindow;

    places.forEach((place) => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      const marker = new window.kakao.maps.Marker({ position, map });
      marker.setTitle(place.name);

      window.kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.setContent(
          `<div style="padding:6px 10px;font-size:13px;font-weight:600;white-space:nowrap">${place.name}</div>`
        );
        infoWindow.open(map, marker);
        onMarkerClick(place);
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      infoWindow.close();
    };
  }, [isReady, map, places, onMarkerClick]);
}
