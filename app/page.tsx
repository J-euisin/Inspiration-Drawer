"use client";
import { useState, useEffect, useRef } from 'react';
import mixpanel from 'mixpanel-browser';
import { getDailyQuote } from '@/lib/quotes';
import DailyQuoteCard from '@/components/DailyQuoteCard';
import { Thought } from '@/lib/types';
import {
  getThoughts,
  saveThought,
  updateThought,
  deleteThought,
  generateId,
} from '@/lib/storage';
import { useRouter } from 'next/navigation';

// 초기화 코드는 import들 바로 아래에 둡니다.
if (typeof window !== 'undefined') {
  mixpanel.init('0b1dd49538bf87bbb8b09c557d21680e', { track_pageview: true });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HomePage() {
  const quote = getDailyQuote();
  const router = useRouter();

  const [thoughts,   setThoughts]   = useState<Thought[]>([]);
  const [inputText,  setInputText]  = useState('');
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editText,   setEditText]   = useState('');
  const [focused,    setFocused]    = useState(false);
  const listRef     = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposing = useRef(false);

  useEffect(() => {
    setThoughts(getThoughts());
  }, []);

  // 텍스트 입력 + 자동 높이 조절
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  }

  function handleAdd() {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const thought: Thought = {
      id: generateId(),
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    saveThought(thought);
    setThoughts(getThoughts());
    setInputText('');
    // 텍스트에리어 높이 초기화
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setTimeout(() => {
      if (listRef.current) listRef.current.scrollTop = 0;
    }, 50);
  }

  function handleDelete(id: string) {
    deleteThought(id);
    setThoughts(getThoughts());
  }

  function handleEditStart(t: Thought) {
    setEditingId(t.id);
    setEditText(t.text);
  }

  function handleEditSave(id: string) {
    const trimmed = editText.trim();
    if (!trimmed) return;
    updateThought(id, trimmed);
    setThoughts(getThoughts());
    setEditingId(null);
    setEditText('');
  }

  function handleMakeCard(thought: Thought) {
    const params = new URLSearchParams({
      text: thought.text,
      mode: 'thought',
    });
    router.push(`/create?${params.toString()}`);
  }

  return (
    <div className="page-wrapper">
      {/* ── 배경 보라 그라데이션 오버레이 (Gemini 스타일, CSS-only) ── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 80% 50% at 50% 38%, rgba(167,163,216,0.35) 0%, rgba(110,107,168,0.14) 40%, rgba(126,140,224,0.06) 62%, transparent 78%)',
          filter: 'blur(2px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '680px',
          margin: '0 auto',
          padding: '0 1.25rem 2.5rem',
        }}
      >
        {/* ── 히어로 인사 영역 ── */}
        <section
          style={{
            textAlign: 'center',
            padding: '5rem 1rem 2.25rem',
          }}
        >
          {/* 메인 타이틀 — Gowun Dodum */}
          <h1
            style={{
              fontFamily: "'Gowun Dodum', sans-serif",
              fontSize: 'clamp(1.45rem, 3.5vw, 2rem)',
              fontWeight: 400,
              color: 'var(--color-text)',
              letterSpacing: '-0.01em',
              lineHeight: 1.4,
              marginBottom: '1rem',
            }}
          >
            지금, 서랍에 간직하고 싶은 생각이 있나요?
          </h1>

          {/* 설명 — 한 줄 */}
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.75,
              whiteSpace: 'nowrap',
            }}
          >
            매일의 작은 생각과 기록이 축적되다 보면, 어느날 반짝이는 영감이 가까이 와있을 거에요.
          </p>
        </section>

        {/* ── 단상 입력 (pill 형태) ── */}
        <section
          className="animate-fade-in"
          style={{ marginBottom: '1.5rem', animationDelay: '0.1s' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--color-surface)',
              border: `1.5px solid ${focused ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: '9999px',
              padding: '0.65rem 0.65rem 0.65rem 1.5rem',
              boxShadow: focused
                ? '0 0 0 3px rgba(110,107,168,0.12), 0 4px 24px rgba(110,107,168,0.1)'
                : '0 2px 16px rgba(110,107,168,0.09)',
              gap: '0.65rem',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          >
            <textarea
              id="thought-input"
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInput}
              onCompositionStart={() => {
                isComposing.current = true;
              }}
              onCompositionEnd={() => {
                // 이벤트 루프의 다음 틱으로 넘겨서 
                // 직후 발생하는 keydown 이벤트까지 안전하게 무시되도록 함
                setTimeout(() => {
                  isComposing.current = false;
                }, 0);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (e.nativeEvent.isComposing || isComposing.current) return;
                  handleAdd();
                }
                // Shift+Enter → 줄바꿈 (기본 동작)
              }}
              placeholder="떠오르는 생각을 적고 Enter를 눌러보세요"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                resize: 'none',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                color: 'var(--color-text)',
                lineHeight: 1.6,
                maxHeight: '128px',
                overflowY: 'auto',
                padding: '0.15rem 0',
              }}
            />

            {/* 글자 수 + 기록하기 버튼 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexShrink: 0,
              }}
            >
              <button
                id="thought-submit-btn"
                className="btn-accent"
                onClick={handleAdd}
                disabled={!inputText.trim()}
                style={{
                  borderRadius: '9999px',
                  padding: '0.45rem 1.1rem',
                  fontSize: '0.84rem',
                  opacity: !inputText.trim() ? 0.45 : 1,
                  transition: 'opacity 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                기록하기
              </button>
            </div>
          </div>
        </section>

        {/* ── 기록된 단상 목록 ── */}
        {thoughts.length > 0 && (
          <section
            style={{ marginBottom: '1.5rem' }}
            className="animate-fade-in"
          >
            <div
              ref={listRef}
              style={{
                maxHeight: '320px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                paddingRight: '2px',
              }}
            >
              {thoughts.map((t) => (
                <div
                  key={t.id}
                  className="animate-fade-in"
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: '1rem',
                    border: '1px solid var(--color-border)',
                    padding: '0.85rem 1rem',
                    boxShadow: '0 1px 8px rgba(110,107,168,0.07)',
                  }}
                >
                  {editingId === t.id ? (
                    /* Inline edit mode */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <textarea
                        className="input-base"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={300}
                        autoFocus
                        style={{ minHeight: '64px', fontSize: '0.88rem', resize: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-ghost"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
                          onClick={() => setEditingId(null)}
                        >
                          취소
                        </button>
                        <button
                          className="btn-primary"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
                          onClick={() => handleEditSave(t.id)}
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Read mode */
                    <>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          lineHeight: 1.7,
                          color: 'var(--color-text)',
                          marginBottom: '0.55rem',
                          wordBreak: 'keep-all',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {t.text}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.4rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {formatDateTime(t.updatedAt ?? t.createdAt)}
                          {t.updatedAt && ' (수정됨)'}
                        </span>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <button
                            title="카드로 만들기"
                            onClick={() => handleMakeCard(t)}
                            style={{
                              background: 'rgba(110,107,168,0.1)',
                              border: 'none',
                              borderRadius: '9999px',
                              padding: '0.28rem 0.7rem',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              transition: 'background 0.2s',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ＋ 카드로 만들기
                          </button>
                          <button
                            title="수정"
                            onClick={() => handleEditStart(t)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              padding: '0.28rem 0.5rem',
                              borderRadius: '9999px',
                              color: 'var(--color-text-muted)',
                              transition: 'color 0.2s, background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(110,107,168,0.08)';
                              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            title="삭제"
                            onClick={() => handleDelete(t.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              padding: '0.28rem 0.5rem',
                              borderRadius: '9999px',
                              color: 'var(--color-text-muted)',
                              transition: 'color 0.2s, background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(192,57,43,0.08)';
                              (e.currentTarget as HTMLButtonElement).style.color = '#c0392b';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 빈 상태 */}
        {thoughts.length === 0 && (
          <p
            style={{
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              padding: '0.75rem 1rem',
            }}
          >
            아직 기록된 단상이 없어요. 오늘의 생각을 남겨보세요 🌱
          </p>
        )}

        {/* ── 오늘의 문장 배너 (하단) ── */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <DailyQuoteCard quote={quote} />
        </section>

        {/* ── 영감 정의 (맨 아래) ── */}
        <p
          style={{
            marginTop: '1.25rem',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            letterSpacing: '0.02em',
            opacity: 0.7,
          }}
        >
          영감 靈感 : 창조적인 일의 계기가 되는 기발한 착상이나 자극.
        </p>
      </div>
    </div>
  );
}
