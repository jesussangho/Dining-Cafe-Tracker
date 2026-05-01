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
import OriginSearchOverlay from '@/components/Search/OriginSearchOverlay';
import BottomSheet from '@/components/Detail/BottomSheet';

function runNearbySearch(loc: MapCenter, setPlaces: (p: Place[]) => void) {
  searchNearbyAll(loc, 1200)
    .then((places) => { if (places.length > 0) setPlaces(places); })
    .catch(console.error);
}

export default function AppShell() {
  const [center, setCenter] = useState<MapCenter>(DEFAULT_CENTER);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [sheetState, setSheetState] = useState<BottomSheetState>('hidden');
  const [radii, setRadii] = useState<RadiusOption[]>(RADIUS_OPTIONS);
  const [searchInput, setSearchInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [displayPlaces, setDisplayPlaces] = useState<Place[]>([]);

  // 출발지
  const [customOrigin, setCustomOrigin] = useState<MapCenter | null>(null);
  const [customOriginLabel, setCustomOriginLabel] = useState<string | null>(null);
  const [originSearchOpen, setOriginSearchOpen] = useState(false);

  // 지도 클릭 팝업
  const [mapClickPoint, setMapClickPoint] = useState<MapCenter | null>(null);
  const [mapClickLabel, setMapClickLabel] = useState('위치 확인 중...');

  const debouncedInput = useDebounce(searchInput, 350);
  const { results: searchResults, status, search, clear } = useSearch();
  const { location: userLocation } = useGeolocation();
  const gpsSearchDone = useRef(false);

  const effectiveOrigin = customOrigin ?? userLocation;
  const gpsLabel = useReverseGeocode(userLocation);
  const effectiveOriginLabel = customOriginLabel ?? gpsLabel ?? '현재 위치';

  // GPS 자동 탐색 (최초 1회)
  useEffect(() => {
    if (!mapReady || !userLocation || gpsSearchDone.current) return;
    gpsSearchDone.current = true;
    setCenter(userLocation);
    runNearbySearch(userLocation, setDisplayPlaces);
  }, [mapReady, userLocation]);

  // 디바운스 검색
  useEffect(() => {
    if (debouncedInput.trim()) search(debouncedInput);
  }, [debouncedInput, search]);

  // 검색 성공 → 지도 이동 + 주변 맛집 탐색
  useEffect(() => {
    if (status === 'success' && searchResults.length > 0) {
      const first = searchResults[0];
      const newCenter = { lat: first.lat, lng: first.lng };
      setCenter(newCenter);
      runNearbySearch(newCenter, setDisplayPlaces);
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
    const origin = customOrigin ?? userLocation;
    if (origin) {
      runNearbySearch(origin, setDisplayPlaces);
    } else {
      setDisplayPlaces([]);
    }
  }, [clear, customOrigin, userLocation]);

  const handlePlaceSelect = useCallback(
    (place: Place) => {
      const loc = { lat: place.lat, lng: place.lng };
      setCenter(loc);
      setSelectedPlace(place);
      setSheetState('peek');
      setSearchFocused(false);
      setSearchInput('');
      setMapClickPoint(null);
      clear();
      runNearbySearch(loc, setDisplayPlaces);
    },
    [clear]
  );

  const handleMarkerClick = useCallback((place: Place) => {
    setSelectedPlace(place);
    setSheetState('peek');
    setMapClickPoint(null);
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
    runNearbySearch(userLocation, setDisplayPlaces);
  }, [userLocation]);

  const handleOriginSelect = useCallback(
    (origin: MapCenter, label: string) => {
      setCustomOrigin(origin);
      setCustomOriginLabel(label);
      setOriginSearchOpen(false);
      setCenter(origin);
      runNearbySearch(origin, setDisplayPlaces);
    },
    []
  );

  const handleOriginGps = useCallback(() => {
    setCustomOrigin(null);
    setCustomOriginLabel(null);
    setOriginSearchOpen(false);
    if (userLocation) {
      setCenter({ ...userLocation });
      runNearbySearch(userLocation, setDisplayPlaces);
    }
  }, [userLocation]);

  const handleRoutePanelOriginChange = useCallback(
    (origin: MapCenter, label: string) => {
      setCustomOrigin(origin);
      setCustomOriginLabel(label);
    },
    []
  );

  const handleRoutePanelOriginReset = useCallback(() => {
    setCustomOrigin(null);
    setCustomOriginLabel(null);
  }, []);

  // 지도 클릭 → 팝업 표시 + 역지오코딩
  const handleMapClick = useCallback((clicked: MapCenter) => {
    setMapClickPoint(clicked);
    setMapClickLabel('위치 확인 중...');

    if (window.kakao?.maps?.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(clicked.lng, clicked.lat, (result, status) => {
        if (status === 'OK' && result[0]) {
          const addr =
            result[0].road_address?.address_name || result[0].address.address_name;
          setMapClickLabel(addr);
        } else {
          setMapClickLabel('선택한 위치');
        }
      });
    }
  }, []);

  // 팝업 → 출발지로 설정
  const handleSetAsOrigin = useCallback(() => {
    if (!mapClickPoint) return;
    setCustomOrigin(mapClickPoint);
    const parts = mapClickLabel.split(' ');
    setCustomOriginLabel(parts.slice(-2).join(' '));
    setMapClickPoint(null);
    if (!selectedPlace) runNearbySearch(mapClickPoint, setDisplayPlaces);
  }, [mapClickPoint, mapClickLabel, selectedPlace]);

  // 팝업 → 도착지로 설정
  const handleSetAsDestination = useCallback(() => {
    if (!mapClickPoint) return;
    const label = mapClickLabel || '선택한 위치';
    const destination: Place = {
      id: `pin_${Date.now()}`,
      name: label,
      category: '직접 선택한 위치',
      categoryGroupCode: '',
      address: label,
      addressLegacy: label,
      phone: '',
      lat: mapClickPoint.lat,
      lng: mapClickPoint.lng,
      placeUrl: `https://map.kakao.com/link/map/${encodeURIComponent(label)},${mapClickPoint.lat},${mapClickPoint.lng}`,
    };
    setSelectedPlace(destination);
    setSheetState('peek');
    setCenter(mapClickPoint);
    setMapClickPoint(null);
  }, [mapClickPoint, mapClickLabel]);

  const routeMode = selectedPlace !== null;
  const showResults = searchFocused && status !== 'idle';
  // 팝업은 BottomSheet가 닫혀 있을 때만 표시
  const showMapClickPopup = mapClickPoint !== null && sheetState === 'hidden' && !searchFocused;

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
        onMapClick={handleMapClick}
      />

      {/* 상단 오버레이 */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-4 pt-4 pb-2">
        {routeMode ? (
          <div className="pointer-events-auto">
            <RoutePanel
              originLabel={effectiveOriginLabel}
              destination={selectedPlace}
              onOriginChange={handleRoutePanelOriginChange}
              onResetOrigin={handleRoutePanelOriginReset}
              onClose={handleSheetClose}
            />
          </div>
        ) : (
          <>
            <div className="pointer-events-auto">
              <SearchBar
                onSearch={handleSearchChange}
                onSubmit={handleSearchSubmit}
                onClear={handleSearchClear}
                status={status}
                onFocusChange={setSearchFocused}
              />
              {showResults && (
                <div className="relative mt-2">
                  <SearchResults
                    results={searchResults}
                    status={status}
                    onSelect={handlePlaceSelect}
                  />
                </div>
              )}
            </div>

            {!showResults && (
              <button
                className="pointer-events-auto mt-2 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md px-3.5 py-2 text-xs text-slate-600 hover:bg-white active:bg-slate-50 transition"
                onClick={() => setOriginSearchOpen(true)}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="font-medium truncate max-w-[180px]">{effectiveOriginLabel}</span>
                <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {/* 도보 반경 토글 */}
      {!routeMode && !showMapClickPopup && (
        <div className="absolute bottom-28 left-4 z-10 flex gap-1.5">
          {radii.map((r) => (
            <button
              key={r.minutes}
              onClick={() => toggleRadius(r.minutes)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition active:scale-95 ${
                r.enabled ? 'bg-white text-blue-600' : 'bg-white/70 text-slate-400'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* 장소 수 배지 */}
      {displayPlaces.length > 0 && !routeMode && !searchFocused && !showMapClickPopup && (
        <div className="absolute bottom-28 right-4 z-10 px-3 py-1.5 bg-white rounded-full shadow-md text-xs font-semibold text-slate-500">
          {displayPlaces.length}개 장소
        </div>
      )}

      {/* 지도 클릭 팝업 — 출발지 / 도착지 선택 */}
      {showMapClickPopup && (
        <div className="absolute bottom-6 left-4 right-4 z-20 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400 mb-0.5">선택한 위치</p>
              <p className="text-sm font-semibold text-slate-800 leading-snug">{mapClickLabel}</p>
            </div>
            <button
              onClick={() => setMapClickPoint(null)}
              className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={handleSetAsOrigin}
              className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-bold active:bg-emerald-600 transition"
            >
              출발지로 설정
            </button>
            <button
              onClick={handleSetAsDestination}
              className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-sm font-bold active:bg-rose-600 transition"
            >
              도착지로 설정
            </button>
          </div>
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

      {/* 출발지 검색 전체화면 오버레이 */}
      {originSearchOpen && (
        <OriginSearchOverlay
          currentLabel={effectiveOriginLabel}
          onSelect={handleOriginSelect}
          onUseGps={handleOriginGps}
          onClose={() => setOriginSearchOpen(false)}
        />
      )}
    </div>
  );
}
