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

// viewport 기준 고정 픽셀로 peek 높이를 보장
const PEEK_PX = 180; // 화면 하단에서 이 높이만큼 노출

export default function BottomSheet({
  state,
  place,
  userLocation,
  onStateChange,
  onClose,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetH, setSheetH] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const startYRef = useRef(0);

  // sheet 실제 높이 측정
  useEffect(() => {
    if (!sheetRef.current) return;
    const ro = new ResizeObserver(() => {
      setSheetH(sheetRef.current?.offsetHeight ?? 0);
    });
    ro.observe(sheetRef.current);
    return () => ro.disconnect();
  }, [place]);

  // translateY 계산 (px 기준)
  const translateY = (() => {
    if (state === 'hidden') return sheetH || 600;
    if (state === 'expanded') return 0;
    // peek: 상단 PEEK_PX 만큼만 노출
    return Math.max(0, sheetH - PEEK_PX);
  })();

  const currentY = dragging
    ? Math.max(0, translateY + dragPx)
    : translateY;

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
        <div className="absolute inset-0 z-20 bg-black/25" onClick={onClose} />
      )}

      <div
        ref={sheetRef}
        className={`absolute left-0 right-0 bottom-0 z-30 bg-white rounded-t-3xl shadow-2xl will-change-transform ${
          dragging ? '' : 'transition-transform duration-300 ease-out'
        }`}
        style={{
          transform: `translateY(${currentY}px)`,
          maxHeight: '92dvh',
        }}
      >
        {/* 드래그 핸들 영역 */}
        <div
          className="pt-3 pb-1 px-4 cursor-grab active:cursor-grabbing touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto" />

          <div className="flex items-center justify-between mt-3 mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900 leading-snug truncate">
                {place.name}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{place.address}</p>
            </div>

            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              <button
                onClick={() => onStateChange(state === 'peek' ? 'expanded' : 'peek')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                aria-label={state === 'peek' ? '자세히 보기' : '접기'}
              >
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                    state === 'expanded' ? 'rotate-180' : ''
                  }`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                aria-label="닫기"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 상세 내용 */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 88px)' }}>
          <PlaceDetail place={place} userLocation={userLocation} />
        </div>
      </div>
    </>
  );
}
