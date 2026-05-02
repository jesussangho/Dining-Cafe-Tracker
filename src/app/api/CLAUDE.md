# api/ 폴더 가이드 — Next.js API 라우트

## 라우트 목록

| 경로 | 메서드 | 역할 |
|------|--------|------|
| /api/directions | POST | 자차(Kakao Mobility) + 대중교통(ODsay) 경로 |
| /api/bus | GET | 주변 버스 정류장 + 실시간 도착 정보(ODsay) |

## 캐싱 전략

- 자차 경로: `revalidate: 1800` (30분)
- 대중교통 경로: `revalidate: 3600` (1시간)
- 버스 도착: 캐시 없음 (실시간 폴링)

## 좌표 반올림 규칙 (directions)

GPS 진동(±11m 이내)을 같은 캐시 키로 처리하기 위해  
위경도를 소수 3자리로 반올림한다. 수정 시 반드시 유지할 것.

## 환경변수

- `NEXT_PUBLIC_KAKAO_MAP_KEY`: Kakao Maps JS 앱 키 (클라이언트 + 서버)
- `ODSAY_API_KEY`: ODsay 대중교통 API 키 (서버 전용)
- `KAKAO_MOBILITY_KEY`: Kakao Mobility REST API 키 (서버 전용)

서버 전용 키는 `NEXT_PUBLIC_` 접두사 없이 선언해야 브라우저에 노출되지 않는다.

## ODSay 오류 응답 처리 규칙

ODSay API는 에러를 세 가지 형태로 반환하므로 `extractOdsayError()` 헬퍼로 통합 처리한다.

| 형태 | 예시 |
|------|------|
| 최상위 문자열 | `{ "error": "Invalid API Key" }` |
| 최상위 객체 | `{ "error": { "code": -5, "msg": "잘못된 api key" } }` |
| result 배열 | `{ "result": { "error": [{ "code": "-8", "msg": "서비스 가능한 지역이 아닙니다" }] } }` |

- ODSay 오류 필드명은 `message`가 아니라 **`msg`** 임에 주의.
- `stationArrivalSearch` 오류 시 도착 목록을 빈 배열로 폴백 (정류장명은 계속 표시).
- 오류 발생 시 `console.error`로 전체 응답을 서버 로그에 기록.

## BusArrivalPanel 위치 기준

`BusArrivalPanel`에는 GPS 위치(`userLocation`)가 아닌 `effectiveOrigin`(커스텀 출발지 우선)을 전달한다.
커스텀 출발지가 설정된 경우 그 위치 기준의 정류장 정보를 표시한다.
