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

function extractOdsayError(data: Record<string, unknown>): string | null {
  // 최상위 error 필드 ({"error": {"code": -5, "msg": "..."}})
  if (data?.error) {
    const e = data.error as Record<string, unknown>;
    if (typeof e === 'string') return e;
    return String(e.msg ?? e.message ?? JSON.stringify(e));
  }
  // result.error 배열 형태 ({"result": {"error": [{"code": "-8", "msg": "..."}]}})
  const resultError = (data?.result as Record<string, unknown> | undefined)?.error;
  if (resultError) {
    const e = Array.isArray(resultError) ? resultError[0] : resultError;
    return String((e as Record<string, unknown>).msg ?? (e as Record<string, unknown>).message ?? JSON.stringify(e));
  }
  return null;
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

  const stationData = await stationRes.json() as Record<string, unknown>;

  const stationError = extractOdsayError(stationData);
  if (stationError) {
    console.error('[api/bus] searchStation 오류:', stationData);
    return NextResponse.json({ error: `ODSay 오류: ${stationError}` }, { status: 502 });
  }

  const rawStation = (stationData?.result as Record<string, unknown> | undefined)
    ?.station as Record<string, unknown>[] | undefined;
  if (!rawStation?.[0]) {
    return NextResponse.json({ error: '근처에 버스 정류장이 없습니다' }, { status: 404 });
  }

  const s = rawStation[0];
  const station: BusStation = {
    id: Number(s.stationID),
    name: String(s.stationName ?? ''),
    lat: Number(s.y),
    lng: Number(s.x),
    arsID: String(s.arsID ?? ''),
  };

  // 2단계: stationArrivalSearch로 실시간 도착 정보 조회
  const arrivalUrl =
    `https://api.odsay.com/v1/api/stationArrivalSearch` +
    `?stationID=${station.id}&stationClass=1&apiKey=${encodeURIComponent(apiKey)}`;

  let arrivalRes: Response;
  try {
    arrivalRes = await fetch(arrivalUrl, { cache: 'no-store' });
  } catch {
    return NextResponse.json({ error: '도착 정보 요청에 실패했습니다' }, { status: 502 });
  }

  if (!arrivalRes.ok) {
    return NextResponse.json({ error: `도착 정보 조회 실패 (${arrivalRes.status})` }, { status: 502 });
  }

  const arrivalData = await arrivalRes.json() as Record<string, unknown>;

  const arrivalError = extractOdsayError(arrivalData);
  if (arrivalError) {
    console.error('[api/bus] stationArrivalSearch 오류:', arrivalData);
    // 도착 정보 오류는 빈 목록으로 폴백 (정류장 정보는 표시)
    return NextResponse.json({ station, arrivals: [] } satisfies BusApiResponse);
  }

  const arrivals: BusArrival[] = ((arrivalData?.result as Record<string, unknown> | undefined)
    ?.real as Record<string, unknown>[] | undefined ?? []).map((r) => ({
    routeName: String(r.routeName ?? ''),
    routeTypeName: String(r.routeTypeName ?? ''),
    arrivalSec: Number(r.arrivalSec ?? 0),
    arrivalSec2: Number(r.arrivalSec2 ?? 0),
    prevStationCnt1: Number(r.prevStationCnt1 ?? 0),
    prevStationCnt2: Number(r.prevStationCnt2 ?? 0),
  }));

  return NextResponse.json({ station, arrivals } satisfies BusApiResponse);
}
