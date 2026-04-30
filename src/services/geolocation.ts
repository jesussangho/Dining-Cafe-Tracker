import type { MapCenter } from '@/types';

export function getCurrentPosition(): Promise<MapCenter> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('위치 서비스를 지원하지 않는 브라우저입니다.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function watchPosition(
  onUpdate: (center: MapCenter) => void,
  onError?: (err: GeolocationPositionError) => void
): () => void {
  if (!navigator.geolocation) return () => {};
  const id = navigator.geolocation.watchPosition(
    (pos) => onUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    onError,
    { enableHighAccuracy: true }
  );
  return () => navigator.geolocation.clearWatch(id);
}
