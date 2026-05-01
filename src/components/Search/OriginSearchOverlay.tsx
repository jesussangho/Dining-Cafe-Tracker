'use client';

import { useRef, useState } from 'react';
import type { MapCenter } from '@/types';

interface OriginSearchOverlayProps {
  currentLabel: string;
  onSelect: (origin: MapCenter, label: string) => void;
  onUseGps: () => void;
  onClose: () => void;
}

export default function OriginSearchOverlay({
  currentLabel,
  onSelect,
  onUseGps,
  onClose,
}: OriginSearchOverlayProps) {
  const [inputVal, setInputVal] = useState('');
  const [suggestions, setSuggestions] = useState<kakao.maps.services.PlacesSearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (val: string) => {
    setInputVal(val);
    if (!val.trim() || !window.kakao?.maps?.services) {
      setSuggestions([]);
      return;
    }
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(val, (results, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setSuggestions(results.slice(0, 7));
      } else {
        setSuggestions([]);
      }
    });
  };

  const handleSelect = (item: kakao.maps.services.PlacesSearchResultItem) => {
    onSelect(
      { lat: parseFloat(item.y), lng: parseFloat(item.x) },
      item.place_name || item.road_address_name || item.address_name
    );
  };

  const handleGps = () => {
    onUseGps();
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
        <button
          onClick={onClose}
          className="p-2 -ml-1 rounded-full hover:bg-slate-100 transition flex-shrink-0"
          aria-label="뒤로"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1 bg-slate-100 rounded-2xl px-3 py-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={inputVal}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="출발지 검색 (주소, 장소명)"
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          />
          {inputVal && (
            <button
              onClick={() => { setInputVal(''); setSuggestions([]); }}
              className="flex-shrink-0 w-4 h-4"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Current origin display */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
        <p className="text-xs text-slate-400">현재 출발지</p>
        <p className="text-sm text-slate-700 font-medium mt-0.5">{currentLabel}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* GPS option */}
        <button
          onClick={handleGps}
          className="flex items-center gap-3 w-full px-4 py-4 hover:bg-blue-50 transition border-b border-slate-50"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4.5 h-4.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeWidth={2} d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-blue-600">현재 GPS 위치 사용</p>
            <p className="text-xs text-slate-400 mt-0.5">내 실시간 위치를 출발지로 설정</p>
          </div>
        </button>

        {/* Search suggestions */}
        {suggestions.length > 0 && (
          <div>
            {suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="flex items-start gap-3 w-full px-4 py-3.5 hover:bg-slate-50 transition border-b border-slate-50 last:border-0 text-left"
              >
                <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.place_name}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {item.road_address_name || item.address_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty state hint */}
        {suggestions.length === 0 && inputVal.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-400">주소나 장소명을 입력하세요</p>
            <p className="text-xs text-slate-300 mt-1">예) 강남역, 홍대입구, 서울시청</p>
          </div>
        )}
        {suggestions.length === 0 && inputVal.length > 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-400">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
