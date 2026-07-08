'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/lib/types';
import { getCards, groupCardsByDate } from '@/lib/storage';
import CardItem from '@/components/CardItem';

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

  useEffect(() => {
    const cards = getCards();
    setAllCards(cards);
    setLoaded(true);
  }, []);

  function handleDeleted(id: string) {
    setAllCards((prev) => prev.filter((c) => c.id !== id));
  }

  // 탭에 따라 필터링
  const filtered: Card[] = activeTab === 'all'
    ? allCards
    : allCards.filter((c) => (c.type ?? 'quote') === activeTab);

  const groups = groupCardsByDate(filtered);
  const totalCount = allCards.length;
  const filteredCount = filtered.length;

  return (
    <div className="page-wrapper">
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.25rem 7rem' }}>
        {/* Header */}
        <div className="animate-fade-in" style={{ marginBottom: '1.5rem' }}>
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
                className="max-md:mt-[40px]"
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

        {/* ── Tab filter ── */}
        {loaded && totalCount > 0 && (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              gap: '0.4rem',
              marginBottom: '1.75rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '9999px',
              padding: '0.3rem',
              width: 'fit-content',
              boxShadow: 'var(--shadow-soft)',
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
        )}

        {/* Empty state — 전체 없을 때 */}
        {loaded && totalCount === 0 && (
          <div
            className="animate-scale-in"
            style={{
              textAlign: 'center',
              padding: '5rem 1.5rem',
              background: 'var(--color-surface)',
              borderRadius: '1.5rem',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* 빈 상태 아이콘 제거됨 */}
            <h2
              style={{
                fontFamily: "'Gowun Batang', serif",
                fontSize: '1.2rem',
                color: 'var(--color-text)',
                marginBottom: '0.5rem',
              }}
            >
              서랍이 비어 있어요
            </h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                lineHeight: 1.7,
              }}
            >
              오늘의 문장을 소장하거나,
              <br />
              나만의 카드를 직접 만들어보세요.
            </p>
            <Link href="/create">
              <button className="btn-primary">✎ 카드 만들기</button>
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
              border: '1px solid var(--color-border)',
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

        {/* Date-grouped gallery */}
        {loaded && groups.length > 0 && (
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
                  className="stagger-children"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '0.85rem',
                  }}
                >
                  {group.cards.map((card) => (
                    <div key={card.id} className="animate-fade-in">
                      <CardItem card={card} onDeleted={handleDeleted} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
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

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
