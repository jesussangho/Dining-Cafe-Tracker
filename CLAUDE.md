# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mobile-first web service (Next.js 16 + React 19 + TypeScript + Tailwind CSS v4) that visualizes nearby restaurants and cafes within walking distance of a searched or GPS-detected location, with optimal route suggestions.

**GitHub**: https://github.com/jesussangho/Dining-Cafe-Tracker  
**Deploy**: Vercel (connect repo → auto-deploy on push to `main`)

## Commands

```bash
npm run dev       # Dev server at http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # Type-check
```

## Environment

Copy `.env.example` → `.env.local` and fill in:
```
NEXT_PUBLIC_KAKAO_MAP_KEY=<JavaScript app key from https://developers.kakao.com>
```

The key is inlined at build time (`NEXT_PUBLIC_` prefix). No server-side handling needed.

## Architecture

### Data flow: Search → Map → BottomSheet

1. User types in `SearchBar` → debounced (350ms) → `useSearch` calls `kakaoMaps.ts#searchPlacesByKeyword`
2. Results appear in `SearchResults` dropdown → user selects → `AppShell` sets `center` + `selectedPlace`
3. `MapContainer` receives new `center` → `useKakaoMap#panTo` fires → `useRadiusCircles` redraws rings at new center
4. `selectedPlace` triggers `panAndZoom` (level 3) and opens `BottomSheet` in `peek` state
5. User swipes up → `BottomSheet` expands → `PlaceDetail` shows address, phone, `RouteCard`

### Key files

| File | Role |
|------|------|
| `src/components/AppShell.tsx` | Single stateful orchestrator; owns all cross-cutting state |
| `src/components/KakaoScript.tsx` | `'use client'` wrapper for `next/script`; fires `window.__kakaoMapOnLoad?.()` on load |
| `src/hooks/useKakaoMap.ts` | Map instance lifecycle; uses `window.__kakaoMapOnLoad` bridge for SDK timing |
| `src/hooks/useRadiusCircles.ts` | Draws/redraws 3 `kakao.maps.Circle` overlays when center or enabled radii change |
| `src/hooks/useMapMarkers.ts` | Creates/destroys markers; attaches click → `onMarkerClick` → BottomSheet |
| `src/services/kakaoMaps.ts` | All Kakao SDK calls; `normalizePlace` swaps `x`→lng, `y`→lat (Kakao quirk) |
| `src/types/kakao.d.ts` | Global `declare namespace kakao.maps` + `Window` augmentation |

### Walking radius constants

- 5 min = 400 m (WALKING_SPEED_MPM = 80 m/min)
- 10 min = 800 m
- 15 min = 1200 m

Route card also estimates transit (200 m/min) and car (300 m/min) locally.

### Kakao SDK loading pattern

`layout.tsx` (server) → renders `<KakaoScript>` (client component) → `next/script strategy="afterInteractive"` with `onLoad` that calls `window.__kakaoMapOnLoad?.()`. `useKakaoMap` sets that callback before the script loads; on hot-reload it checks `window.kakao?.maps` immediately.

### Tailwind CSS v4

This project uses Tailwind v4 (no `tailwind.config.ts`). CSS is configured in `globals.css` via `@import "tailwindcss"` and `@theme inline {}`. Standard utility classes work as usual.

### Mobile viewport

Uses `h-[100dvh]` (dynamic viewport height) to avoid iOS Safari address-bar layout shift. `overflow: hidden` on `html, body` prevents page scroll.
