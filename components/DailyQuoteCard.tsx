'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DailyQuote } from '@/lib/types';
import { saveCard, generateId } from '@/lib/storage';

interface DailyQuoteCardProps {
  quote: DailyQuote;
}

const GENRE_COLORS: Record<string, string> = {
  소설: '#6E6BA8',
  시: '#A7A3D8',
  영화: '#7E8CE0',
  에세이: '#9B8EC4',
  명언: '#8B7EC8',
  칼럼: '#7A8BC0',
};

const DEFAULT_BG = '#EEE8F8';

export default function DailyQuoteCard({ quote }: DailyQuoteCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (saved || saving) return;
    setSaving(true);

    const card = {
      id: generateId(),
      text: quote.text,
      fontStyle: 'myeongjo' as const,
      backgroundColor: DEFAULT_BG,
      backgroundImage: null,
      source: quote.source,
      author: quote.author,
      createdAt: new Date().toISOString(),
    };

    saveCard(card);

    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
  }

  const genreColor = GENRE_COLORS[quote.genre] || 'var(--color-primary)';
  const today = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        boxShadow: '0 4px 32px rgba(110,107,168,0.13)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Card header band */}
      <div
        style={{
          background: `linear-gradient(135deg, ${genreColor}22 0%, ${genreColor}10 100%)`,
          borderBottom: `1px solid ${genreColor}22`,
          padding: '1.1rem 1.5rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: genreColor,
              animation: 'pulse-soft 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: genreColor,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            오늘의 문장
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            className="genre-chip"
            style={{ background: `${genreColor}18`, color: genreColor }}
          >
            {quote.genre}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            {today}
          </span>
        </div>
      </div>

      {/* Quote body */}
      <div style={{ padding: '2rem 1.75rem 1.5rem' }}>
        {/* Big decorative quote */}
        <div
          style={{
            fontFamily: "'Gowun Batang', serif",
            fontSize: '4rem',
            lineHeight: 0.8,
            color: `${genreColor}20`,
            marginBottom: '0.75rem',
            userSelect: 'none',
          }}
        >
          "
        </div>

        <p
          style={{
            fontFamily: "'Gowun Batang', serif",
            fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
            lineHeight: 1.85,
            color: 'var(--color-text)',
            letterSpacing: '-0.01em',
            wordBreak: 'keep-all',
          }}
        >
          {quote.text}
        </p>

        {/* Attribution */}
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '24px',
              height: '1.5px',
              background: genreColor,
              opacity: 0.5,
              borderRadius: '9999px',
            }}
          />
          <span
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-text-muted)',
              fontFamily: "'Gowun Batang', serif",
            }}
          >
            {quote.author && `${quote.author} · `}
            {quote.source}
          </span>
        </div>
      </div>

      {/* Footer actions */}
      <div
        style={{
          padding: '1rem 1.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button
          className="btn-ghost"
          style={{ fontSize: '0.82rem' }}
          onClick={() => router.push('/create')}
        >
          ✎ 나만의 카드 만들기
        </button>

        <button
          className="btn-accent"
          onClick={handleSave}
          disabled={saved || saving}
          style={{
            opacity: saved ? 0.75 : 1,
            background: saved ? '#9B8EC4' : undefined,
            fontSize: '0.88rem',
            transition: 'all 0.3s',
          }}
        >
          {saving ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              저장 중…
            </span>
          ) : saved ? (
            '✓ 소장 완료'
          ) : (
            '＋ 소장하기'
          )}
        </button>
      </div>
    </div>
  );
}
