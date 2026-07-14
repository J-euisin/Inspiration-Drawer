'use client';

import { FONT_CLASSNAMES, FontStyle } from '@/lib/types';
import { CSSProperties } from 'react';

interface CardPreviewProps {
  text: string;
  fontStyle: FontStyle;
  backgroundColor: string;
  backgroundImage: string | null;
  source?: string;
  author?: string;
  /** 'create' view (larger) vs 'archive' view (compact) */
  size?: 'full' | 'compact' | 'carousel';
  date?: string;
  lineClamp?: number;
}

const CARD_ASPECT = 1.414; // A4-ish portrait ratio (width:height = 1:1.414)

export default function CardPreview({
  text,
  fontStyle,
  backgroundColor,
  backgroundImage,
  source,
  author,
  size = 'full',
  date,
  lineClamp,
}: CardPreviewProps) {
  const fontClass = FONT_CLASSNAMES[fontStyle];

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: `1 / ${CARD_ASPECT}`,
    borderRadius: size === 'compact' ? '0.875rem' : size === 'carousel' ? '1.1rem' : '1.25rem',
    overflow: 'hidden',
    background: backgroundColor,
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: size === 'full' ? '2rem' : size === 'carousel' ? '1.6rem' : '1.1rem',
    transition: 'box-shadow 0.25s',
  };

  const bgImgStyle: CSSProperties = backgroundImage
    ? {
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.22,
        zIndex: 0,
      }
    : {};

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.06) 100%)',
    zIndex: 1,
    borderRadius: 'inherit',
  };

  const contentStyle: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  // 출처/저자 표기 여부 (3장씩 lineClamp 모드에서는 출처 미표시)
  const hasAttribution = !lineClamp && (source || author);

  // Determine text color based on background luminance
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isDark = luminance < 0.55;
  const textColor = isDark ? 'rgba(255,255,255,0.93)' : 'rgba(44,49,74,0.90)';
  const mutedColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(44,49,74,0.45)';

  const textSize = lineClamp
    ? '0.68rem' // 3장씩: 이전보다 작게 조정
    : size === 'full'
      ? text.length > 60
        ? '1.2rem'
        : text.length > 30
        ? '1.45rem'
        : '1.7rem'
      : size === 'carousel'
      ? text.length > 60
        ? '0.72rem'
        : text.length > 30
        ? '0.89rem'
        : '1.06rem'
      : text.length > 60
      ? '0.72rem'
      : text.length > 30
      ? '0.82rem'
      : '0.95rem';

  return (
    <div style={wrapperStyle}>
      {backgroundImage && <div style={bgImgStyle} />}
      <div style={overlayStyle} />
      <div style={contentStyle}>

        {/* ── 상단: 따옴표 (항상 카드 상단 고정) ── */}
        <div
          style={{
            fontSize: size === 'full' ? '3.5rem' : size === 'carousel' ? '2.8rem' : '1.8rem',
            lineHeight: 1,
            color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(103, 94, 207,0.18)',
            fontFamily: "'Gowun Batang', serif",
            flexShrink: 0,
          }}
        >
          "
        </div>

        {/* Top right date (Carousel size only) */}
        {size === 'carousel' && date && (
          <div
            style={{
              position: 'absolute',
              top: '1.2rem',
              right: '1.2rem',
              fontSize: '0.6rem',
              fontWeight: 700,
              color: mutedColor,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.02em',
            }}
          >
            {date}
          </div>
        )}

        {/* ── 중간: 본문 텍스트 ──
             lineClamp(3장씩): 상단 정렬 + 4줄 말줄임
             일반(1장씩/2장씩): 남은 공간에서 세로 중앙 정렬 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            // 3장씩(lineClamp): 텍스트를 상단부터 표시
            // 1·2장씩: 중간 영역 내 세로 중앙
            alignItems: lineClamp ? 'flex-start' : 'center',
            overflow: 'hidden',
          }}
        >
          <p
            className={fontClass}
            style={{
              color: textColor,
              fontSize: textSize,
              lineHeight: 1.75,
              letterSpacing: '-0.01em',
              whiteSpace: 'pre-wrap',
              wordBreak: 'keep-all',
              width: '100%',
              ...(lineClamp
                ? {
                    display: '-webkit-box',
                    WebkitLineClamp: lineClamp,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    // 실기기 이중 방어: font-size(0.68rem) × line-height(1.75) × 4줄
                    maxHeight: `${0.68 * 1.75 * lineClamp}rem`,
                  }
                : {}),
            }}
          >
            {text || (
              <span style={{ opacity: 0.35 }}>
                여기에 문장이 입력됩니다
              </span>
            )}
          </p>
        </div>

        {/* ── 하단: 출처/저자 phantom 영역 ──
             lineClamp(3장씩): 출처 미표시이므로 phantom 영역 자체를 렌더링하지 않음
             1·2장씩: 항상 동일한 높이 확보 (문장/단상 카드 텍스트 Y좌표 일치) */}
        {!lineClamp && (
          <div style={{ flexShrink: 0, visibility: hasAttribution ? 'visible' : 'hidden' }}>
            <div
              style={{
                marginTop: size === 'full' ? '1.25rem' : size === 'carousel' ? '1rem' : '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.1rem',
              }}
            >
              <span
                style={{
                  color: mutedColor,
                  fontSize: size === 'full' || size === 'carousel' ? '0.75rem' : '0.55rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  display: 'block',
                  minHeight: '1em',
                }}
              >
                {author ? `— ${author}` : ''}
              </span>
              <span
                style={{
                  color: mutedColor,
                  fontSize: size === 'full' || size === 'carousel' ? '0.72rem' : '0.55rem',
                  letterSpacing: '0.03em',
                  display: 'block',
                  minHeight: '1em',
                }}
              >
                {source ?? ''}
              </span>
            </div>
          </div>
        )}

        {/* 날짜는 별도 (있을 경우만) */}
        {date && (
          <div
            style={{
              flexShrink: 0,
              marginTop: size === 'full' ? '0.5rem' : '0.25rem',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <span
              style={{
                color: mutedColor,
                fontSize: size === 'full' ? '0.62rem' : '0.48rem',
                letterSpacing: '0.04em',
                fontFamily: 'inherit',
              }}
            >
              {date}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
