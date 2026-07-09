'use client';

import { useEffect, useState } from 'react';

export type SortOrder = 'desc' | 'asc';
export type ViewType = '1' | '2' | '3';

interface ArchiveViewOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortOrder: SortOrder;
  viewType: ViewType;
  onSortOrderChange: (val: SortOrder) => void;
  onViewTypeChange: (val: ViewType) => void;
}

export default function ArchiveViewOptionsModal({
  isOpen,
  onClose,
  sortOrder,
  viewType,
  onSortOrderChange,
  onViewTypeChange,
}: ArchiveViewOptionsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Dimmed Background */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: 'var(--color-surface)',
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          padding: '1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom))',
          zIndex: 1000,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>보기옵션</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* 정렬 섹션 */}
        <div style={{ marginBottom: '0.75rem', background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '1.25rem', padding: '1rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.8rem' }}>정렬</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['desc', 'asc'] as const).map((val) => {
              const isActive = sortOrder === val;
              return (
                <button
                  key={val}
                  onClick={() => onSortOrderChange(val)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0',
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#675ECF' : 'var(--color-text-muted)',
                    background: isActive ? 'rgba(103, 94, 207, 0.08)' : '#fff',
                    border: isActive ? '1px solid transparent' : '1px solid rgba(0,0,0,0.08)',
                    transition: 'all 0.2s',
                  }}
                >
                  {val === 'desc' ? '최신순' : '오래된 순'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 뷰타입 섹션 */}
        <div style={{ marginBottom: '1rem', background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '1.25rem', padding: '1rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.8rem' }}>뷰타입</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['1', '2', '3'] as const).map((val) => {
              const isActive = viewType === val;
              return (
                <button
                  key={val}
                  onClick={() => onViewTypeChange(val)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0',
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#675ECF' : 'var(--color-text-muted)',
                    background: isActive ? 'rgba(103, 94, 207, 0.08)' : '#fff',
                    border: isActive ? '1px solid transparent' : '1px solid rgba(0,0,0,0.08)',
                    transition: 'all 0.2s',
                  }}
                >
                  {val === '1' ? '1장씩' : val === '2' ? '2장씩' : '3장씩'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 완료 버튼 */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '1rem',
            background: '#675ECF', // Use primary color instead of black
            color: '#fff',
            borderRadius: '999px',
            fontSize: '1rem',
            fontWeight: 600,
            border: 'none',
          }}
        >
          완료
        </button>
      </div>
    </>
  );
}
