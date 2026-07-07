'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Card } from '@/lib/types';
import { deleteCard, formatDateEn } from '@/lib/storage';
import CardPreview from './CardPreview';

interface CardItemProps {
  card: Card;
  onDeleted: (id: string) => void;
}

export default function CardItem({ card, onDeleted }: CardItemProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portal은 클라이언트에서만 사용 가능
  useEffect(() => {
    setMounted(true);
  }, []);

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [expanded]);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(true);
    setTimeout(() => {
      deleteCard(card.id);
      onDeleted(card.id);
    }, 300);
  }

  const modal = expanded && mounted ? createPortal(
    /* ── 전체 화면 오버레이 ── */
    <div
      onClick={() => { setExpanded(false); setDeleteConfirm(false); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(28, 30, 48, 0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.22s ease both',
      }}
    >
      {/* ── 모달 컨테이너 ── */}
      <div
        className="animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(92vw, 400px)',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--color-bg)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          boxShadow: '0 24px 80px rgba(28,30,48,0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* 카드 전체 미리보기 */}
        <CardPreview
          text={card.text}
          fontStyle={card.fontStyle}
          backgroundColor={card.backgroundColor}
          backgroundImage={card.backgroundImage}
          source={card.source}
          author={card.author}
          size="full"
          date={formatDateEn(card.createdAt)}
        />

        {/* 액션 버튼 */}
        {deleteConfirm ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem' }}>
              이 카드를 삭제할까요?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                className="btn-ghost"
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(false); }}
                style={{ flex: 1 }}
              >
                취소
              </button>
              <button
                className="btn-primary"
                onClick={handleDelete}
                style={{ flex: 1 }}
              >
                삭제
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '0.6rem',
              justifyContent: 'flex-end',
            }}
          >
            <button
              className="btn-ghost"
              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(true); }}
              style={{
                color: 'var(--color-primary)',
                borderColor: 'var(--color-border)',
                fontSize: '0.85rem',
              }}
            >
              삭제
            </button>
            <button
              className="btn-primary"
              onClick={(e) => { e.stopPropagation(); router.push(`/create?editId=${card.id}`); }}
              style={{ fontSize: '0.85rem' }}
            >
              수정
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* 그리드 썸네일 카드 */}
      <div
        onClick={() => setExpanded(true)}
        style={{
          cursor: 'pointer',
          opacity: deleting ? 0 : 1,
          transform: deleting ? 'scale(0.92)' : 'scale(1)',
          transition: 'opacity 0.3s, transform 0.3s',
        }}
      >
        <CardPreview
          text={card.text}
          fontStyle={card.fontStyle}
          backgroundColor={card.backgroundColor}
          backgroundImage={card.backgroundImage}
          source={card.source}
          author={card.author}
          size="compact"
        />
      </div>

      {/* Portal로 body에 직접 렌더링 */}
      {modal}
    </>
  );
}
