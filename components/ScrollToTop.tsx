'use client';

import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 20);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // init
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  // 모바일 하단 탭(70px + safe-area)과 안 겹치도록 90px 여백
  const bottom = isMobile ? 'calc(env(safe-area-inset-bottom) + 90px)' : '24px';
  const right = isMobile ? '20px' : '24px';

  // hover 반전은 PC에서만 적용
  const isHovered = hover && !isMobile;
  const bg = isHovered ? '#6E6BA8' : '#FFFFFF';
  const color = isHovered ? '#FFFFFF' : '#6E6BA8';

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed',
        bottom,
        right,
        zIndex: 40,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: bg,
        color: color,
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        fontSize: '1.2rem',
      }}
      aria-label="맨 위로 가기"
    >
      ↑
    </button>
  );
}
