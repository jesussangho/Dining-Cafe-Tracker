import type { MapCenter, RadiusOption } from '@/types';

export const WALKING_SPEED_MPM = 80; // meters per minute (~4.8 km/h)
export const TRANSIT_SPEED_MPM = 200; // ~12 km/h city average
export const CAR_SPEED_MPM = 300; // ~18 km/h city average

export const DEFAULT_CENTER: MapCenter = {
  lat: 37.5665,
  lng: 126.978,
};

export const DEFAULT_ZOOM_LEVEL = 5;
export const DETAIL_ZOOM_LEVEL = 3;

export const RADIUS_OPTIONS: RadiusOption[] = [
  { minutes: 5, meters: 400, label: '5분', enabled: true },
  { minutes: 10, meters: 800, label: '10분', enabled: true },
  { minutes: 15, meters: 1200, label: '15분', enabled: true },
];

export const CIRCLE_STYLES = [
  { strokeColor: '#3B82F6', fillColor: '#93C5FD', fillOpacity: 0.08 }, // 5min – blue
  { strokeColor: '#8B5CF6', fillColor: '#C4B5FD', fillOpacity: 0.06 }, // 10min – violet
  { strokeColor: '#EC4899', fillColor: '#F9A8D4', fillOpacity: 0.04 }, // 15min – pink
] as const;

export const KAKAO_CATEGORY_LABELS: Record<string, string> = {
  FD6: '음식점',
  CE7: '카페',
  MT1: '마트',
  CS2: '편의점',
  SW8: '지하철',
  BK9: '은행',
  PO3: '공공기관',
  AT4: '관광명소',
  AD5: '숙박',
  HP8: '병원',
  PM9: '약국',
};
