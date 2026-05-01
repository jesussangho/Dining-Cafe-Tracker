'use client';

import { useRef, useState } from 'react';
import type { SearchState } from '@/types';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  onSubmit: (keyword: string) => void;
  onClear: () => void;
  status: SearchState;
  onFocusChange?: (focused: boolean) => void;
}

export default function SearchBar({
  onSearch,
  onSubmit,
  onClear,
  status,
  onFocusChange,
}: SearchBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (!v.trim()) onClear();
    else onSearch(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) onSubmit(value.trim());
    }
    if (e.key === 'Escape') handleClear();
  };

  const handleClear = () => {
    setValue('');
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg px-3.5 py-3 ring-1 ring-slate-100">
      <div className="flex-shrink-0 text-slate-400">
        {status === 'loading' ? (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => onFocusChange?.(true)}
        onBlur={() => setTimeout(() => onFocusChange?.(false), 150)}
        placeholder="장소, 주소 검색"
        className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
      />

      {value ? (
        <button
          onClick={handleClear}
          className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition"
          aria-label="검색어 지우기"
        >
          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ) : (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
        </div>
      )}
    </div>
  );
}
