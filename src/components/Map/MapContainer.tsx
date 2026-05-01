'use client';

import { useEffect } from 'react';
import type { MapCenter, Place, RadiusOption } from '@/types';
import { useKakaoMap } from '@/hooks/useKakaoMap';
import { useRadiusCircles } from '@/hooks/useRadiusCircles';
import { useMapMarkers } from '@/hooks/useMapMarkers';
import { useRoutePolyline } from '@/hooks/useRoutePolyline';
import { DETAIL_ZOOM_LEVEL } from '@/constants/map';

interface MapContainerProps {
  center: MapCenter;
  places: Place[];
  radii: RadiusOption[];
  selectedPlace: Place | null;
  onMarkerClick: (place: Place) => void;
  onMapReady?: () => void;
  onMapClick?: (center: MapCenter) => void;
  origin?: MapCenter | null;
  destination?: MapCenter | null;
}

export default function MapContainer({
  center,
  places,
  radii,
  selectedPlace,
  onMarkerClick,
  onMapReady,
  onMapClick,
  origin,
  destination,
}: MapContainerProps) {
  const { mapRef, map, isReady, panTo, panAndZoom } = useKakaoMap(center, onMapClick);

  // AppShell에 SDK 준비 완료 알림
  useEffect(() => {
    if (isReady) onMapReady?.();
  // onMapReady is a stable callback ref — intentionally excluded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  // Pan map when center changes (from search or GPS)
  useEffect(() => {
    if (!isReady) return;
    panTo(center);
  }, [center, isReady, panTo]);

  // Auto-zoom to street level when place is selected
  useEffect(() => {
    if (!isReady || !selectedPlace) return;
    panAndZoom({ lat: selectedPlace.lat, lng: selectedPlace.lng }, DETAIL_ZOOM_LEVEL);
  }, [selectedPlace, isReady, panAndZoom]);

  useRadiusCircles(map, isReady, center, radii);
  useMapMarkers(map, isReady, places, onMarkerClick);
  useRoutePolyline(map, isReady, origin ?? null, destination ?? null);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">지도 로딩 중...</span>
          </div>
        </div>
      )}
    </div>
  );
}
