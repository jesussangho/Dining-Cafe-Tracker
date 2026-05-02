import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

// GPS 미세 진동으로 인한 캐시 미스 방지: 소수점 4자리 (~11m 정밀도)
const r4 = (n: number) => String(Math.round(n * 10_000) / 10_000);

// ── 자차: Kakao Mobility (30분 캐시) ───────────────────────────────
const getCachedCarRoute = unstable_cache(
  async (oLng: string, oLat: string, dLng: string, dLat: string) => {
    const res = await fetch(
      `https://apis-navi.kakaomobility.com/v1/directions` +
        `?origin=${oLng},${oLat}&destination=${dLng},${dLat}&priority=RECOMMEND`,
      { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route || route.result_code !== 0) return null;

    // 경로 폴리라인 좌표 수집 (vertexes: [lng, lat, lng, lat, ...] 평면 배열)
    const polyline: number[][] = [];
    for (const section of route.sections ?? []) {
      for (const road of section.roads ?? []) {
        const v: number[] = road.vertexes ?? [];
        for (let i = 0; i < v.length - 1; i += 2) {
          polyline.push([v[i], v[i + 1]]); // [lng, lat]
        }
      }
    }

    return {
      duration: Math.ceil(route.summary.duration / 60), // 초 → 분
      distance: route.summary.distance as number,
      polyline,
    };
  },
  ['kakao-car'],
  { revalidate: 1800 } // 30분
);

// ── 대중교통: ODsay (1시간 캐시) ──────────────────────────────────
const getCachedTransitRoute = unstable_cache(
  async (sx: string, sy: string, ex: string, ey: string) => {
    const key = process.env.ODSAY_API_KEY;
    if (!key) return null;

    const url =
      `https://api.odsay.com/v1/api/searchPubTransPathT` +
      `?SX=${sx}&SY=${sy}&EX=${ex}&EY=${ey}&apiKey=${key}`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const paths = data?.result?.path as Array<{
      info: { totalTime: number; trafficDistance: number };
    }> | undefined;
    if (!paths?.length) return null;

    // 소요 시간이 가장 짧은 경로 선택
    const fastest = paths.reduce((min, p) =>
      p.info.totalTime < min.info.totalTime ? p : min
    );
    return {
      duration: fastest.info.totalTime,           // 분 (ODsay는 이미 분 단위)
      distance: fastest.info.trafficDistance,      // 미터
    };
  },
  ['odsay-transit'],
  { revalidate: 3600 } // 1시간
);

// ── Route Handler ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const originParam = searchParams.get('origin');      // "lng,lat"
  const destParam = searchParams.get('destination');   // "lng,lat"

  if (!originParam || !destParam) {
    return NextResponse.json({ error: 'origin, destination 파라미터 필요' }, { status: 400 });
  }

  const [oLng, oLat] = originParam.split(',').map(Number);
  const [dLng, dLat] = destParam.split(',').map(Number);

  if ([oLng, oLat, dLng, dLat].some(isNaN)) {
    return NextResponse.json({ error: '유효하지 않은 좌표' }, { status: 400 });
  }

  // 좌표 반올림 후 캐시 키로 사용
  const [roLng, roLat, rdLng, rdLat] = [oLng, oLat, dLng, dLat].map(r4);

  const [car, transit] = await Promise.allSettled([
    getCachedCarRoute(roLng, roLat, rdLng, rdLat),
    getCachedTransitRoute(roLng, roLat, rdLng, rdLat),
  ]);

  return NextResponse.json({
    car:     car.status     === 'fulfilled' ? car.value     : null,
    transit: transit.status === 'fulfilled' ? transit.value : null,
  });
}
