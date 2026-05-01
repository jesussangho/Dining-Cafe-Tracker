'use client';

import { useEffect, useRef, useState } from 'react';
import type { BottomSheetState, Place, MapCenter } from '@/types';
import PlaceDetail from './PlaceDetail';

interface BottomSheetProps {
  state: BottomSheetState;
  place: Place | null;
  userLocation: MapCenter | null;
  originLabel: string | null;
  onStateChange: (state: BottomSheetState) => void;
  onClose: () => void;
}

const PEEK_PX = 200;

export default function BottomSheet({
  state,
  place,
  userLocation,
  originLabel,
  onStateChange,
  onClose,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetH, setSheetH] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const startYRef = useRef(0);

  useEffect(() => {
    if (!sheetRef.current) return;
    const ro = new ResizeObserver(() => {
      setSheetH(sheetRef.current?.offsetHeight ?? 0);
    });
    ro.observe(sheetRef.current);
    return () => ro.disconnect();
  }, [place]);

  const translateY = (() => {
    if (state === 'hidden') return sheetH || 700;
    if (state === 'expanded') return 0;
    return Math.max(0, sheetH - PEEK_PX);
  })();

  const currentY = dragging ? Math.max(0, translateY + dragPx) : translateY;

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    startYRef.current = e.clientY;
    setDragPx(0);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragPx(e.clientY - startYRef.current);
  };
  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const delta = dragPx;
    setDragPx(0);
    if (state === 'expanded' && delta > 80) onStateChange('peek');
    else if (state === 'peek') {
      if (delta < -60) onStateChange('expanded');
      else if (delta > 100) onClose();
    }
  };

  if (!place) return null;

  return (
    <>
      {state === 'expanded' && (
        <div
          className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      <div
        ref={sheetRef}
        className={`absolute left-0 right-0 bottom-0 z-30 bg-white rounded-t-3xl shadow-2xl will-change-transform ${
          dragging ? '' : 'transition-transform duration-300 ease-out'
        }`}
        style={{ transform: `translateY(${currentY}px)`, maxHeight: '92dvh' }}
      >
        {/* Drag handle zone */}
        <div
          className="pt-3 pb-0 px-4 cursor-grab active:cursor-grabbing touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Handle pill */}
          <div className="w-9 h-1 bg-slate-200 rounded-full mx-auto mb-3" />

          {/* Place header */}
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-slate-900 leading-snug truncate">
                {place.name}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{place.address}</p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onStateChange(state === 'peek' ? 'expanded' : 'peek')}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                aria-label={state === 'peek' ? '자세히 보기' : '접기'}
              >
                <svg
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                    state === 'expanded' ? 'rotate-180' : ''
                  }`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                aria-label="닫기"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable detail */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 96px)' }}>
          <PlaceDetail place={place} userLocation={userLocation} originLabel={originLabel} />
        </div>
      </div>
    </>
  );
}
