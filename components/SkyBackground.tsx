'use client';

import { useState, useEffect } from 'react';

// ─── 색상 유틸 ──────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function lerpColor(c1: string, c2: string, t: number): string {
  const [r1,g1,b1] = hexToRgb(c1);
  const [r2,g2,b2] = hexToRgb(c2);
  return `rgb(${Math.round(lerp(r1,r2,t))},${Math.round(lerp(g1,g2,t))},${Math.round(lerp(b1,b2,t))})`;
}

// ─── 시간대별 그라데이션 키프레임 (위→아래) ──────────────────────────────────
// [시각, 위 색, 아래 색]
const GK: [number, string, string][] = [
  // ── 밤 ────────────────────────────────────────────
  [ 0,   '#3E1D55', '#3E1D55'],  // 자정
  [ 4,   '#3E1D55', '#3E1D55'],  // 새벽 전 — 밤 색 유지
  // ── 새벽 (#ADA6FF → #B5D2E8) ─────────────────────
  [ 6,   '#ADA6FF', '#B5D2E8'],  // 새벽 여명
  [ 8,   '#ADA6FF', '#B5D2E8'],  // 새벽 후반
  // ── 아침 (#78C2EA → #F7F3E5) ─────────────────────
  [ 9.5, '#78C2EA', '#F7F3E5'],  // 아침 시작
  [15,   '#78C2EA', '#F7F3E5'],  // 오후까지 아침 팔레트 유지
  // ── 저녁 (#4B3286 → #AE6AB8) ─────────────────────
  [17,   '#4B3286', '#AE6AB8'],  // 저녁 시작
  [20,   '#4B3286', '#AE6AB8'],  // 저녁 후반 / 황혼
  // ── 밤으로 전환 ───────────────────────────────────
  [21.5, '#3E1D55', '#3E1D55'],  // 밤 복귀
  [24,   '#3E1D55', '#3E1D55'],  // 자정 (loop)
];

function getSkyColors(hour: number): { top: string; bot: string } {
  const h = ((hour % 24) + 24) % 24;
  for (let i = 0; i < GK.length - 1; i++) {
    if (h >= GK[i][0] && h < GK[i+1][0]) {
      const t = (h - GK[i][0]) / (GK[i+1][0] - GK[i][0]);
      return { top: lerpColor(GK[i][1], GK[i+1][1], t), bot: lerpColor(GK[i][2], GK[i+1][2], t) };
    }
  }
  return { top: GK[0][1], bot: GK[0][2] };
}

// ─── 개발용 시간 프리셋 ──────────────────────────────────────────────────────
const PRESETS = [
  { label: '새벽', h: 6.5  },
  { label: '낮',   h: 12   },
  { label: '저녁', h: 18.5 },
  { label: '밤',   h: 23   },
];

// ─── Props ───────────────────────────────────────────────────────────────────
interface SkyBackgroundProps {
  devHour: number | null;
  setDevHour: (h: number | null) => void;
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────
export default function SkyBackground({ devHour, setDevHour }: SkyBackgroundProps) {
  const [exactHour, setExactHour] = useState<number>(() => {
    const n = new Date();
    return n.getHours() + n.getMinutes() / 60 + n.getSeconds() / 3600;
  });
  const [showDev, setShowDev] = useState(false);

  // 1분마다 실제 시각 갱신
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setExactHour(n.getHours() + n.getMinutes() / 60 + n.getSeconds() / 3600);
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const hour = devHour ?? exactHour;
  const { top, bot } = getSkyColors(hour);

  return (
    <>
      {/* ── 하늘 그라데이션 배경 (fixed, z-index 0) ── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `linear-gradient(to bottom, ${top} 0%, ${bot} 100%)`,
          overflow: 'hidden',
        }}
      >
        {/* 하단 안개 — 콘텐츠 가독성 보조 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '40%',
            background: 'linear-gradient(to top, rgba(250,248,245,0.07) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* ── 개발용 시간대 토글 ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '5.5rem',
          right: '1rem',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.4rem',
        }}
      >
        {showDev && (
          <div
            style={{
              background: 'rgba(20,15,40,0.88)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderRadius: '1rem',
              padding: '0.65rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              border: '1px solid rgba(167,163,216,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <p style={{
              fontSize: '0.64rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'rgba(167,163,216,0.7)',
              textTransform: 'uppercase',
              marginBottom: '0.15rem',
              paddingLeft: '0.5rem',
            }}>
              시간대 미리보기
            </p>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setDevHour(devHour === p.h ? null : p.h)}
                style={{
                  padding: '0.38rem 0.85rem',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontFamily: 'inherit',
                  fontWeight: devHour === p.h ? 700 : 400,
                  background: devHour === p.h
                    ? 'rgba(103, 94, 207,0.5)'
                    : 'rgba(255,255,255,0.07)',
                  color: devHour === p.h ? '#fff' : 'rgba(210,205,245,0.8)',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.label}
              </button>
            ))}
            {devHour !== null && (
              <button
                onClick={() => setDevHour(null)}
                style={{
                  marginTop: '0.1rem',
                  padding: '0.3rem 0.85rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(167,163,216,0.2)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontFamily: 'inherit',
                  background: 'transparent',
                  color: 'rgba(180,170,220,0.65)',
                  transition: 'all 0.2s',
                }}
              >
                ↩ 실제 시각으로
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => setShowDev(!showDev)}
          title="시간대 미리보기 토글"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: '1px solid rgba(167,163,216,0.3)',
            cursor: 'pointer',
            background: 'rgba(20,15,40,0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            transition: 'all 0.2s',
          }}
        >
          시간
        </button>
      </div>
    </>
  );
}
