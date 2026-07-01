'use client';

import { useState } from 'react';
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
      {/* ── 헤더: 장르칩 + 날짜 + 소장하기 버튼 ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${genreColor}22 0%, ${genreColor}10 100%)`,
          borderBottom: `1px solid ${genreColor}22`,
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        {/* 왼쪽: 장르칩 + 날짜 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <span
            className="genre-chip"
            style={{ background: `${genreColor}18`, color: genreColor }}
          >
            {quote.genre}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {today}
          </span>
        </div>

        {/* 오른쪽: 소장하기 버튼 */}
        <button
          className="btn-accent"
          onClick={handleSave}
          disabled={saved || saving}
          style={{
            opacity: saved ? 0.75 : 1,
            background: saved ? '#9B8EC4' : undefined,
            fontSize: '0.78rem',
            padding: '0.35rem 0.9rem',
            transition: 'all 0.3s',
            flexShrink: 0,
          }}
        >
          {saving ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              저장 중
            </span>
          ) : saved ? (
            '✓ 소장 완료'
          ) : (
            '＋ 소장하기'
          )}
        </button>
      </div>

      {/* ── 본문: 인용구 + 출처 ── */}
      <div style={{ padding: '1.25rem 1.5rem 1.25rem' }}>
        {/* 장식용 따옴표 */}
        <div
          style={{
            fontFamily: "'Gowun Batang', serif",
            fontSize: '3rem',
            lineHeight: 0.8,
            color: `${genreColor}20`,
            marginBottom: '0.5rem',
            userSelect: 'none',
          }}
        >
          "
        </div>

        <p
          style={{
            fontFamily: "'Gowun Batang', serif",
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            lineHeight: 1.8,
            color: 'var(--color-text)',
            letterSpacing: '-0.01em',
            wordBreak: 'keep-all',
          }}
        >
          {quote.text}
        </p>

        {/* 출처 */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '20px',
              height: '1.5px',
              background: genreColor,
              opacity: 0.5,
              borderRadius: '9999px',
            }}
          />
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              fontFamily: "'Gowun Batang', serif",
            }}
          >
            {quote.author && `${quote.author} · `}
            {quote.source}
          </span>
        </div>
      </div>
    </div>
  );
}
