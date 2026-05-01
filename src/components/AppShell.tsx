'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BottomSheetState, MapCenter, Place, RadiusOption } from '@/types';
import { DEFAULT_CENTER, RADIUS_OPTIONS } from '@/constants/map';
import { searchNearbyAll } from '@/services/kakaoMaps';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import MapContainer from '@/components/Map/MapContainer';
import SearchBar from '@/components/Search/SearchBar';
import SearchResults from '@/components/Search/SearchResults';
import RoutePanel from '@/components/Search/RoutePanel';
import BottomSheet from '@/components/Detail/BottomSheet';

export default function AppShell() {
  const [center, setCenter] = useState<MapCenter>(DEFAULT_CENTER);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [sheetState, setSheetState] = useState<BottomSheetState>('hidden');
  const [radii, setRadii] = useState<RadiusOption[]>(RADIUS_OPTIONS);
  const [searchInput, setSearchInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [displayPlaces, setDisplayPlaces] = useState<Place[]>([]);

  // 출발지: null이면 GPS 사용, 설정 시 커스텀 좌표
  const [customOrigin, setCustomOrigin] = useState<MapCenter | null>(null);
  const [customOriginLabel, setCustomOriginLabel] = useState<string | null>(null);

  const debouncedInput = useDebounce(searchInput, 350);
  const { results: searchResults, status, search, clear } = useSearch();
  const { location: userLocation } = useGeolocation();
  const gpsSearchDone = useRef(false);

  const effectiveOrigin = customOrigin ?? userLocation;
  const gpsLabel = useReverseGeocode(userLocation);
  const effectiveOriginLabel = customOriginLabel ?? gpsLabel ?? '현재 위치';

  // GPS 자동 탐색
  useEffect(() => {
    if (!mapReady || !userLocation || gpsSearchDone.current) return;
    gpsSearchDone.current = true;
    setCenter(userLocation);
    searchNearbyAll(userLocation, 1200)
      .then((places) => { if (places.length > 0) setDisplayPlaces(places); })
      .catch(console.error);
  }, [mapReady, userLocation]);

  // 디바운스 검색
  useEffect(() => {
    if (debouncedInput.trim()) search(debouncedInput);
  }, [debouncedInput, search]);

  // 검색 성공 → 첫 결과로 지도 이동
  useEffect(() => {
    if (status === 'success' && searchResults.length > 0) {
      setDisplayPlaces(searchResults);
      setCenter({ lat: searchResults[0].lat, lng: searchResults[0].lng });
    }
  }, [status, searchResults]);

  const handleSearchChange = useCallback((keyword: string) => setSearchInput(keyword), []);

  const handleSearchSubmit = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;
      setSearchFocused(true);
      search(trimmed);
    },
    [search]
  );

  const handleSearchClear = useCallback(() => {
    setSearchInput('');
    clear();
    if (userLocation && gpsSearchDone.current) {
      searchNearbyAll(userLocation, 1200)
        .then((places) => { if (places.length > 0) setDisplayPlaces(places); })
        .catch(console.error);
    } else {
      setDisplayPlaces([]);
    }
  }, [clear, userLocation]);

  const handlePlaceSelect = useCallback(
    (place: Place) => {
      setCenter({ lat: place.lat, lng: place.lng });
      setSelectedPlace(place);
      setSheetState('peek');
      setSearchFocused(false);
      setSearchInput('');
      clear();
    },
    [clear]
  );

  const handleMarkerClick = useCallback((place: Place) => {
    setSelectedPlace(place);
    setSheetState('peek');
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetState('hidden');
    setSelectedPlace(null);
  }, []);

  const toggleRadius = useCallback((minutes: 5 | 10 | 15) => {
    setRadii((prev) =>
      prev.map((r) => (r.minutes === minutes ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const handleGpsClick = useCallback(() => {
    if (!userLocation) return;
    setCenter({ ...userLocation });
    searchNearbyAll(userLocation, 1200)
      .then((places) => { if (places.length > 0) setDisplayPlaces(places); })
      .catch(console.error);
  }, [userLocation]);

  const handleOriginChange = useCallback((origin: MapCenter, label: string) => {
    setCustomOrigin(origin);
    setCustomOriginLabel(label);
  }, []);

  const handleResetOrigin = useCallback(() => {
    setCustomOrigin(null);
    setCustomOriginLabel(null);
  }, []);

  const routeMode = selectedPlace !== null;
  const showResults = searchFocused && status !== 'idle';

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-100">
      {/* 지도 (전체 화면) */}
      <MapContainer
        center={center}
        places={displayPlaces}
        radii={radii}
        selectedPlace={selectedPlace}
        onMarkerClick={handleMarkerClick}
        onMapReady={() => setMapReady(true)}
      />

      {/* 상단 오버레이 */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="pointer-events-auto safe-area-inset-top">
          {routeMode ? (
            /* 경로 모드: 출발지 → 목적지 패널 */
            <RoutePanel
              originLabel={effectiveOriginLabel}
              destination={selectedPlace}
              onOriginChange={handleOriginChange}
              onResetOrigin={handleResetOrigin}
              onClose={handleSheetClose}
            />
          ) : (
            /* 탐색 모드: 검색바 */
            <div className="px-4 pt-4 pb-2">
              <SearchBar
                onSearch={handleSearchChange}
                onSubmit={handleSearchSubmit}
                onClear={handleSearchClear}
                status={status}
                onFocusChange={setSearchFocused}
              />
              {showResults && (
                <div className="relative">
                  <SearchResults
                    results={searchResults}
                    status={status}
                    onSelect={handlePlaceSelect}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 도보 반경 토글 (좌측 하단, 경로 모드가 아닐 때) */}
      {!routeMode && (
        <div className="absolute bottom-28 left-4 z-10 flex gap-1.5">
          {radii.map((r) => (
            <button
              key={r.minutes}
              onClick={() => toggleRadius(r.minutes)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition ${
                r.enabled
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-white/70 text-slate-400'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* 장소 수 배지 */}
      {displayPlaces.length > 0 && !routeMode && !searchFocused && (
        <div className="absolute bottom-28 right-4 z-10 px-3 py-1.5 bg-white rounded-full shadow-md text-xs font-semibold text-slate-500">
          {displayPlaces.length}개 장소
        </div>
      )}

      {/* GPS 이동 버튼 */}
      <button
        onClick={handleGpsClick}
        disabled={!userLocation}
        className="absolute bottom-10 right-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition active:scale-95"
        aria-label="현재 위치로 이동"
      >
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        </svg>
      </button>

      {/* 하단 장소 상세 시트 */}
      <BottomSheet
        state={sheetState}
        place={selectedPlace}
        userLocation={effectiveOrigin}
        originLabel={effectiveOriginLabel}
        onStateChange={setSheetState}
        onClose={handleSheetClose}
      />
    </div>
  );
}
