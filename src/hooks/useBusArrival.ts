'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MapCenter } from '@/types';
import type { BusApiResponse } from '@/app/api/bus/route';

type BusArrivalState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: BusApiResponse }
  | { status: 'error'; message: string };

export function useBusArrival(location: MapCenter | null) {
  const [state, setState] = useState<BusArrivalState>({ status: 'idle' });

  const fetchData = useCallback(() => {
    if (!location) return;
    setState({ status: 'loading' });

    globalThis
      .fetch(`/api/bus?lat=${location.lat}&lng=${location.lng}`)
      .then((res) =>
        res.json().then((json: BusApiResponse & { error?: string }) => {
          if (!res.ok) {
            setState({ status: 'error', message: json.error ?? '알 수 없는 오류가 발생했습니다' });
          } else {
            setState({ status: 'success', data: json });
          }
        })
      )
      .catch(() => {
        setState({ status: 'error', message: '네트워크 오류가 발생했습니다' });
      });
  }, [location]);

  // location이 처음 설정되면 자동 조회 (useGeolocation과 동일한 패턴)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (location) fetchData();
  }, [fetchData, location]);

  return { state, refresh: fetchData };
}
