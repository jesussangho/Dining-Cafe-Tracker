'use client';

import { useEffect, useRef } from 'react';
import type { Place } from '@/types';

// FD6=음식점(주황), CE7=카페(보라)
const MARKER_META: Record<string, { bg: string; emoji: string }> = {
  FD6: { bg: '#F97316', emoji: '🍽️' },
  CE7: { bg: '#7C3AED', emoji: '☕' },
};

/**
 * CustomOverlay(HTML div)를 사용.
 * Kakao Marker SDK 이벤트는 모바일에서 불안정하므로
 * DOM의 touchend + click을 직접 부착해 100% 동작 보장.
 */
function makeMarkerEl(place: Place, onClick: () => void): HTMLDivElement {
  const meta = MARKER_META[place.categoryGroupCode] ?? { bg: '#2563EB', emoji: '📍' };

  const wrap = document.createElement('div');
  // 전체 터치 영역: 52×60 (보이는 원 + 아래 삼각 꼭지 포함)
  wrap.style.cssText = `
    position:relative;
    width:52px;
    height:60px;
    display:flex;
    flex-direction:column;
    align-items:center;
    cursor:pointer;
    -webkit-tap-highlight-color:transparent;
    user-select:none;
    -webkit-user-select:none;
  `.replace(/\s+/g, '');

  // 원형 핀 몸체 (44×44 — iOS 최소 터치 타깃)
  const circle = document.createElement('div');
  circle.style.cssText = `
    width:44px;
    height:44px;
    border-radius:50%;
    background:${meta.bg};
    border:3px solid white;
    box-shadow:0 3px 10px rgba(0,0,0,0.35);
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:20px;
    line-height:1;
    transform:translateZ(0);
  `.replace(/\s+/g, '');
  circle.textContent = meta.emoji;

  // 아래 꼭지 삼각형
  const tip = document.createElement('div');
  tip.style.cssText = `
    width:0;
    height:0;
    border-left:7px solid transparent;
    border-right:7px solid transparent;
    border-top:10px solid ${meta.bg};
    margin-top:-2px;
    filter:drop-shadow(0 2px 2px rgba(0,0,0,0.2));
  `.replace(/\s+/g, '');

  wrap.appendChild(circle);
  wrap.appendChild(tip);

  // touchend + click 둘 다 달아서 모바일/데스크톱 모두 대응
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
      const el = makeMarkerEl(place, () => onClickRef.current(place));

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: el,
        yAnchor: 1.0, // 꼭지 끝이 좌표에 닿도록
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
