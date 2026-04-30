'use client';

import { useEffect, useRef, useState } from 'react';
import type { BottomSheetState, Place, MapCenter } from '@/types';
import PlaceDetail from './PlaceDetail';

interface BottomSheetProps {
  state: BottomSheetState;
  place: Place | null;
  userLocation: MapCenter | null;
  onStateChange: (state: BottomSheetState) => void;
  onClose: () => void;
}

const SNAP = {
  hidden: 100,  // % translateY
  peek: 62,
  expanded: 8,
} as const;

export default function BottomSheet({
  state,
  place,
  userLocation,
  onStateChange,
  onClose,
}: BottomSheetProps) {
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);

  const baseTranslate = SNAP[state];
  const currentTranslate = dragging
    ? Math.max(0, Math.min(100, baseTranslate + dragOffset))
    : baseTranslate;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setDragging(true);
    startYRef.current = e.clientY;
    startOffsetRef.current = 0;
    setDragOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const delta = e.clientY - startYRef.current;
    const pct = (delta / window.innerHeight) * 100;
    startOffsetRef.current = pct;
    setDragOffset(pct);
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const pct = startOffsetRef.current;

    if (state === 'expanded') {
      if (pct > 25) onStateChange('peek');
    } else if (state === 'peek') {
      if (pct < -15) onStateChange('expanded');
      else if (pct > 20) onClose();
    }
    setDragOffset(0);
  };

  useEffect(() => {
    if (state === 'hidden') setDragOffset(0);
  }, [state]);

  if (!place) return null;

  return (
    <>
      {/* Backdrop */}
      {state === 'expanded' && (
        <div
          className="absolute inset-0 z-20 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div
        className={`absolute left-0 right-0 bottom-0 z-30 bg-white rounded-t-3xl shadow-2xl will-change-transform ${
          dragging ? '' : 'transition-transform duration-300 ease-out'
        }`}
        style={{ transform: `translateY(${currentTranslate}%)`, maxHeight: '92svh' }}
      >
        {/* Drag handle */}
        <div
          className="pt-3 pb-2 px-4 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />

          {/* Peek preview (place name + chevron) */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900 truncate">{place.name}</p>
              <p className="text-xs text-gray-500 truncate">{place.address}</p>
            </div>
            <button
              onClick={() => onStateChange(state === 'peek' ? 'expanded' : 'peek')}
              className="ml-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition flex-shrink-0"
              aria-label={state === 'peek' ? '펼치기' : '접기'}
            >
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                  state === 'expanded' ? 'rotate-180' : ''
                }`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable detail content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92svh - 90px)' }}>
          <PlaceDetail place={place} userLocation={userLocation} />
        </div>
      </div>
    </>
  );
}
