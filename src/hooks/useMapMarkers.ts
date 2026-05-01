'use client';

import { useEffect, useRef } from 'react';
import type { Place } from '@/types';

// 모든 마커 단일 색상 — 카테고리 구분은 하단 필터 버튼으로 대체
function makeMarkerEl(onClick: () => void): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.style.cssText = `
    position:relative;
    width:40px;
    height:46px;
    display:flex;
    flex-direction:column;
    align-items:center;
    cursor:pointer;
    -webkit-tap-highlight-color:transparent;
    user-select:none;
    -webkit-user-select:none;
  `.replace(/\s+/g, '');

  // 원형 핀 몸체 (40×40 — iOS 최소 터치 타깃)
  const circle = document.createElement('div');
  circle.style.cssText = `
    width:40px;
    height:40px;
    border-radius:50%;
    background:#2563EB;
    border:3px solid white;
    box-shadow:0 3px 10px rgba(0,0,0,0.3);
    transform:translateZ(0);
  `.replace(/\s+/g, '');

  // 아래 꼭지 삼각형
  const tip = document.createElement('div');
  tip.style.cssText = `
    width:0;
    height:0;
    border-left:6px solid transparent;
    border-right:6px solid transparent;
    border-top:9px solid #2563EB;
    margin-top:-2px;
    filter:drop-shadow(0 2px 2px rgba(0,0,0,0.2));
  `.replace(/\s+/g, '');

  wrap.appendChild(circle);
  wrap.appendChild(tip);

  // 모바일/데스크톱 모두 대응
  const fire = (e: Event) => {
    e.stopPropagation();
    onClick();
  };
  wrap.addEventListener('touchend', fire, { passive: true });
  wrap.addEventListener('click', fire);

  return wrap;
}

export function useMapMarkers(
  map: kakao.maps.Map | null,
  isReady: boolean,
  places: Place[],
  onMarkerClick: (place: Place) => void
) {
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const onClickRef = useRef(onMarkerClick);
  onClickRef.current = onMarkerClick;

  useEffect(() => {
    if (!isReady || !map) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    if (places.length === 0) return;

    places.forEach((place) => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      const el = makeMarkerEl(() => onClickRef.current(place));

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: el,
        yAnchor: 1.0,
        zIndex: 3,
        clickable: true,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
    };
  }, [isReady, map, places]);
}
