'use client';

import type { Place, SearchState } from '@/types';
import { KAKAO_CATEGORY_LABELS } from '@/constants/map';

const CATEGORY_COLOR: Record<string, string> = {
  FD6: 'bg-orange-100 text-orange-600',
  CE7: 'bg-violet-100 text-violet-600',
};

interface SearchResultsProps {
  results: Place[];
  status: SearchState;
  onSelect: (place: Place) => void;
}

export default function SearchResults({ results, status, onSelect }: SearchResultsProps) {
  if (status === 'idle' || status === 'loading') return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto z-10 ring-1 ring-slate-100">
      {status === 'zero' && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-slate-400">검색 결과가 없습니다</p>
        </div>
      )}
      {status === 'error' && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-rose-400">검색 중 오류가 발생했습니다</p>
        </div>
      )}
      {status === 'success' &&
        results.map((place) => {
          const categoryLabel =
            KAKAO_CATEGORY_LABELS[place.categoryGroupCode] ??
            place.category.split('>')[0].trim();
          const colorClass = CATEGORY_COLOR[place.categoryGroupCode] ?? 'bg-slate-100 text-slate-500';
          return (
            <button
              key={place.id}
              onClick={() => onSelect(place)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition border-b border-slate-50 last:border-0"
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${colorClass}`}>
                {place.categoryGroupCode === 'CE7' ? '☕' : '🍽️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-800 truncate">{place.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${colorClass}`}>
                    {categoryLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{place.address}</p>
              </div>
              {place.distance && (
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {place.distance >= 1000
                    ? `${(place.distance / 1000).toFixed(1)}km`
                    : `${place.distance}m`}
                </span>
              )}
            </button>
          );
        })}
    </div>
  );
}
