'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MapCenter } from '@/types';
import { getCurrentPosition } from '@/services/geolocation';

interface UseGeolocationReturn {
  location: MapCenter | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<MapCenter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getCurrentPosition()
      .then((pos) => {
        setLocation(pos);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? '위치 정보를 가져올 수 없습니다.');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { location, isLoading, error, refresh: fetch };
}
