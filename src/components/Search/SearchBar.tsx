'use client';

import { useRef, useState } from 'react';
import type { SearchState } from '@/types';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  onClear: () => void;
  status: SearchState;
  onFocusChange?: (focused: boolean) => void;
}

export default function SearchBar({
  onSearch,
  onClear,
  status,
  onFocusChange,
}: SearchBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (!v.trim()) {
      onClear();
    } else {
      onSearch(v);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(value);
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleClear = () => {
    setValue('');
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 text-gray-400 pointer-events-none">
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
        className="w-full pl-9 pr-9 py-3 rounded-2xl bg-white shadow-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-gray-400 hover:text-gray-600 transition"
          aria-label="검색어 지우기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
