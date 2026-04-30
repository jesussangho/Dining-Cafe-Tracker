# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mobile-first web service that visualizes nearby restaurants and cafes within walking distance of a user's current location or searched place, with optimal route suggestions.

## Tech Stack

- **Framework**: Next.js 14+ with App Router, TypeScript
- **Styling**: Tailwind CSS
- **Map/Search API**: Kakao Maps SDK or Naver Maps SDK (includes place search library)
- **Deployment**: Vercel (GitHub auto-deploy)

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # Run ESLint
npm run test      # Run tests (if configured)
npx tsc --noEmit  # Type-check without emitting
```

## Architecture

This is a Next.js App Router project. The three pillars of the UI map directly to three component directories:

- `src/components/Search/` — Place/address search bar and results list. Drives the map's center point when a result is selected.
- `src/components/Map/` — Kakao/Naver map rendering, walking-radius overlays (5/10/15 min), and place markers.
- `src/components/Detail/` — Bottom swipe-sheet showing place details (menu, rating) and route info cards.

Cross-cutting logic lives outside components:
- `src/hooks/` — Custom hooks for search API calls and GPS location tracking.
- `src/services/` — Thin wrappers around Kakao/Naver search API endpoints; keep all API key usage here.

### Key Data Flow

1. User searches or GPS fires → hook in `src/hooks/` calls service in `src/services/`
2. Result updates map center → `Map/` component redraws radius overlays and place markers
3. User taps a marker → `Detail/` sheet slides up with place info and route options

### Map API Keys

Kakao/Naver SDK keys must be set as environment variables and loaded server-side or via `next.config.js` `env` block — never hardcoded in client components.
