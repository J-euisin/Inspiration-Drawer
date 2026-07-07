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
  formatDateEn,
} from '@/lib/storage';
import { useRouter } from 'next/navigation';

// 초기화 코드는 import들 바로 아래에 둡니다.
if (typeof window !== 'undefined') {
  mixpanel.init('0b1dd49538bf87bbb8b09c557d21680e', { track_pageview: true });
}

export default function HomePage() {
  const quote = getDailyQuote();
  const router = useRouter();

  const [thoughts,   setThoughts]   = useState<Thought[]>([]);
  const [inputText,  setInputText]  = useState('');
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editText,   setEditText]   = useState('');
  const [focused,    setFocused]    = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);
  
  // 팝업 관련 상태
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const listRef     = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposing = useRef(false);

  useEffect(() => {
    setThoughts(getThoughts());
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    setDeleteConfirmId(null);
    setSelectedThought(null);
  }

  function handleEditStart(t: Thought) {
    setEditingId(t.id);
    setEditText(t.text);
  }

  function handleEditSave(id: string) {
    const trimmed = editText.trim();
    if (!trimmed) return;
    updateThought(id, trimmed);
    const newThoughts = getThoughts();
    setThoughts(newThoughts);
    setEditingId(null);
    setEditText('');
    if (selectedThought) {
      const updated = newThoughts.find(t => t.id === id);
      if (updated) setSelectedThought(updated);
    }
  }

  function handleMakeCard(thought: Thought) {
    const params = new URLSearchParams({
      text: thought.text,
      mode: 'thought',
    });
    router.push(`/create?${params.toString()}`);
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
      {/* ── 배경 보라 그라데이션 오버레이 (Gemini 스타일, CSS-only) ── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 80% 50% at 50% 38%, hsla(245, 47%, 74%, 0.35) 0%, hsla(242, 46%, 54%, 0.14) 40%, hsla(231, 80%, 69%, 0.06) 62%, transparent 78%)',
          filter: 'blur(2px)',
        }}
      />

      <div
        className="pb-[7rem] md:pb-10"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '680px',
          margin: '0 auto',
          padding: '0 20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        {/* ── 히어로 인사 영역 ── */}
        <section
          style={{
            textAlign: 'center',
            padding: '5rem 1rem 2.25rem',
          }}
        >
          {/* 메인 타이틀 */}
          <h1
            className="text-[1.4rem] md:text-[2rem] leading-snug"
            style={{
              fontFamily: "'Noto Sans KR', sans-serif",
              fontWeight: 200,
              color: 'var(--color-text)',
              letterSpacing: '-0.01em',
            }}
          >
            지금, 서랍에 간직하고 싶은<br className="md:hidden" /> 생각이 있나요?
          </h1>

          <p
            className="whitespace-normal break-keep md:whitespace-nowrap"
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.75,
              marginTop: isMobile ? '16px' : '20px',
            }}
          >
            매일의 작은 생각과 기록이 축적되다 보면,<br className="md:hidden" /> 어느날 반짝이는 영감이 가까이 와있을 거에요.
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
              border: 'none',
              borderRadius: '9999px',
              padding: '0.65rem 0.65rem 0.65rem 1.5rem',
              boxShadow: focused
                ? '0 4px 20px rgba(0, 0, 0, 0.18)'
                : '0 2px 10px rgba(0, 0, 0, 0.12)',
              gap: '0.65rem',
              transition: 'box-shadow 0.2s',
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
              placeholder={
                isMobile
                  ? "아주 사소한 것이라도 좋아요."
                  : "떠오르는 생각을 적어보세요. 아주 사소한 것이라도 좋아요."
              }
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
                style={{
                  borderRadius: '9999px',
                  padding: '0.45rem 1.1rem',
                  fontSize: '0.84rem',
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
          <section
            style={{ marginBottom: '1.5rem' }}
            className="animate-fade-in"
          >
            {thoughts.length === 0 ? (
              <div
                style={{
                  height: '48px', // 1-row box height
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgba(167, 163, 216, 0.5), transparent)',
                  }}
                />
              </div>
            ) : (
              /* 테두리 래퍼 (스크롤바를 안쪽으로 넣고 테두리와 여백 둠) */
              <div
                style={{
                  border: '1px solid rgba(167, 163, 216, 0.4)',
                  borderRadius: '1rem',
                  padding: '0.4rem 6px 0.4rem 0.4rem',
                }}
              >
              <div
                ref={listRef}
                style={{
                  width: '100%',
                  minHeight: '34px', // 1 compact row height
                  maxHeight: '135px', // About 4 compact rows
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem',
                  paddingRight: '4px', // Scrollbar space
                  // 아래로 갈수록 흐려지는(페이드 아웃) 영역 마스크 효과 (우측 스크롤바 영역은 마스크 예외 처리)
                  WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%), linear-gradient(to bottom, black, black)',
                  maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%), linear-gradient(to bottom, black, black)',
                  WebkitMaskSize: 'calc(100% - 16px) 100%, 16px 100%',
                  maskSize: 'calc(100% - 16px) 100%, 16px 100%',
                  WebkitMaskPosition: 'left top, right top',
                  maskPosition: 'left top, right top',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                }}
              >
                {[...thoughts]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedThought(t)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.35rem 0.8rem',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderRadius: '0.5rem',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(110,107,168,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    }}
                  >
                  <p
                    style={{
                      flex: 1,
                      fontSize: '0.8rem',
                      color: 'var(--color-text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginRight: '0.8rem',
                    }}
                  >
                    {t.text}
                  </p>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: '0.7rem',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'inherit',
                    }}
                  >
                    {formatDateEn(t.updatedAt ?? t.createdAt)}
                  </span>
                </div>
              ))}
            </div>
            </div>
            )}
          </section>



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

      {/* ── 상세 팝업 모달 ── */}
      {selectedThought && (
        <div
          onClick={() => {
            if (!deleteConfirmId) {
              setSelectedThought(null);
              setEditingId(null);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in"
            style={{
              background: 'var(--color-surface)',
              borderRadius: '1.25rem',
              width: '100%',
              maxWidth: '400px',
              padding: '1.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
            {/* 삭제 확인 모달 */}
            {deleteConfirmId === selectedThought.id ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1.5rem' }}>
                  이 단상을 삭제할까요?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button
                    className="btn-ghost"
                    onClick={() => setDeleteConfirmId(null)}
                    style={{ flex: 1 }}
                  >
                    취소
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => handleDelete(selectedThought.id)}
                    style={{ flex: 1, background: '#EF4444' }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ) : (
              /* 일반 상세 모달 */
              <>
                <button
                  onClick={() => { setSelectedThought(null); setEditingId(null); }}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  ✕
                </button>
                
                {editingId === selectedThought.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                    <textarea
                      className="input-base"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={300}
                      autoFocus
                      style={{ minHeight: '100px', fontSize: '0.9rem', resize: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn-ghost" onClick={() => setEditingId(null)}>취소</button>
                      <button className="btn-primary" onClick={() => handleEditSave(selectedThought.id)}>저장</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                      <p
                        style={{
                          fontSize: '1.05rem',
                          lineHeight: 1.6,
                          color: 'var(--color-text)',
                          wordBreak: 'keep-all',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {selectedThought.text}
                      </p>
                    </div>
                    
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--color-border)',
                        paddingTop: '1rem',
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {formatDateEn(selectedThought.updatedAt ?? selectedThought.createdAt)}
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          title="카드로 만들기"
                          onClick={() => handleMakeCard(selectedThought)}
                          style={{
                            background: 'rgba(110,107,168,0.1)',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ＋ 카드 만들기
                        </button>
                        <button
                          title="수정"
                          onClick={() => handleEditStart(selectedThought)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '0.3rem',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          title="삭제"
                          onClick={() => setDeleteConfirmId(selectedThought.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '0.3rem',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
