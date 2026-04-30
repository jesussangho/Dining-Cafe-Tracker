'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MapCenter } from '@/types';
import { DEFAULT_CENTER, DEFAULT_ZOOM_LEVEL } from '@/constants/map';

interface UseKakaoMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  map: kakao.maps.Map | null;
  isReady: boolean;
  panTo: (center: MapCenter) => void;
  setZoom: (level: number) => void;
  panAndZoom: (center: MapCenter, level: number) => void;
}

export function useKakaoMap(initialCenter: MapCenter = DEFAULT_CENTER): UseKakaoMapReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const init = () => {
      if (mapInstanceRef.current) return; // 이미 초기화됨
      if (!containerRef.current) return;
      try {
        const map = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(initialCenter.lat, initialCenter.lng),
          level: DEFAULT_ZOOM_LEVEL,
        });
        mapInstanceRef.current = map;
        setIsReady(true);
      } catch (e) {
        console.error('Kakao Maps 초기화 실패:', e);
      }
    };

    const tryInit = () => {
      if (window.kakao?.maps?.Map) {
        if (pollTimer) clearInterval(pollTimer);
        init();
      }
    };

    // 이미 로드된 경우 즉시 실행
    if (typeof window !== 'undefined' && window.kakao?.maps?.Map) {
      init();
    } else {
      // onLoad 콜백 등록 + 100ms 폴링 폴백 (두 경로 중 먼저 도착한 것이 실행)
      window.__kakaoMapOnLoad = init;
      pollTimer = setInterval(tryInit, 100);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (window.__kakaoMapOnLoad === init) {
        window.__kakaoMapOnLoad = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panTo = useCallback((center: MapCenter) => {
    mapInstanceRef.current?.panTo(
      new window.kakao.maps.LatLng(center.lat, center.lng)
    );
  }, []);

  const setZoom = useCallback((level: number) => {
    mapInstanceRef.current?.setLevel(level, { animate: true });
  }, []);

  const panAndZoom = useCallback((center: MapCenter, level: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setLevel(level, { animate: true });
    map.panTo(new window.kakao.maps.LatLng(center.lat, center.lng));
  }, []);

  return {
    mapRef: containerRef,
    map: mapInstanceRef.current,
    isReady,
    panTo,
    setZoom,
    panAndZoom,
  };
}
