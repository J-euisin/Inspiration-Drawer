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

  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setThoughts(getThoughts());
  }, []);

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
    // 목록 맨 위로 스크롤
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
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '1.25rem 1.25rem 6rem',
        }}
      >
        {/* Daily quote section */}
        <section style={{ marginBottom: '1.25rem' }}>
          {/* 섹션 라벨 — 단상 라벨과 동일 스타일 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.9rem',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>✦</span>
            <p className="section-label">오늘의 문장</p>
          </div>
          <DailyQuoteCard quote={quote} />
        </section>

        {/* ── Thought input section ── */}
        <section className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          {/* Section header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.9rem',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>💭</span>
            <p className="section-label">오늘의 단상</p>
          </div>

          {/* Input area */}
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '1.25rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
            }}
          >
            <textarea
              id="thought-input"
              className="input-base"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
              }}
              placeholder="지금 이 순간 떠오르는 생각을 적어보세요… (Cmd+Enter로 기록)"
              maxLength={300}
              style={{
                border: 'none',
                boxShadow: 'none',
                borderRadius: '1.25rem 1.25rem 0 0',
                minHeight: '80px',
                resize: 'none',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 1rem',
                borderTop: '1px solid var(--color-border)',
                background: 'rgba(110,107,168,0.03)',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                {inputText.length} / 300
              </span>
              <button
                id="thought-submit-btn"
                className="btn-primary"
                onClick={handleAdd}
                disabled={!inputText.trim()}
                style={{
                  fontSize: '0.82rem',
                  padding: '0.45rem 1.1rem',
                  opacity: !inputText.trim() ? 0.5 : 1,
                }}
              >
                기록하기
              </button>
            </div>
          </div>

          {/* Thought list — fixed height, scrollable */}
          {thoughts.length > 0 && (
            <div
              ref={listRef}
              style={{
                marginTop: '0.75rem',
                maxHeight: '320px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                paddingRight: '2px', // scrollbar 공간
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
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-text-muted)',
                          }}
                        >
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
          )}

          {thoughts.length === 0 && (
            <p
              style={{
                marginTop: '0.75rem',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '1rem',
              }}
            >
              아직 기록된 단상이 없어요. 오늘의 생각을 남겨보세요 🌱
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
