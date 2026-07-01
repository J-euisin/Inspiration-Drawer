"use client"
import mixpanel from 'mixpanel-browser';
import Link from 'next/link';
import { getDailyQuote } from '@/lib/quotes';
import DailyQuoteCard from '@/components/DailyQuoteCard';

// 초기화 코드는 import들 바로 아래에 둡니다.
if (typeof window !== 'undefined') {
  mixpanel.init('0b1dd49538bf87bbb8b09c557d21680e', { track_pageview: true });
}
export default function HomePage() {
  const quote = getDailyQuote();

  return (
    <div className="page-wrapper">
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '2.5rem 1.25rem 6rem',
        }}
      >
        {/* Hero greeting */}
        <div
          className="animate-fade-in"
          style={{ marginBottom: '2.5rem', textAlign: 'center' }}
        >
          <div
            className="animate-float"
            style={{
              fontSize: '3rem',
              marginBottom: '0.75rem',
              display: 'inline-block',
            }}
          >
            🗂️
          </div>
          <h1
            style={{
              fontFamily: "'Gowun Batang', serif",
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}
          >
            영감의 서랍
          </h1>
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.92rem',
              maxWidth: '360px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            떠오르는 단상과 감명 깊은 문장을
            <br />
            나만의 카드로 소장하세요.
          </p>
        </div>

        {/* Daily quote section */}
        <section style={{ marginBottom: '2.5rem' }}>
          <DailyQuoteCard quote={quote} />
        </section>

        {/* Quick actions */}
        <section
          className="animate-fade-in stagger-children"
          style={{ animationDelay: '0.2s' }}
        >
          <p className="section-label" style={{ marginBottom: '0.9rem' }}>
            나만의 기록 시작하기
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
            }}
          >
            <Link href="/create" style={{ textDecoration: 'none' }}>
              <div
                className="card-surface animate-fade-in"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f0eeff 0%, #e8e4f8 100%)',
                  borderColor: '#dbd7f0',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>✎</div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--color-primary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  카드 만들기
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  문장을 카드로 담아보세요
                </p>
              </div>
            </Link>

            <Link href="/archive" style={{ textDecoration: 'none' }}>
              <div
                className="card-surface animate-fade-in"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f5eeff 0%, #ecdcf8 100%)',
                  borderColor: '#ddd0f0',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>⊞</div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--color-primary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  나의 서랍
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  소장한 카드를 감상하세요
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Tip */}
        <div
          className="animate-fade-in"
          style={{
            marginTop: '2rem',
            padding: '1rem 1.2rem',
            background: 'rgba(110,107,168,0.05)',
            borderRadius: '1rem',
            border: '1px solid rgba(110,107,168,0.12)',
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'flex-start',
            animationDelay: '0.35s',
          }}
        >
          <span style={{ fontSize: '1rem', marginTop: '1px' }}>💡</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            오늘의 문장은 매일 새롭게 바뀝니다.{' '}
            <strong style={{ color: 'var(--color-primary)', fontWeight: 600 }}>소장하기</strong>를
            눌러 마음에 드는 문장을 나의 서랍에 담아두세요.
          </p>
        </div>
      </div>
    </div>
  );
}
