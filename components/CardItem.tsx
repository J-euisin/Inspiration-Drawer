'use client';

import { useState } from 'react';
import { Card } from '@/lib/types';
import { deleteCard } from '@/lib/storage';
import CardPreview from './CardPreview';

interface CardItemProps {
  card: Card;
  onDeleted: (id: string) => void;
}

export default function CardItem({ card, onDeleted }: CardItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(true);
    setTimeout(() => {
      deleteCard(card.id);
      onDeleted(card.id);
    }, 300);
  }

  return (
    <>
      {/* Grid card */}
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

      {/* Modal */}
      {expanded && (
        <div
          className="modal-backdrop"
          onClick={() => setExpanded(false)}
        >
          <div
            className="animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius-modal)',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 16px 60px rgba(44,49,74,0.18)',
            }}
          >
            <CardPreview
              text={card.text}
              fontStyle={card.fontStyle}
              backgroundColor={card.backgroundColor}
              backgroundImage={card.backgroundImage}
              source={card.source}
              author={card.author}
              size="full"
            />

            {/* Meta */}
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {new Date(card.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Actions */}
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '0.6rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                className="btn-ghost"
                onClick={handleDelete}
                style={{
                  color: '#c0392b',
                  borderColor: '#e8d5d3',
                  fontSize: '0.82rem',
                }}
              >
                🗑 삭제
              </button>
              <button
                className="btn-primary"
                onClick={() => setExpanded(false)}
                style={{ fontSize: '0.85rem' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
