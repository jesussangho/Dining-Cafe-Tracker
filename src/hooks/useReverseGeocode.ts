'use client';

import { useEffect, useState } from 'react';
import type { MapCenter } from '@/types';

export function useReverseGeocode(location: MapCenter | null): string | null {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!location) {
      setAddress(null);
      return;
    }

    let cancelled = false;

    const run = () => {
      if (!window.kakao?.maps?.services) return false;
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2Address(location.lng, location.lat, (result, status) => {
        if (cancelled) return;
        if (status === kakao.maps.services.Status.OK && result[0]) {
          const full =
            result[0].road_address?.address_name ||
            result[0].address.address_name;
          // Strip leading city/province, keep last 2–3 parts for brevity
          const parts = full.split(' ');
          setAddress(parts.length > 2 ? parts.slice(-2).join(' ') : full);
        }
      });
      return true;
    };

    if (!run()) {
      const timer = setInterval(() => {
        if (run()) clearInterval(timer);
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [location]);

  return address;
}
