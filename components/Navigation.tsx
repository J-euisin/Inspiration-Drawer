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
    <>
      {/* Top bar only — 데스크탑에서는 로고+메뉴, 모바일에서는 로고만 */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'transparent',
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '0 2rem',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
          className="max-md:px-4"
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

          {/* 메뉴 — 오른쪽 끝 (데스크탑에서만 표시) */}
          <nav className="max-md:hidden flex gap-1">
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

      {/* 모바일 하단 고정 탭 (모바일에서만 표시) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
        style={{
          height: '70px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--color-border)',
          paddingBottom: 'env(safe-area-inset-bottom)', // 아이폰 하단 홈바 대응
        }}
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                width: '33%',
                height: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'color 0.2s',
              }}
            >
              <span style={{ fontSize: '1.2rem', opacity: active ? 1 : 0.6 }}>
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: active ? 700 : 500,
                  fontFamily: "'Nanum Gothic', sans-serif",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
