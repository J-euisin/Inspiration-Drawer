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
  size?: 'full' | 'compact';
  date?: string;
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
}: CardPreviewProps) {
  const fontClass = FONT_CLASSNAMES[fontStyle];

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: `1 / ${CARD_ASPECT}`,
    borderRadius: size === 'full' ? '1.25rem' : '0.875rem',
    overflow: 'hidden',
    background: backgroundColor,
    boxShadow: size === 'full'
      ? '0 8px 40px rgba(110,107,168,0.18)'
      : '0 2px 14px rgba(110,107,168,0.13)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: size === 'full' ? '2rem' : '1.1rem',
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
    justifyContent: 'space-between',
    height: '100%',
  };

  // Determine text color based on background luminance
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isDark = luminance < 0.55;
  const textColor = isDark ? 'rgba(255,255,255,0.93)' : 'rgba(44,49,74,0.90)';
  const mutedColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(44,49,74,0.45)';

  const textSize =
    size === 'full'
      ? text.length > 60
        ? '1.2rem'
        : text.length > 30
        ? '1.45rem'
        : '1.7rem'
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
        {/* Decorative quote mark */}
        <div
          style={{
            fontSize: size === 'full' ? '3.5rem' : '1.8rem',
            lineHeight: 1,
            color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(110,107,168,0.18)',
            fontFamily: "'Gowun Batang', serif",
            marginBottom: size === 'full' ? '0.5rem' : '0.2rem',
          }}
        >
          "
        </div>

        {/* Main text */}
        <p
          className={fontClass}
          style={{
            color: textColor,
            fontSize: textSize,
            lineHeight: 1.75,
            letterSpacing: '-0.01em',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'pre-wrap',
            wordBreak: 'keep-all',
          }}
        >
          {text || (
            <span style={{ opacity: 0.35 }}>
              여기에 문장이 입력됩니다
            </span>
          )}
        </p>

        {/* Attribution */}
        {(source || author) && (
          <div
            style={{
              marginTop: size === 'full' ? '1.25rem' : '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.1rem',
            }}
          >
            {author && (
              <span
                style={{
                  color: mutedColor,
                  fontSize: size === 'full' ? '0.8rem' : '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                — {author}
              </span>
            )}
            {source && (
              <span
                style={{
                  color: mutedColor,
                  fontSize: size === 'full' ? '0.72rem' : '0.55rem',
                  letterSpacing: '0.03em',
                }}
              >
                {source}
              </span>
            )}
          </div>
        )}

        {/* 하단 날짜 (있을 경우만) */}
        {date && (
          <div
            style={{
              marginTop: size === 'full' ? '1rem' : '0.5rem',
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
