'use client';

import { useCallback, useState } from 'react';
import type { Place, SearchState } from '@/types';
import { searchPlacesByKeyword } from '@/services/kakaoMaps';

interface UseSearchReturn {
  results: Place[];
  status: SearchState;
  search: (keyword: string) => void;
  clear: () => void;
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState<SearchState>('idle');

  const search = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setResults([]);
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    searchPlacesByKeyword(trimmed)
      .then((places) => {
        if (cancelled) return;
        setResults(places);
        setStatus(places.length === 0 ? 'zero' : 'success');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setStatus('idle');
  }, []);

  return { results, status, search, clear };
}
