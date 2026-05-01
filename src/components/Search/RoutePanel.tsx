'use client';

import { useRef, useState } from 'react';
import type { MapCenter, Place } from '@/types';

interface RoutePanelProps {
  originLabel: string;
  destination: Place;
  onOriginChange: (origin: MapCenter, label: string) => void;
  onResetOrigin: () => void;
  onClose: () => void;
}

export default function RoutePanel({
  originLabel,
  destination,
  onOriginChange,
  onResetOrigin,
  onClose,
}: RoutePanelProps) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [suggestions, setSuggestions] = useState<kakao.maps.services.PlacesSearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const openEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const closeEdit = () => {
    setEditing(false);
    setInputVal('');
    setSuggestions([]);
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);
    if (!val.trim() || !window.kakao?.maps?.services) {
      setSuggestions([]);
      return;
    }
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(val, (results, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setSuggestions(results.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    });
  };

  const handleSelect = (item: kakao.maps.services.PlacesSearchResultItem) => {
    onOriginChange(
      { lat: parseFloat(item.y), lng: parseFloat(item.x) },
      item.place_name || item.road_address_name || item.address_name
    );
    closeEdit();
  };

  const handleUseGps = () => {
    onResetOrigin();
    closeEdit();
  };

  if (editing) {
    return (
      <div className="mx-4 mt-safe-top mt-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <button
            onClick={closeEdit}
            className="p-1.5 -ml-1 rounded-full hover:bg-slate-100 transition flex-shrink-0"
            aria-label="뒤로"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="출발지 검색…"
              className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
            />
          </div>
          {inputVal && (
            <button
              onClick={() => { setInputVal(''); setSuggestions([]); }}
              className="p-1 flex-shrink-0"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* GPS option */}
        <button
          onClick={handleUseGps}
          className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-blue-50 transition border-b border-slate-50"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeWidth={2} d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            </svg>
          </div>
          <span className="text-sm font-medium text-blue-600">현재 위치 사용</span>
        </button>

        {/* Suggestions */}
        {suggestions.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className="flex items-start gap-3 w-full px-4 py-3 hover:bg-slate-50 transition border-b border-slate-50 last:border-0 text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{item.place_name}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {item.road_address_name || item.address_name}
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-4 mt-safe-top mt-4 bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-3">
        {/* Close */}
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-100 transition flex-shrink-0"
          aria-label="닫기"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Origin → Destination */}
        <div className="flex-1 min-w-0">
          {/* Origin row */}
          <button
            onClick={openEdit}
            className="flex items-center gap-2.5 w-full rounded-xl hover:bg-slate-50 px-2 py-1.5 -mx-2 text-left transition"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-sm text-slate-600 truncate">{originLabel}</span>
            <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Connector */}
          <div className="ml-3 pl-[1px] border-l-2 border-dashed border-slate-200 h-2 my-0.5" />

          {/* Destination row */}
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-900 truncate">{destination.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
