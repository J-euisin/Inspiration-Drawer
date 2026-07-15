import type { Metadata } from 'next';
import './globals.css';
import ClientShell from '@/components/ClientShell';

export const metadata: Metadata = {
  title: '영감의 서랍 — 나만의 문장 아카이브',
  description:
    '떠오르는 단상과 감명 깊은 문장을 나만의 카드로 소장하는 영감 아카이빙 플랫폼. 오늘의 문장 큐레이션과 갤러리형 보관소를 제공합니다.',
  keywords: ['영감', '문장', '카드', '아카이브', '글귀', '일상', '기록'],
  openGraph: {
    title: '영감의 서랍',
    description: '떠오르는 단상과 감명 깊은 문장을 나만의 카드로 소장하세요.',
    locale: 'ko_KR',
    type: 'website',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
