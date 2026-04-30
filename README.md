# 📍 Dining & Cafe Tracker (맛집·카페 탐색기)

사용자의 현재 위치 또는 **검색한 장소**를 중심으로 도보 거리 내 맛집과 카페를 시각화하고, 최적의 이동 경로를 제안하는 모바일 최적화 웹 서비스입니다.

---

## 📱 서비스 핵심 가치 (Core Features)

### 1. 강력한 통합 검색 (Integrated Search) 🔍
- **장소 및 주소 검색**: 키워드 검색을 통해 특정 지역이나 건물로 즉시 이동.
- **검색 결과 자동 포커싱**: 검색된 장소를 중심으로 지도가 이동하며, 주변 도보권(5/10/15분) 자동 계산 및 시각화.

### 2. 반응형 & 모바일 우선 UI (Mobile-First Design)
- **모바일 최적화**: 한 손 조작이 편한 하단 스와이프 시트 인터페이스.
- **실시간 GPS**: 현재 위치 기반 주변 맛집/카페 즉시 마커 표시.

### 3. 스마트 경로 가이드 (Smart Route Optimizer)
- **최적 수단 비교**: 도보, 대중교통, 자차 중 가장 빠른 경로 실시간 비교.
- **자동 줌(Auto-Zoom)**: 목적지 도달 시 상세 단계(골목길 뷰)까지 지도 자동 확대.

### 4. 미식 큐레이션 (Gourmet Curation)
- **상세 정보**: 대표 메뉴, 특징, 평점 요약 및 실제 도보 경로 안내.

---

## 🛠 기술 스택 (Tech Stack)

- **Framework**: Next.js 14+ (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Map/Search API**: Kakao/Naver Maps SDK (장소 검색 라이브러리 포함)
- **Deployment**: Vercel (GitHub 연동 자동 배포)

---

## 📂 프로젝트 구조 (Project Structure)
```text
├── src/
│   ├── components/      
│   │   ├── Search/       # 장소 검색바 및 결과 리스트
│   │   ├── Map/          # 지도 및 검색 결과 마커 렌더링
│   │   └── Detail/       # 장소 상세 및 경로 정보 카드
│   ├── hooks/           # 검색 API 및 위치 추적 훅
│   └── services/        # 카카오/네이버 검색 API 인터페이스
└── README.md
```
