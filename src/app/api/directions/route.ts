import { NextRequest, NextResponse } from 'next/server';

export interface DirectionsResult {
  car: { duration: number; distance: number } | null;
  walk: { duration: number; distance: number } | null;
}

async function fetchRoute(
  origin: string,
  destination: string,
  mode: 'car' | 'walk'
): Promise<{ duration: number; distance: number } | null> {
  const base =
    mode === 'car'
      ? 'https://apis-navi.kakaomobility.com/v1/directions'
      : 'https://apis-navi.kakaomobility.com/v1/directions';

  const params = new URLSearchParams({
    origin,
    destination,
    priority: 'RECOMMEND',
    ...(mode === 'walk' ? { alternatives: 'false', road_details: 'false' } : {}),
  });

  const res = await fetch(`${base}?${params}`, {
    headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
    next: { revalidate: 300 }, // 5분 캐시
  });

  if (!res.ok) return null;

  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route || route.result_code !== 0) return null;

  return {
    duration: Math.ceil(route.summary.duration / 60), // 분
    distance: route.summary.distance,                  // 미터
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');      // "lng,lat"
  const destination = searchParams.get('destination'); // "lng,lat"

  if (!origin || !destination) {
    return NextResponse.json({ error: 'origin, destination 파라미터 필요' }, { status: 400 });
  }

  const [car] = await Promise.allSettled([
    fetchRoute(origin, destination, 'car'),
  ]);

  const result: DirectionsResult = {
    car: car.status === 'fulfilled' ? car.value : null,
    walk: null, // 도보는 거리 기반 추정이 더 정확 (Kakao Mobility는 자동차 전용)
  };

  return NextResponse.json(result);
}
