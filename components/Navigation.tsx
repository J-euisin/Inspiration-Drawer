'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigationGuard } from '@/lib/navigation-guard-context';

const navItems = [
  { href: '/',        label: '오늘의 영감', id: 'home' },
  { href: '/create',  label: '카드 만들기', id: 'create' },
  { href: '/archive', label: '나의 서랍',   id: 'archive' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router   = useRouter();
  const { requestNavigation } = useNavigationGuard();

  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    
    handleResize();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  function handleNav(href: string) {
    if (pathname === href) return;
    requestNavigation(() => router.push(href));
  }

  const isHome = pathname === '/';
  // Desktop && Home -> Never show background
  const showBackground = scrolled && !(isHome && !isMobile);

  return (
    <>
      {/* Top bar only — 데스크탑에서는 로고+메뉴, 모바일에서는 로고만 */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: showBackground ? 'rgba(250, 248, 245, 0.2)' : 'transparent',
          backdropFilter: showBackground ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: showBackground ? 'blur(12px)' : 'none',
          transition: 'background 0.2s, backdrop-filter 0.2s',
          marginBottom: '-1px', /* Sub-pixel rendering gap fix */
          transform: 'translateZ(0)', /* iOS backdrop-filter edge bleed fix */
        }}
      >
        <div
          style={{
            width: '100%',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
          className="gnb-inner"
        >
          {/* 로고 — 모바일에서 /create, /archive는 숨기고 데스크탑에서는 항상 표시 */}
          <button
            onClick={() => handleNav('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display:
                (pathname === '/create' || pathname === '/archive')
                  ? undefined  /* 모바일: 아래 인라인 스타일로 제어, 데스크탑: flex */
                  : 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            className={
              (pathname === '/create' || pathname === '/archive')
                ? 'max-md:!hidden flex'
                : 'flex'
            }
          >
            <img
              src="/logo.png"
              alt="영감의 서랍 로고"
              style={{ height: '25px', width: 'auto', objectFit: 'contain' }}
            />
          </button>

          {/* 모바일 전용 페이지 타이틀 — /create, /archive에서만 표시 */}
          {(pathname === '/create' || pathname === '/archive') && (
            <span
              className="md:!hidden"
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: '1.15rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                letterSpacing: '-0.01em',
              }}
            >
              {pathname === '/create' ? '카드 만들기' : '나의 서랍'}
            </span>
          )}

          {/* 메뉴 — 오른쪽 끝 (데스크탑에서만 표시) */}
          <nav className="max-md:hidden flex gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  className="gnb-desktop-link"
                  data-active={active}
                >
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
          borderTop: '1px solid rgba(0, 0, 0, 0.04)',
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
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.16rem', height: '2.16rem' }}>
                <img 
                  src={`/icons/${item.id}-${active ? 'active' : 'inactive'}.svg?v=4`} 
                  alt={item.label}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
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
