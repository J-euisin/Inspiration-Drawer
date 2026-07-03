'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontStyle, FONT_LABELS, FONT_CLASSNAMES } from '@/lib/types';
import { saveCard, generateId } from '@/lib/storage';
import CardPreview from '@/components/CardPreview';
import { useNavigationGuard } from '@/lib/navigation-guard-context';

/* ── Preset background colors ── */
const BG_COLORS = [
  { hex: '#EEE8F8', label: '라벤더' },
  { hex: '#E8E4F4', label: '연보라' },
  { hex: '#F5F0FF', label: '연보라2' },
  { hex: '#FFF7ED', label: '피치' },
  { hex: '#FFF0F5', label: '로즈' },
  { hex: '#EDF7F5', label: '민트' },
  { hex: '#EEF3FE', label: '퍼리윙클' },
  { hex: '#F5F5F0', label: '오트밀' },
  { hex: '#2C314A', label: '딥네이비' },
  { hex: '#3D3060', label: '다크퍼플' },
  { hex: '#1A1A2E', label: '미드나잇' },
  { hex: '#2D4A3E', label: '포레스트' },
];

const FONTS: { value: FontStyle; preview: string }[] = [
  { value: 'gothic',      preview: '고딕 — 깔끔하고 현대적인' },
  { value: 'myeongjo',    preview: '명조 — 단아하고 고전적인' },
  { value: 'cursive',     preview: '필기체 — 흘려쓴 감성' },
  { value: 'handwriting', preview: '손글씨 — 따뜻하고 정겨운' },
];

type CardMode = 'quote' | 'thought';

function CreatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setDirty } = useNavigationGuard();

  // URL 파라미터로 전달된 값 읽기
  const paramText = searchParams.get('text') ?? '';
  const paramMode = searchParams.get('mode') === 'thought' ? 'thought' : null;

  const [mode, setMode] = useState<CardMode>(paramMode ?? 'thought');
  const [text, setText] = useState(paramText);
  const [source, setSource] = useState('');
  const [author, setAuthor] = useState('');
  const [fontStyle, setFontStyle] = useState<FontStyle>('myeongjo');
  const [bgColor, setBgColor] = useState('#EEE8F8');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'color' | 'image'>('color');

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Dirty 상태 계산 및 컨텍스트 등록 ──
  const isDirty = text.trim() !== '' || source.trim() !== '' || author.trim() !== '';

  useEffect(() => {
    setDirty(isDirty);
    // 컴포넌트 언마운트 시 dirty 해제
    return () => setDirty(false);
  }, [isDirty, setDirty]);

  // ── 브라우저 새로고침 / 탭 닫기 대응 ──
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);


  // 단상 모드일 때 배경 기본값 약간 다르게
  useEffect(() => {
    if (mode === 'thought') {
      setBgColor('#F5F0FF');
    } else {
      setBgColor('#EEE8F8');
    }
    // 모드 전환 시 출처/저자 초기화
    setSource('');
    setAuthor('');
  }, [mode]);

  /* ── Handlers ── */
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('이미지 파일만 업로드할 수 있습니다.'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('5MB 이하 이미지만 사용할 수 있습니다.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setBgImage(ev.target?.result as string); };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = async () => {
    if (!text.trim()) {
      showToast(mode === 'thought' ? '단상을 입력해주세요.' : '문장을 입력해주세요.');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    // 저장 성공 → dirty 해제 후 이동 (guard 팝업 없이)
    setDirty(false);
    saveCard({
      id: generateId(),
      text: text.trim(),
      fontStyle,
      backgroundColor: bgColor,
      backgroundImage: bgImage,
      source: mode === 'quote' ? (source.trim() || undefined) : undefined,
      author: mode === 'quote' ? (author.trim() || undefined) : undefined,
      createdAt: new Date().toISOString(),
      type: mode,
    });
    setSaving(false);
    router.push('/archive');
  };

  const handleCustomColor = (val: string) => {
    setCustomColor(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) setBgColor(val);
  };

  /* ── Render ── */
  return (
    <div className="page-wrapper">
      {toast && <div className="toast">{toast}</div>}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.25rem 7rem' }}>
        {/* Page header */}
        <div className="animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <h1
            className="max-md:mt-[40px]"
            style={{
              fontFamily: "'Gowun Dodum', sans-serif",
              fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '0.35rem',
            }}
          >
            카드 만들기
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            {mode === 'thought'
              ? '단상을 담아 나만의 감성 카드로 만들어보세요.'
              : '문장을 입력하고, 나만의 감성으로 카드를 완성하세요.'}
          </p>
        </div>

        {/* ── Mode toggle ── */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.75rem',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '9999px',
            padding: '0.3rem',
            width: 'fit-content',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          {([
            { value: 'thought' as CardMode, label: '💭 단상 기록하기' },
            { value: 'quote'   as CardMode, label: '📖 문장 수집하기' },
          ] as { value: CardMode; label: string }[]).map((item) => (
            <button
              key={item.value}
              id={`mode-${item.value}`}
              onClick={() => setMode(item.value)}
              style={{
                padding: '0.5rem 1.2rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: mode === item.value ? 700 : 400,
                background: mode === item.value ? 'var(--color-primary)' : 'transparent',
                color: mode === item.value ? '#fff' : 'var(--color-text-muted)',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
            gap: '1.75rem',
            alignItems: 'start',
          }}
          className="create-grid"
        >
          {/* ── Left: Editor ── */}
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animationDelay: '0.05s',
            }}
          >
            {/* Text input */}
            <section
              style={{
                background: 'var(--color-surface)',
                borderRadius: '1.25rem',
                padding: '1.4rem',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <label
                className="section-label"
                style={{ display: 'block', marginBottom: '0.65rem' }}
              >
                {mode === 'thought' ? '단상 입력' : '문장 입력'}
              </label>
              <textarea
                id="card-text"
                className="input-base"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  mode === 'thought'
                    ? '지금 이 순간 떠오르는 생각을 적어보세요…'
                    : '기억하고 싶은 문장을 적어보세요…'
                }
                maxLength={200}
                style={{ minHeight: '110px', fontFamily: FONT_CLASSNAMES[fontStyle] }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.45rem',
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  최대 200자
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: text.length > 180 ? '#c0392b' : 'var(--color-text-muted)',
                  }}
                >
                  {text.length} / 200
                </span>
              </div>

              {/* Source & Author — 문장 모드일 때만 표시 */}
              {mode === 'quote' && (
                <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.9rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="section-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                      출처
                    </label>
                    <input
                      id="card-source"
                      className="input-base"
                      style={{ resize: 'none' }}
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="책 / 영화 / 시 이름"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="section-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                      저자
                    </label>
                    <input
                      id="card-author"
                      className="input-base"
                      style={{ resize: 'none' }}
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="작가 / 인물 이름"
                    />
                  </div>
                </div>
              )}

              {/* 단상 모드 안내 */}
              {mode === 'thought' && (
                <p
                  style={{
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.6,
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(110,107,168,0.05)',
                    borderRadius: '0.625rem',
                  }}
                >
                  💭 단상은 출처·저자 없이 나의 생각을 그대로 담습니다.
                </p>
              )}
            </section>

            {/* Font selector */}
            <section
              style={{
                background: 'var(--color-surface)',
                borderRadius: '1.25rem',
                padding: '1.4rem',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <p className="section-label" style={{ marginBottom: '0.75rem' }}>폰트 스타일</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {FONTS.map(({ value, preview }) => {
                  const active = fontStyle === value;
                  return (
                    <button
                      key={value}
                      id={`font-${value}`}
                      onClick={() => setFontStyle(value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: active ? 'rgba(110,107,168,0.08)' : 'transparent',
                        border: `1.5px solid ${active ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                        borderRadius: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <span
                        className={FONT_CLASSNAMES[value]}
                        style={{
                          fontSize: '1rem',
                          color: active ? 'var(--color-primary)' : 'var(--color-text)',
                          fontWeight: active ? 700 : 400,
                        }}
                      >
                        {FONT_LABELS[value]}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        }}
                      >
                        {preview}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Background selector */}
            <section
              style={{
                background: 'var(--color-surface)',
                borderRadius: '1.25rem',
                padding: '1.4rem',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {/* Tab switcher */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                {(['color', 'image'] as const).map((t) => (
                  <button
                    key={t}
                    id={`bg-tab-${t}`}
                    onClick={() => setTab(t)}
                    style={{
                      padding: '0.35rem 1rem',
                      borderRadius: '9999px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: tab === t ? 700 : 400,
                      background: tab === t ? 'var(--color-primary)' : 'var(--color-border)',
                      color: tab === t ? '#fff' : 'var(--color-text-muted)',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                    }}
                  >
                    {t === 'color' ? '🎨 배경 색상' : '🖼 이미지'}
                  </button>
                ))}
              </div>

              {tab === 'color' ? (
                <>
                  <p className="section-label" style={{ marginBottom: '0.65rem' }}>
                    프리셋 색상
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {BG_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        id={`color-${c.hex.replace('#', '')}`}
                        onClick={() => { setBgColor(c.hex); setBgImage(null); }}
                        title={c.label}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          background: c.hex,
                          border: bgColor === c.hex && !bgImage
                            ? '2.5px solid var(--color-primary)'
                            : '2px solid transparent',
                          borderRadius: '0.625rem',
                          cursor: 'pointer',
                          transition: 'transform 0.15s, border 0.15s',
                          transform: bgColor === c.hex && !bgImage ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Custom hex */}
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      직접 입력
                    </span>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => { setBgColor(e.target.value); setBgImage(null); }}
                      style={{
                        width: '36px',
                        height: '36px',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        padding: '2px',
                        background: 'transparent',
                      }}
                    />
                    <input
                      className="input-base"
                      value={customColor}
                      onChange={(e) => handleCustomColor(e.target.value)}
                      placeholder="#RRGGBB"
                      maxLength={7}
                      style={{ maxWidth: '110px', fontSize: '0.82rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    id="bg-image-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  {bgImage ? (
                    <div style={{ position: 'relative', borderRadius: '0.875rem', overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bgImage}
                        alt="배경 이미지"
                        style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.6rem',
                        }}
                      >
                        <button
                          className="btn-ghost"
                          style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--color-text)', fontSize: '0.8rem' }}
                          onClick={() => fileRef.current?.click()}
                        >
                          교체
                        </button>
                        <button
                          className="btn-ghost"
                          style={{ background: 'rgba(255,255,255,0.9)', color: '#c0392b', borderColor: 'transparent', fontSize: '0.8rem' }}
                          onClick={() => setBgImage(null)}
                        >
                          제거
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      style={{
                        width: '100%',
                        height: '100px',
                        border: '2px dashed var(--color-border)',
                        borderRadius: '0.875rem',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.82rem',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s, background 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '1.6rem' }}>🖼</span>
                      이미지 업로드 (5MB 이하)
                    </button>
                  )}
                  <p style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    이미지는 반투명하게 배경에 적용됩니다.
                  </p>
                </div>
              )}
            </section>

            {/* Save button */}
            <button
              id="save-card-btn"
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                borderRadius: '1rem',
                opacity: saving ? 0.75 : 1,
              }}
            >
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  저장 중…
                </span>
              ) : (
                '서랍에 담기 →'
              )}
            </button>
          </div>

          {/* ── Right: Live preview ── */}
          <div
            className="animate-fade-in"
            style={{
              position: 'sticky',
              top: '80px',
              animationDelay: '0.1s',
            }}
          >
            <p className="section-label" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
              미리보기
            </p>
            <div style={{ maxWidth: '320px', margin: '0 auto' }}>
              <CardPreview
                text={text}
                fontStyle={fontStyle}
                backgroundColor={bgColor}
                backgroundImage={bgImage}
                source={mode === 'quote' ? source : undefined}
                author={mode === 'quote' ? author : undefined}
                size="full"
              />
            </div>
            <p
              style={{
                textAlign: 'center',
                marginTop: '0.75rem',
                fontSize: '0.72rem',
                color: 'var(--color-text-muted)',
              }}
            >
              왼쪽에서 수정하면 바로 반영됩니다
            </p>
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 640px) {
          .create-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// useSearchParams needs Suspense boundary
export default function CreatePage() {
  return (
    <Suspense fallback={<div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><span style={{ color: 'var(--color-text-muted)' }}>불러오는 중…</span></div>}>
      <CreatePageInner />
    </Suspense>
  );
}
