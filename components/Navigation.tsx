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
  const router = useRouter();
  const { requestNavigation } = useNavigationGuard();

  function handleNav(href: string) {
    if (pathname === href) return; // 현재 페이지 클릭 무시
    requestNavigation(() => router.push(href));
  }

  return (
    <>
      {/* Top bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(250,248,245,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: '768px',
            margin: '0 auto',
            padding: '0 1.25rem',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo — 클릭 시 guard 경유 */}
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
              textDecoration: 'none',
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

          {/* Desktop nav links */}
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

      {/* Mobile bottom nav */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(250,248,245,0.92)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
        }}
        className="md:hidden"
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
                gap: '0.2rem',
                padding: '0.35rem 1rem',
                borderRadius: '0.75rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'color 0.2s',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.68rem', fontWeight: active ? 600 : 400 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
