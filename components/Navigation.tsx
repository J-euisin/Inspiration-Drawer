'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useNavigationGuard } from '@/lib/navigation-guard-context';

const navItems = [
  { href: '/',        label: '오늘의 영감', icon: '✦' },
  { href: '/create',  label: '카드 만들기', icon: '✎' },
  { href: '/archive', label: '나의 서랍',   icon: '⊞' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router   = useRouter();
  const { requestNavigation } = useNavigationGuard();

  function handleNav(href: string) {
    if (pathname === href) return;
    requestNavigation(() => router.push(href));
  }

  return (
    /* Top bar only — 하단 탭 없음 */
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        /* 본문 배경과 자연스럽게 이어지도록 투명 처리 */
        background: 'transparent',
      }}
    >
      <div
        style={{
          /* 풀 와이드: 로고 왼쪽 끝, 메뉴 오른쪽 끝 */
          width: '100%',
          padding: '0 2rem',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* 로고 — 왼쪽 끝 */}
        <button
          onClick={() => handleNav('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '1.35rem',
              lineHeight: 1,
              filter: 'drop-shadow(0 1px 3px rgba(110,107,168,0.3))',
            }}
          >
            🗂️
          </span>
          <span
            style={{
              fontFamily: "'Gowun Batang', serif",
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            영감의 서랍
          </span>
        </button>

        {/* 메뉴 — 오른쪽 끝 */}
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : 'var(--color-text-muted)',
                  background: active ? 'var(--color-primary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: '0.8rem' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
