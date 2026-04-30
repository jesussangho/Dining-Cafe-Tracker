📍 Dining & Cafe Tracker (맛집·카페 탐색기)
사용자의 현재 위치 또는 지정된 장소를 중심으로 도보 거리 내 맛집과 카페를 시각화하고, 멀티모달 경로 비교(도보, 대중교통, 자차)를 제공하는 모바일 최적화 웹 서비스입니다.

📱 서비스 핵심 가치 (Core Features)
1. 반응형 & 모바일 우선 UI (Mobile-First Design)
모바일 최적화: 스마트폰 환경에서 한 손으로 조작하기 편한 하단 스와이프 시트 인터페이스.

실시간 GPS: 내 주변의 맛집과 카페를 즉각적으로 지도에 마커로 표시.

2. 스마트 경로 가이드 (Smart Route Optimizer)
최적 수단 비교: 목적지까지 어떤 수단이 가장 빠른지 한눈에 비교.

🚶 도보: 골목길 기반 경로 및 예상 시간.

🚇 대중교통: 실시간 버스 및 지하철 도착 정보 연동.

🚗 자차: 실시간 교통 상황 반영.

자동 줌(Auto-Zoom): 목적지 근처에 도달하면 지도가 자동으로 상세 단계까지 확대되어 골목길 정보를 명확히 제공.

3. 미식 큐레이션 (Gourmet Curation)
장소 상세 정보: 대표 메뉴, 맛의 특징, 방문객 리뷰 요약.

도보 반경 시각화: 목적지 기준 도보 5분/10분/15분 도달 가능 범위 표시.

🛠 기술 스택 (Tech Stack - Claude Code Optimized)
Claude Code와의 효율적인 협업을 위해 다음 스택을 권장합니다.

Frontend: Next.js 14+ (App Router), TypeScript

Styling: Tailwind CSS

Map Engine: Kakao/Naver Maps SDK, Tmap API (자차 경로)

Data API: 공공데이터포털 (실시간 버스/지하철 데이터)

Deployment: Vercel (GitHub 연동 자동 배포)

📂 프로젝트 구조 (Project Structure)
Plaintext
├── src/
│   ├── app/             # 메인 페이지 및 레이아웃
│   ├── components/      # 지도, 경로 비교 패널, 상세 카드 UI
│   ├── hooks/           # 위치 추적 및 API 통신 훅
│   └── services/        # 수단별 경로 연동 서비스 로직
└── README.md
