'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/lib/types';
import { getCards, groupCardsByDate } from '@/lib/storage';
import CardItem from '@/components/CardItem';

export default function ArchivePage() {
  const [groups, setGroups] = useState<{ date: string; cards: Card[] }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const cards = getCards();
    setGroups(groupCardsByDate(cards));
    setTotalCount(cards.length);
    setLoaded(true);
  }, []);

  function handleDeleted(id: string) {
    setGroups((prev) => {
      const updated = prev
        .map((g) => ({ ...g, cards: g.cards.filter((c) => c.id !== id) }))
        .filter((g) => g.cards.length > 0);
      setTotalCount((t) => t - 1);
      return updated;
    });
  }

  return (
    <div className="page-wrapper">
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.25rem 7rem' }}>
        {/* Header */}
        <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
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
                  fontFamily: "'Gowun Batang', serif",
                  fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.3rem',
                }}
              >
                ⊞ 나의 서랍
              </h1>
              {loaded && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                  {totalCount > 0
                    ? `총 ${totalCount}장의 카드가 소장되어 있습니다`
                    : '아직 소장한 카드가 없습니다'}
                </p>
              )}
            </div>
            <Link href="/create">
              <button className="btn-primary" style={{ fontSize: '0.85rem' }}>
                ✎ 새 카드 만들기
              </button>
            </Link>
          </div>
        </div>

        {/* Empty state */}
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
            <div
              className="animate-float"
              style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'inline-block' }}
            >
              🗂️
            </div>
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
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/">
                <button className="btn-ghost">✦ 오늘의 문장</button>
              </Link>
              <Link href="/create">
                <button className="btn-primary">✎ 카드 만들기</button>
              </Link>
            </div>
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
                      background: 'rgba(110,107,168,0.09)',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      letterSpacing: '0.03em',
                    }}
                  >
                    📅 {group.date}
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
