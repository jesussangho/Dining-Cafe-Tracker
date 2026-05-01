'use client';

import type { MapCenter } from '@/types';
import { useBusArrival } from '@/hooks/useBusArrival';

function fmtSec(sec: number): string {
  if (sec <= 0) return '곧 도착';
  const min = Math.ceil(sec / 60);
  return `${min}분`;
}

interface BusArrivalPanelProps {
  location: MapCenter | null;
  onClose: () => void;
}

export default function BusArrivalPanel({ location, onClose }: BusArrivalPanelProps) {
  const { state, refresh } = useBusArrival(location);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col" style={{ maxHeight: '70dvh' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚌</span>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {state.status === 'success' ? state.data.station.name : '버스 도착 정보'}
            </p>
            {state.status === 'success' && state.data.station.arsID && (
              <p className="text-[11px] text-slate-400">정류장 번호 {state.data.station.arsID}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={state.status === 'loading'}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 disabled:opacity-40 transition"
            aria-label="새로고침"
          >
            <svg
              className={`w-3.5 h-3.5 text-slate-500 ${state.status === 'loading' ? 'animate-spin' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
            aria-label="닫기"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="overflow-y-auto flex-1">
        {state.status === 'idle' && (
          <p className="text-sm text-slate-400 text-center py-10">위치 정보를 확인 중입니다</p>
        )}

        {state.status === 'loading' && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {state.status === 'error' && (
          <div className="px-4 py-8 text-center">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="text-sm font-semibold text-slate-700 mb-1">정보를 가져올 수 없습니다</p>
            <p className="text-xs text-slate-400">{state.message}</p>
          </div>
        )}

        {state.status === 'success' && state.data.arrivals.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-10">도착 예정 버스가 없습니다</p>
        )}

        {state.status === 'success' && state.data.arrivals.length > 0 && (
          <ul>
            {state.data.arrivals.map((bus, idx) => (
              <li
                key={`${bus.routeName}-${idx}`}
                className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-14 text-center text-sm font-bold text-slate-800 bg-blue-50 text-blue-700 rounded-lg px-2 py-1 flex-shrink-0">
                    {bus.routeName}
                  </span>
                  <span className="text-xs text-slate-400 truncate">{bus.routeTypeName}</span>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-semibold text-blue-600">{fmtSec(bus.arrivalSec)}</p>
                  {bus.arrivalSec2 > 0 && (
                    <p className="text-xs text-slate-400">{fmtSec(bus.arrivalSec2)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 안전 영역 여백 */}
      <div className="h-6 flex-shrink-0" />
    </div>
  );
}
