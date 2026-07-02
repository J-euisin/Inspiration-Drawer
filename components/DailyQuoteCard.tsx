'use client';

import { useState, useEffect } from 'react';
import { DailyQuote } from '@/lib/types';
import { saveCard, generateId } from '@/lib/storage';

interface DailyQuoteCardProps {
  quote: DailyQuote;
}

const GENRE_COLORS: Record<string, string> = {
  소설: '#6E6BA8', 시: '#7E79C0', 영화: '#7E8CE0',
  에세이: '#9B8EC4', 명언: '#8B7EC8', 칼럼: '#7A8BC0',
};

function calcCountdown(): { h: number; m: number } {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const ms = midnight.getTime() - Date.now();
  return {
    h: Math.floor(ms / (1000 * 60 * 60)),
    m: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
  };
}

export default function DailyQuoteCard({ quote }: DailyQuoteCardProps) {
  const [saved,     setSaved]     = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [countdown, setCountdown] = useState(calcCountdown);

  // 1분마다 카운트다운 갱신
  useEffect(() => {
    const id = setInterval(() => setCountdown(calcCountdown()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function handleSave() {
    if (saved || saving) return;
    setSaving(true);
    saveCard({
      id: generateId(),
      text: quote.text,
      fontStyle: 'myeongjo' as const,
      backgroundColor: '#EEE8F8',
      backgroundImage: null,
      source: quote.source,
      author: quote.author,
      createdAt: new Date().toISOString(),
    });
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
  }

  const genreColor  = GENRE_COLORS[quote.genre] || 'var(--color-primary)';
  const pad         = (n: number) => String(n).padStart(2, '0');
  const attribution = [quote.author, quote.source].filter(Boolean).join(', ');

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '1.5rem',
        boxShadow: '0 2px 16px rgba(110,107,168,0.10)',
        padding: '0.9rem 1.25rem 0.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {/* ── 1행: 라벨 + 장르 태그 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span
          style={{
            fontSize: '0.68rem', fontWeight: 700,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            color: 'var(--color-primary)',
            border: '1px solid rgba(110,107,168,0.28)',
            borderRadius: '9999px',
            padding: '0.15rem 0.6rem',
            background: 'rgba(110,107,168,0.07)',
            whiteSpace: 'nowrap',
          }}
        >
          오늘의 문장
        </span>
        <span
          style={{
            fontSize: '0.68rem', fontWeight: 600,
            color: genreColor,
            background: `${genreColor}14`,
            border: `1px solid ${genreColor}28`,
            borderRadius: '9999px',
            padding: '0.15rem 0.58rem',
            whiteSpace: 'nowrap',
          }}
        >
          {quote.genre}
        </span>
      </div>

      {/* ── 2행: 문장 본문 ── */}
      <div>
        <p
          style={{
            fontFamily: "'Gowun Batang', serif",
            fontSize: 'clamp(0.88rem, 2vw, 1.02rem)',
            lineHeight: 1.78,
            color: 'var(--color-text)',
            letterSpacing: '-0.01em',
            wordBreak: 'keep-all',
          }}
        >
          "{quote.text}"
        </p>

        {/* ── 3행: 출처·저자 ── */}
        {attribution && (
          <p
            style={{
              marginTop: '0.25rem',
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              fontFamily: "'Gowun Batang', serif",
            }}
          >
            — {attribution}
          </p>
        )}
      </div>

      {/* ── 4행: 카운트다운(좌) + 소장하기(우) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--color-border)',
          marginTop: '0.05rem',
        }}
      >
        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          이 문장을 담을 수 있는 시간{' '}
          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            {pad(countdown.h)}시간 {pad(countdown.m)}분
          </span>
          {' '}남음
        </p>

        <button
          className="btn-accent"
          onClick={handleSave}
          disabled={saved || saving}
          style={{
            flexShrink: 0,
            opacity: saved ? 0.78 : 1,
            background: saved ? '#9B8EC4' : undefined,
            fontSize: '0.82rem',
            padding: '0.42rem 1rem',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap',
          }}
        >
          {saving ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '11px', height: '11px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              저장 중
            </span>
          ) : saved ? '✓ 소장 완료' : '＋ 소장하기'}
        </button>
      </div>
    </div>
  );
}
