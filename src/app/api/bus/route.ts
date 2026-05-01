import { NextRequest, NextResponse } from 'next/server';

export interface BusStation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  arsID: string;
}

export interface BusArrival {
  routeName: string;
  routeTypeName: string;
  arrivalSec: number;
  arrivalSec2: number;
  prevStationCnt1: number;
  prevStationCnt2: number;
}

export interface BusApiResponse {
  station: BusStation;
  arrivals: BusArrival[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat, lng 파라미터가 필요합니다' }, { status: 400 });
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (isNaN(latNum) || isNaN(lngNum)) {
    return NextResponse.json({ error: '유효하지 않은 좌표값입니다' }, { status: 400 });
  }

  const apiKey = process.env.ODSAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ODSAY_API_KEY 환경 변수가 설정되지 않았습니다' },
      { status: 500 }
    );
  }

  // 1단계: searchStation으로 좌표 근처 버스 정류장 탐색
  const stationUrl =
    `https://api.odsay.com/v1/api/searchStation` +
    `?x=${lngNum}&y=${latNum}&stationClass=1&apiKey=${encodeURIComponent(apiKey)}`;

  let stationRes: Response;
  try {
    stationRes = await fetch(stationUrl, { next: { revalidate: 60 } });
  } catch {
    return NextResponse.json({ error: '정류장 검색 요청에 실패했습니다' }, { status: 502 });
  }

  if (!stationRes.ok) {
    return NextResponse.json({ error: `정류장 검색 실패 (${stationRes.status})` }, { status: 502 });
  }

  const stationData = await stationRes.json();

  // ODSay 오류 응답 처리
  if (stationData?.error) {
    return NextResponse.json(
      { error: `ODSay 오류: ${stationData.error.message ?? '알 수 없는 오류'}` },
      { status: 502 }
    );
  }

  const rawStation = stationData?.result?.station?.[0];
  if (!rawStation) {
    return NextResponse.json({ error: '근처에 버스 정류장이 없습니다' }, { status: 404 });
  }

  const station: BusStation = {
    id: rawStation.stationID,
    name: rawStation.stationName,
    lat: rawStation.y,
    lng: rawStation.x,
    arsID: rawStation.arsID ?? '',
  };

  // 2단계: stationArrivalSearch로 실시간 도착 정보 조회
  const arrivalUrl =
    `https://api.odsay.com/v1/api/stationArrivalSearch` +
    `?stationID=${station.id}&stationClass=1&apiKey=${encodeURIComponent(apiKey)}`;

  let arrivalRes: Response;
  try {
    arrivalRes = await fetch(arrivalUrl, { cache: 'no-store' }); // 실시간 데이터는 캐시 없음
  } catch {
    return NextResponse.json({ error: '도착 정보 요청에 실패했습니다' }, { status: 502 });
  }

  if (!arrivalRes.ok) {
    return NextResponse.json({ error: `도착 정보 조회 실패 (${arrivalRes.status})` }, { status: 502 });
  }

  const arrivalData = await arrivalRes.json();

  const arrivals: BusArrival[] = (arrivalData?.result?.real ?? []).map(
    (r: Record<string, unknown>) => ({
      routeName: String(r.routeName ?? ''),
      routeTypeName: String(r.routeTypeName ?? ''),
      arrivalSec: Number(r.arrivalSec ?? 0),
      arrivalSec2: Number(r.arrivalSec2 ?? 0),
      prevStationCnt1: Number(r.prevStationCnt1 ?? 0),
      prevStationCnt2: Number(r.prevStationCnt2 ?? 0),
    })
  );

  return NextResponse.json({ station, arrivals } satisfies BusApiResponse);
}
