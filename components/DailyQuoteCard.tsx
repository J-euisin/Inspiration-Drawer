'use client';

import { useState, useEffect } from 'react';
import { DailyQuote } from '@/lib/types';
import { saveCard, generateId } from '@/lib/storage';

interface DailyQuoteCardProps {
  quote: DailyQuote;
  devHour?: number | null;
}

const GENRE_COLORS_LIGHT: Record<string, string> = {
  소설: '#6E6BA8', 시: '#7E79C0', 영화: '#7E8CE0',
  에세이: '#9B8EC4', 명언: '#8B7EC8', 칼럼: '#7A8BC0',
};
const GENRE_COLORS_DARK: Record<string, string> = {
  소설: '#B8B4E8', 시: '#C0BAF0', 영화: '#A8B4F0',
  에세이: '#C8BAE0', 명언: '#C0B4E8', 칼럼: '#B0BCE0',
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

export default function DailyQuoteCard({ quote, devHour }: DailyQuoteCardProps) {
  const [saved,     setSaved]     = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [countdown, setCountdown] = useState(calcCountdown);
  const [exactHour, setExactHour] = useState<number>(() => {
    const n = new Date();
    return n.getHours() + n.getMinutes() / 60;
  });

  // 1분마다 카운트다운 + 시간 갱신
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(calcCountdown());
      const n = new Date();
      setExactHour(n.getHours() + n.getMinutes() / 60);
    }, 60_000);
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

  // ─── 밝기 기반 2가지 모드 ─────────────────────────────────────────────────
  // 밝은 배경: 새벽 7시 ~ 저녁 17시 → light 모드
  // 어두운 배경: 17시 이후, 7시 이전 → dark 모드
  const hour    = devHour ?? exactHour;
  const isDark  = hour < 6 || hour >= 17;

  const genreColors = isDark ? GENRE_COLORS_DARK : GENRE_COLORS_LIGHT;
  const genreColor  = genreColors[quote.genre] || (isDark ? '#B8B4E8' : '#6E6BA8');

  // 배너 스타일 세트
  const bannerStyle = isDark ? {
    // 어두운 배경: 반투명 흰 레이어로 밝은 틴트, 밝은 텍스트
    background: 'rgba(255,255,255,0.13)',
    border:     '1px solid rgba(255,255,255,0.22)',
    boxShadow:  '0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.18)',
  } : {
    // 밝은 배경: 더 불투명한 흰 레이어, 진한 텍스트
    background: 'rgba(255,255,255,0.35)',
    border:     '1px solid rgba(255,255,255,0.55)',
    boxShadow:  '0 4px 24px rgba(44,49,74,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
  };

  const textColor         = isDark ? 'rgba(238,235,255,0.96)' : 'var(--color-text)';
  const mutedColor        = isDark ? 'rgba(195,190,240,0.82)' : 'var(--color-text-muted)';
  const accentColor       = isDark ? 'rgba(200,196,255,1)'    : 'var(--color-primary)';
  const labelBorderColor  = isDark ? 'rgba(180,176,240,0.35)' : 'rgba(110,107,168,0.28)';
  const labelBgColor      = isDark ? 'rgba(180,176,240,0.12)' : 'rgba(110,107,168,0.07)';
  const labelTextColor    = isDark ? 'rgba(195,190,248,0.92)' : 'rgba(110,107,168,0.9)';
  const dividerColor      = isDark ? 'rgba(200,195,255,0.12)' : 'rgba(110,107,168,0.1)';

  const pad          = (n: number) => String(n).padStart(2, '0');
  const attribution  = [quote.author, quote.source].filter(Boolean).join(', ');

  return (
    <div
      className="animate-fade-in"
      style={{
        ...bannerStyle,
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderRadius: '1.5rem',
        /* ── 컴팩트: 패딩·갭 축소 ── */
        padding: '0.9rem 1.25rem 0.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        transition: 'background 0.8s ease, border-color 0.8s ease, box-shadow 0.8s ease',
      }}
    >
      {/* ── 1행: 라벨 + 장르 태그 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700,
          letterSpacing: '0.07em', textTransform: 'uppercase',
          color: labelTextColor,
          border: `1px solid ${labelBorderColor}`,
          borderRadius: '9999px',
          padding: '0.15rem 0.6rem',
          background: labelBgColor,
          whiteSpace: 'nowrap',
        }}>
          오늘의 문장
        </span>
        <span style={{
          fontSize: '0.68rem', fontWeight: 600,
          color: genreColor,
          background: `${isDark ? 'rgba(255,255,255,0.07)' : `${genreColor}14`}`,
          border: `1px solid ${genreColor}${isDark ? '40' : '28'}`,
          borderRadius: '9999px',
          padding: '0.15rem 0.58rem',
          whiteSpace: 'nowrap',
        }}>
          {quote.genre}
        </span>
      </div>

      {/* ── 2행: 문장 본문 ── */}
      <div>
        <p style={{
          fontFamily: "'Gowun Batang', serif",
          /* 컴팩트: 폰트 크기 축소 */
          fontSize: 'clamp(0.88rem, 2vw, 1.02rem)',
          lineHeight: 1.78,
          color: textColor,
          letterSpacing: '-0.01em',
          wordBreak: 'keep-all',
          transition: 'color 0.8s ease',
        }}>
          "{quote.text}"
        </p>

        {/* ── 3행: 출처·저자 ── */}
        {attribution && (
          <p style={{
            marginTop: '0.25rem',
            fontSize: '0.78rem',
            color: mutedColor,
            fontFamily: "'Gowun Batang', serif",
            transition: 'color 0.8s ease',
          }}>
            — {attribution}
          </p>
        )}
      </div>

      {/* ── 4행: 카운트다운(좌) + 소장하기(우) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        paddingTop: '0.5rem',
        borderTop: `1px solid ${dividerColor}`,
        marginTop: '0.05rem',
        transition: 'border-color 0.8s ease',
      }}>
        <p style={{
          fontSize: '0.72rem',
          color: mutedColor,
          lineHeight: 1.4,
          transition: 'color 0.8s ease',
        }}>
          이 문장을 담을 수 있는 시간{' '}
          <span style={{ fontWeight: 700, color: accentColor, transition: 'color 0.8s ease' }}>
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
              <span style={{
                width: '11px', height: '11px',
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff', borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }} />
              저장 중
            </span>
          ) : saved ? '✓ 소장 완료' : '＋ 소장하기'}
        </button>
      </div>
    </div>
  );
}
