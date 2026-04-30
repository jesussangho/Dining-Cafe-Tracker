import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import KakaoScript from '@/components/KakaoScript';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: '맛집 지도 — 도보 거리 내 음식점 탐색',
  description: '현재 위치 주변의 맛집과 카페를 도보 5/10/15분 권역으로 탐색하세요.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className="font-sans antialiased">
        <KakaoScript />
        {children}
      </body>
    </html>
  );
}
