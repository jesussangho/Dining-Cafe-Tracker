'use client';

import Script from 'next/script';

export default function KakaoScript() {
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  if (!key) return null;
  return (
    <Script
      src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`}
      strategy="afterInteractive"
      onLoad={() => {
        window.kakao.maps.load(() => {
          window.__kakaoMapOnLoad?.();
        });
      }}
    />
  );
}
