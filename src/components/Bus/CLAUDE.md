# components/Bus/ 폴더 가이드 — 버스 도착 패널

## BusArrivalPanel.tsx 역할

출발지(`effectiveOrigin`) 기준 주변 버스 정류장과 실시간 도착 정보를 표시한다.
커스텀 출발지가 없으면 GPS 위치를 사용한다.

## 데이터 흐름

```
AppShell.effectiveOrigin (커스텀 출발지 ?? GPS 위치)
  → BusArrivalPanel(location=effectiveOrigin)
  → fetch("/api/bus?lat=&lng=")
  → ODsay searchStation(정류장 탐색)
  → stationArrivalSearch(도착 정보)
  → 정류장명 + 도착 버스 목록(번호, 남은 정류장 수) 표시
```

## 갱신 주기

30초마다 자동 폴링 (`setInterval`). 패널 언마운트 시 `clearInterval`.  
사용자가 오래 열어두면 부하가 생기므로 갱신 주기를 더 짧게 하지 말 것.

## 표시 형식

- 도착 예정: `prevStationCnt` 값 → "X 정류장 전"
- 곧 도착(`prevStationCnt` ≤ 1): "곧 도착"
- `arrivalSec` 있으면 분 단위로 환산하여 병기.
