'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BottomSheetState, MapCenter, Place, RadiusOption } from '@/types';
import { DEFAULT_CENTER, RADIUS_OPTIONS } from '@/constants/map';
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

  const debouncedInput = useDebounce(searchInput, 350);
  const { results, status, search, clear } = useSearch();
  const { location: userLocation } = useGeolocation();

  // GPS 위치를 얻으면 초기 중심을 사용자 위치로 이동
  const gpsInitialized = useRef(false);
  useEffect(() => {
    if (userLocation && !gpsInitialized.current) {
      gpsInitialized.current = true;
      setCenter(userLocation);
    }
  }, [userLocation]);

  // 디바운스된 입력으로 검색 실행
  useEffect(() => {
    if (debouncedInput.trim()) {
      search(debouncedInput);
    }
  }, [debouncedInput, search]);

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
  }, [clear]);

  const handlePlaceSelect = useCallback((place: Place) => {
    setCenter({ lat: place.lat, lng: place.lng });
    setSelectedPlace(place);
    setSheetState('peek');
    clear();
    setSearchInput('');
    setSearchFocused(false);
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
    if (userLocation) setCenter({ ...userLocation });
  }, [userLocation]);

  const showResults = searchFocused && status !== 'idle';

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-gray-100">
      {/* Map layer */}
      <MapContainer
        center={center}
        places={results}
        radii={radii}
        selectedPlace={selectedPlace}
        onMarkerClick={handleMarkerClick}
      />

      {/* Search overlay */}
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
              results={results}
              status={status}
              onSelect={handlePlaceSelect}
            />
          )}
        </div>
      </div>

      {/* Radius toggle buttons */}
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

      {/* GPS button */}
      <button
        onClick={handleGpsClick}
        disabled={!userLocation}
        className="absolute bottom-8 right-4 z-10 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition"
        aria-label="현재 위치로 이동"
      >
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2}
            d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        </svg>
      </button>

      {/* Bottom sheet */}
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
