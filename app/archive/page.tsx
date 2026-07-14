'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/lib/types';
import { getCards, groupCardsByDate } from '@/lib/storage';
import CardItem from '@/components/CardItem';
import ArchiveViewOptionsModal, { SortOrder, ViewType } from '@/components/ArchiveViewOptionsModal';

type TabFilter = 'all' | 'quote' | 'thought';

const TAB_CONFIG: { value: TabFilter; label: string }[] = [
  { value: 'all',     label: '전체' },
  { value: 'quote',   label: '문장' },
  { value: 'thought', label: '단상' },
];

export default function ArchivePage() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [isViewOptionsOpen, setIsViewOptionsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewType, setViewType] = useState<ViewType>('2');

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  // 캐러셀 슬롯 실제 너비 (scale 계산용)
  const [carouselSlotWidth, setCarouselSlotWidth] = useState(0);

  useEffect(() => {
    const cards = getCards();
    setAllCards(cards);
    
    try {
      const saved = localStorage.getItem('archiveViewOptions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sortOrder) setSortOrder(parsed.sortOrder);
        if (parsed.viewType) setViewType(parsed.viewType);
      }
    } catch (e) {
      // ignore
    }
    
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    // 캐러셀 슬롯 너비 측정 (68vw 기준)
    const measureSlot = () => {
      const slotWidth = window.innerWidth * 0.68;
      setCarouselSlotWidth(slotWidth);
    };
    measureSlot();
    window.addEventListener('resize', measureSlot);
    
    setLoaded(true);
    return () => {
      window.removeEventListener('resize', checkDesktop);
      window.removeEventListener('resize', measureSlot);
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('archiveViewOptions', JSON.stringify({ sortOrder, viewType }));
    }
  }, [sortOrder, viewType, loaded]);

  useEffect(() => {
    setActiveCarouselIndex(0);
  }, [activeTab, sortOrder, viewType]);

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    
    let closestIndex = 0;
    let minDiff = Infinity;

    Array.from(container.children).forEach((child, index) => {
      const childRect = child.getBoundingClientRect();
      const childCenter = childRect.left + childRect.width / 2;
      const diff = Math.abs(containerCenter - childCenter);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    setActiveCarouselIndex(closestIndex);
  };

  function handleDeleted(id: string) {
    setAllCards((prev) => prev.filter((c) => c.id !== id));
  }

  // 탭에 따라 필터링
  const filtered: Card[] = activeTab === 'all'
    ? allCards
    : allCards.filter((c) => (c.type ?? 'quote') === activeTab);

  const sorted = sortOrder === 'asc' ? [...filtered].reverse() : filtered;
  const groups = groupCardsByDate(sorted);
  const totalCount = allCards.length;
  const filteredCount = filtered.length;

  return (
    <div className="page-wrapper">
      <div className="mobile-reduce-top" style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.25rem 7rem' }}>
        {/* Header — PC에서만 표시, 모바일은 GNB에 타이틀이 있으므로 숨김 */}
        <div className="animate-fade-in max-md:hidden" style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                  fontWeight: 400,
                  color: 'var(--color-text)',
                  marginBottom: '0.3rem',
                }}
              >
                나의 서랍
              </h1>
              {loaded && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                  {totalCount > 0
                    ? `총 ${totalCount}장의 카드가 소장되어 있습니다`
                    : '아직 소장한 카드가 없습니다'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Menu & Tab filter ── */}
        {loaded && totalCount > 0 && (
          <div
            className="animate-fade-in mb-7 mobile-mb-20"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.75rem',
            }}
          >
            {/* Hamburger Menu (Mobile Only) */}
            <div className="md:hidden">
              <button
                onClick={() => setIsViewOptionsOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42px',
                  height: '42px',
                  background: 'var(--color-surface)',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text)',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.02)',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* 필터 탭 컨테이너 */}
            <div
              style={{
                display: 'flex',
                gap: '0.4rem',
                background: 'var(--color-surface)',
                borderRadius: '9999px',
                padding: '0.3rem',
                width: 'fit-content',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.02)',
              }}
            >

            {TAB_CONFIG.map((tab) => {
              const count = tab.value === 'all'
                ? allCards.length
                : allCards.filter((c) => (c.type ?? 'quote') === tab.value).length;
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  id={`archive-tab-${tab.value}`}
                  onClick={() => setActiveTab(tab.value)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 400,
                    background: active ? 'var(--color-primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--color-text-muted)',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '9999px',
                      background: active ? 'rgba(255,255,255,0.25)' : 'rgba(103, 94, 207,0.1)',
                      color: active ? '#fff' : 'var(--color-primary)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0 4px',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            </div>
          </div>
        )}

        {/* Empty state — 전체 없을 때 */}
        {loaded && totalCount === 0 && (
          <div
            className="animate-scale-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '2.25rem 1.5rem',
              background: 'var(--color-surface)',
              borderRadius: '1.5rem',
            }}
          >
            <img
              src="/empty-drawer.png?v=2"
              alt="비어있는 서랍"
              style={{
                width: 'clamp(130px, 25vw, 240px)',
                height: 'clamp(130px, 25vw, 240px)',
                objectFit: 'contain',
                marginBottom: '0.875rem',
              }}
            />
            <h2
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontWeight: 400,
                fontSize: '1.15rem',
                color: 'var(--color-text)',
                marginBottom: '0.8rem',
                letterSpacing: '-0.02em',
              }}
            >
              서랍이 비어 있어요
            </h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.875rem',
                marginBottom: '1.75rem',
                lineHeight: 1.7,
              }}
            >
              오늘의 문장을 소장하거나,
              <br />
              나만의 카드를 직접 만들어보세요.
            </p>
            <Link href="/create">
              <button className="btn-primary">카드 만들기</button>
            </Link>
          </div>
        )}

        {/* Empty state — 탭 필터 결과 없을 때 */}
        {loaded && totalCount > 0 && filteredCount === 0 && (
          <div
            className="animate-fade-in"
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'var(--color-surface)',
              borderRadius: '1.25rem',
            }}
          >
            <p style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
              -
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              {activeTab === 'quote'
                ? '수집한 문장 카드가 없습니다.'
                : '기록한 단상 카드가 없습니다.'}
            </p>
          </div>
        )}

        {/* Mobile View Type 1: Carousel (Only visible on mobile when viewType === '1') */}
        {loaded && sorted.length > 0 && viewType === '1' && (
          <div className="md:hidden">
            <div className="animate-fade-in" style={{
              paddingBottom: '1rem',
              paddingTop: '2vh',
              height: 'calc(100vh - 200px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
            <div
              key={`${sortOrder}-${activeTab}`}
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="carousel-container"
              style={{
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                margin: '0 -1.25rem', // Bleed full width
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                alignItems: 'center', // Fix vertical stretching
                direction: 'rtl', // Reverse visual order
              }}
            >
              {sorted.map((card, index) => {
                const isActive = index === activeCarouselIndex;
                // 팝업과 동일한 size="full" 카드를 고정 너비로 렌더링 후 scale 축소
                // → 내부 폰트/여백 비율이 팝업과 100% 동일 → 텍스트 잘림 원천 차단
                const RENDER_WIDTH = 320; // 팝업 기준 너비
                const scaleRatio = carouselSlotWidth > 0 ? carouselSlotWidth / RENDER_WIDTH : 1;
                return (
                  <div
                    key={card.id}
                    style={{
                      flex: '0 0 68%',
                      width: '68%',
                      marginLeft: index === sorted.length - 1 ? '16vw' : '1.75vw',
                      marginRight: index === 0 ? '16vw' : '1.75vw',
                      scrollSnapAlign: 'center',
                      scrollSnapStop: 'always',
                      transform: isActive ? 'scale(1)' : 'scale(0.88)',
                      opacity: isActive ? 1 : 0.55,
                      transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease',
                      direction: 'ltr',
                      // 슬롯 높이: 렌더 높이(320px × 1.414) × scale
                      height: `${RENDER_WIDTH * 1.414 * scaleRatio}px`,
                      overflow: 'hidden',
                      borderRadius: '1.25rem',
                      position: 'relative',
                    }}
                  >
                    {/* 팝업과 동일한 size="full" 카드를 scale로 축소 */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${RENDER_WIDTH}px`,
                        transformOrigin: 'top left',
                        transform: `scale(${scaleRatio})`,
                      }}
                    >
                      <CardItem card={card} onDeleted={handleDeleted} viewType={viewType} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination indicator */}
            {sorted.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '1.25rem',
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F0F0F0',
                  padding: '0.4rem 0.95rem',
                  borderRadius: '9999px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.85rem',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '1.25rem',
                    textAlign: 'right',
                    color: '#675ECF', 
                    fontWeight: 700,
                  }}>
                    {activeCarouselIndex + 1}
                  </span>
                  <span style={{ 
                    display: 'inline-block',
                    width: '0.5rem',
                    textAlign: 'center',
                    color: '#9CA3AF',
                    fontWeight: 500,
                    margin: '0 0.15rem',
                  }}>
                    /
                  </span>
                  <span style={{ 
                    display: 'inline-block',
                    width: '1.25rem',
                    textAlign: 'left',
                    color: '#9CA3AF',
                    fontWeight: 500,
                  }}>
                    {sorted.length}
                  </span>
                </div>
              </div>
            )}
          </div>
          </div>
        )}

        {/* Date-grouped gallery (Visible on PC always, and on mobile if viewType !== '1') */}
        {loaded && groups.length > 0 && (
          <div className={viewType === '1' ? 'max-md:hidden' : ''}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {groups.map((group, gi) => (
              <section
                key={group.date}
                className="animate-fade-in"
                style={{ animationDelay: `${gi * 0.07}s` }}
              >
                {/* Date header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.85rem',
                      background: 'rgba(103, 94, 207,0.09)',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {group.date}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {group.cards.length}장
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '1px',
                      background: 'var(--color-border)',
                    }}
                  />
                </div>

                {/* Card grid */}
                <div
                  className="stagger-children archive-grid"
                  data-view-type={isDesktop ? undefined : viewType}
                  style={{
                    display: 'grid',
                    gap: '0.85rem',
                  }}
                >
                  {group.cards.map((card) => (
                    <div key={card.id} className="animate-fade-in" style={{ minWidth: 0 }}>
                      <CardItem card={card} onDeleted={handleDeleted} viewType={isDesktop ? undefined : viewType} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {!loaded && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1 / 1.414',
                  borderRadius: '0.875rem',
                  background: 'linear-gradient(90deg, #ece9f8 25%, #f5f3fc 50%, #ece9f8 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* View Options Modal */}
      <ArchiveViewOptionsModal
        isOpen={isViewOptionsOpen}
        onClose={() => setIsViewOptionsOpen(false)}
        sortOrder={sortOrder}
        viewType={viewType}
        onSortOrderChange={setSortOrder}
        onViewTypeChange={setViewType}
      />

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
