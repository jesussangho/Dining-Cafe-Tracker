export interface MapCenter {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  categoryGroupCode: string;
  address: string;
  addressLegacy: string;
  phone: string;
  lat: number;
  lng: number;
  placeUrl: string;
  distance?: number;
}

export type SearchState = 'idle' | 'loading' | 'success' | 'error' | 'zero';

export interface RadiusOption {
  minutes: 5 | 10 | 15;
  meters: 400 | 800 | 1200;
  label: string;
  enabled: boolean;
}

export type BottomSheetState = 'hidden' | 'peek' | 'expanded';

export type TransportMode = 'walk' | 'transit' | 'car';

export interface RouteEstimate {
  mode: TransportMode;
  durationMinutes: number;
  distanceMeters: number;
}
