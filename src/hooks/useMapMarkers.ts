'use client';

import type { Place } from '@/types';

// 마커 비활성화 — 카테고리 버튼 리스트 모달로 대체
export function useMapMarkers(
  _map: kakao.maps.Map | null,
  _isReady: boolean,
  _places: Place[],
  _onMarkerClick: (place: Place) => void
) {}
