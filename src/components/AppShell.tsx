'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BottomSheetState, MapCenter, Place, RadiusOption } from '@/types';
import { DEFAULT_CENTER, RADIUS_OPTIONS } from '@/constants/map';
import { searchNearbyAll } from '@/services/kakaoMaps';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useGeolocation } from '@/hooks/useGeolocation';
import MapContainer from '@/components/Map/MapContainer';
import SearchBar from '@/components/Search/SearchBar';
import SearchResults from '@/components/Search/SearchResults';
import BottomSheet from '@/components/Detail/BottomSheet';

export default function AppShell() {
  const [center, setCenter] = useState<MapCenter>(DEFAULT_CENTER);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [sheetState, setSheetState] = useState<BottomSheetState>('hidden');
  const [radii, setRadii] = useState<RadiusOption[]>(RADIUS_OPTIONS);
  const [searchInput, setSearchInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // 지도에 표시할 장소 (검색 결과 or GPS 자동 탐색)
  const [displayPlaces, setDisplayPlaces] = useState<Place[]>([]);

  const debouncedInput = useDebounce(searchInput, 350);
  const { results: searchResults, status, search, clear } = useSearch();
  const { location: userLocation } = useGeolocation();

  const gpsSearchDone = useRef(false);

  // ── GPS: 지도 준비 + 위치 확보 시 주변 맛집/카페 자동 탐색 ──
  useEffect(() => {
    if (!mapReady || !userLocation || gpsSearchDone.current) return;
    gpsSearchDone.current = true;
    setCenter(userLocation);
    searchNearbyAll(userLocation, 1200)
      .then((places) => {
        if (places.length > 0) setDisplayPlaces(places);
      })
      .catch(console.error);
  }, [mapReady, userLocation]);

  // ── 검색: 디바운스 입력으로 키워드 검색 ──
  useEffect(() => {
    if (debouncedInput.trim()) search(debouncedInput);
  }, [debouncedInput, search]);

  // ── 검색 성공: 첫 번째 결과로 지도 자동 포커싱 + 마커 표시 ──
  useEffect(() => {
    if (status === 'success' && searchResults.length > 0) {
      setDisplayPlaces(searchResults);
      setCenter({ lat: searchResults[0].lat, lng: searchResults[0].lng });
    }
  }, [status, searchResults]);

  const handleSearchChange = useCallback((keyword: string) => {
    setSearchInput(keyword);
  }, []);

  // Enter 키: debounce 없이 즉시 검색
  const handleSearchSubmit = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setSearchFocused(true);
    search(trimmed);
  }, [search]);

  const handleSearchClear = useCallback(() => {
    setSearchInput('');
    clear();
    // GPS 자동 탐색 결과 복원
    if (userLocation && gpsSearchDone.current) {
      searchNearbyAll(userLocation, 1200)
        .then((places) => { if (places.length > 0) setDisplayPlaces(places); })
        .catch(console.error);
    } else {
      setDisplayPlaces([]);
    }
  }, [clear, userLocation]);

  const handlePlaceSelect = useCallback((place: Place) => {
    setCenter({ lat: place.lat, lng: place.lng });
    setSelectedPlace(place);
    setSheetState('peek');
    setSearchFocused(false);
    setSearchInput('');
    clear();
  }, [clear]);

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
    // GPS 버튼으로 돌아올 때도 주변 재탐색
    searchNearbyAll(userLocation, 1200)
      .then((places) => { if (places.length > 0) setDisplayPlaces(places); })
      .catch(console.error);
  }, [userLocation]);

  const showResults = searchFocused && status !== 'idle';

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-gray-100">
      {/* 지도 */}
      <MapContainer
        center={center}
        places={displayPlaces}
        radii={radii}
        selectedPlace={selectedPlace}
        onMarkerClick={handleMarkerClick}
        onMapReady={() => setMapReady(true)}
      />

      {/* 검색바 오버레이 */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4 pb-2 pointer-events-none">
        <div className="relative pointer-events-auto">
          <SearchBar
            onSearch={handleSearchChange}
            onSubmit={handleSearchSubmit}
            onClear={handleSearchClear}
            status={status}
            onFocusChange={setSearchFocused}
          />
          {showResults && (
            <SearchResults
              results={searchResults}
              status={status}
              onSelect={handlePlaceSelect}
            />
          )}
        </div>
      </div>

      {/* 도보권 토글 */}
      <div className="absolute top-20 left-4 z-10 flex flex-col gap-1.5">
        {radii.map((r) => (
          <button
            key={r.minutes}
            onClick={() => toggleRadius(r.minutes)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow transition ${
              r.enabled
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white/60 text-gray-400'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* 장소 수 배지 */}
      {displayPlaces.length > 0 && (
        <div className="absolute top-20 right-4 z-10 px-3 py-1.5 bg-white rounded-xl shadow text-xs font-semibold text-gray-600">
          {displayPlaces.length}개 장소
        </div>
      )}

      {/* GPS 버튼 */}
      <button
        onClick={handleGpsClick}
        disabled={!userLocation}
        className="absolute bottom-8 right-4 z-10 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition"
        aria-label="현재 위치로 이동"
      >
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        </svg>
      </button>

      {/* 하단 스와이프 시트 */}
      <BottomSheet
        state={sheetState}
        place={selectedPlace}
        userLocation={userLocation}
        onStateChange={setSheetState}
        onClose={handleSheetClose}
      />
    </div>
  );
}
