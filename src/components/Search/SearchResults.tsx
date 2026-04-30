'use client';

import type { Place, SearchState } from '@/types';
import { KAKAO_CATEGORY_LABELS } from '@/constants/map';

interface SearchResultsProps {
  results: Place[];
  status: SearchState;
  onSelect: (place: Place) => void;
}

export default function SearchResults({ results, status, onSelect }: SearchResultsProps) {
  if (status === 'idle' || status === 'loading') return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto z-10">
      {status === 'zero' && (
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          검색 결과가 없습니다.
        </div>
      )}
      {status === 'error' && (
        <div className="px-4 py-6 text-center text-sm text-red-400">
          검색 중 오류가 발생했습니다.
        </div>
      )}
      {status === 'success' &&
        results.map((place) => {
          const categoryLabel =
            KAKAO_CATEGORY_LABELS[place.categoryGroupCode] ?? place.category.split('>')[0];
          return (
            <button
              key={place.id}
              onClick={() => onSelect(place)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left transition border-b border-gray-100 last:border-0"
            >
              <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800 truncate">{place.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{categoryLabel}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{place.address}</p>
              </div>
            </button>
          );
        })}
    </div>
  );
}
