# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 언어 규칙

- 모든 응답, 설명, 선택지, 질문은 **반드시 한국어**로 작성한다.
- 코드 주석도 한국어로 작성한다.

## 프로젝트 개요

모바일 우선 웹 서비스 (Next.js 16 + React 19 + TypeScript + Tailwind CSS v4).
검색하거나 GPS로 감지한 위치 주변의 음식점·카페를 도보 반경으로 시각화하고 최적 경로를 제안한다.

**GitHub**: https://github.com/jesussangho/Dining-Cafe-Tracker  
**배포**: Vercel — `main` 브랜치 푸시 시 자동 배포

## 주요 명령어

```bash
npm run dev       # 개발 서버 http://localhost:3000
npm run build     # 프로덕션 빌드
npm run lint      # ESLint
npx tsc --noEmit  # 타입 체크
```

## 환경 변수

`.env.example` → `.env.local` 복사 후 입력:
```
NEXT_PUBLIC_KAKAO_MAP_KEY=<https://developers.kakao.com 의 JavaScript 앱 키>
```

빌드 시 인라인 (`NEXT_PUBLIC_` 접두사). 서버 처리 불필요.

## 아키텍처

### 데이터 흐름: 검색 → 지도 → BottomSheet

1. `SearchBar` 입력 → 350ms 디바운스 → `useSearch`가 `kakaoMaps.ts#searchPlacesByKeyword` 호출
2. `SearchResults` 드롭다운 → 선택 → `AppShell`이 `center` + `selectedPlace` 설정
3. `MapContainer`가 새 `center` 수신 → `useKakaoMap#panTo` → `useRadiusCircles`가 반경 링 재드로우
4. `selectedPlace` → `panAndZoom`(레벨 3) + `BottomSheet` peek 오픈
5. 위로 스와이프 → `BottomSheet` 확장 → `PlaceDetail`이 주소·전화·`RouteCard` 표시

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `src/components/AppShell.tsx` | 상태 오케스트레이터 — 모든 교차 상태 소유 |
| `src/components/KakaoScript.tsx` | `next/script` 클라이언트 래퍼; 로드 시 `window.__kakaoMapOnLoad?.()` 실행 |
| `src/hooks/useKakaoMap.ts` | 지도 인스턴스 생명주기; `window.__kakaoMapOnLoad` 브리지로 SDK 타이밍 처리 |
| `src/hooks/useRadiusCircles.ts` | center·반경 변경 시 `kakao.maps.Circle` 3개 재드로우 |
| `src/hooks/useMapMarkers.ts` | 마커 생성/삭제; 클릭 → `onMarkerClick` → BottomSheet |
| `src/services/kakaoMaps.ts` | 모든 Kakao SDK 호출; `normalizePlace`에서 `x`→lng, `y`→lat 변환 (Kakao 특이사항) |
| `src/types/kakao.d.ts` | 전역 `declare namespace kakao.maps` + `Window` 보강 |

### 도보 반경 상수

- 5분 = 400m (WALKING_SPEED_MPM = 80m/분)
- 10분 = 800m
- 15분 = 1200m

RouteCard는 대중교통(200m/분)·자차(300m/분) 시간도 로컬 추정.

### Kakao SDK 로딩 패턴

`layout.tsx`(서버) → `<KakaoScript>`(클라이언트) → `next/script strategy="afterInteractive"` → `onLoad`에서 `window.__kakaoMapOnLoad?.()` 호출.
`useKakaoMap`은 스크립트 로드 전에 콜백을 등록하고, 핫리로드 시엔 `window.kakao?.maps`를 즉시 확인한다.

### Tailwind CSS v4

`tailwind.config.ts` 없음. `globals.css`에서 `@import "tailwindcss"` + `@theme inline {}` 로 설정. 표준 유틸리티 클래스 그대로 사용.

### 모바일 뷰포트

`h-[100dvh]` (동적 뷰포트 높이) 사용 — iOS Safari 주소창 레이아웃 시프트 방지.
`html, body`에 `overflow: hidden` 으로 페이지 스크롤 차단.

### 배포 규칙

- 코드 수정 후 반드시 `git push origin main` 으로 Vercel 자동 배포
- `npm run dev`는 로컬 테스트용이며, 이미 배포된 도메인이 있으면 **절대 로컬 서버를 올리지 않는다**
