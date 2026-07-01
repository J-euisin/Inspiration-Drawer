'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

interface GuardContextType {
  /** 현재 폼에 변경사항이 있는지 */
  isDirty: boolean;
  /** create 페이지에서 dirty 상태 등록/해제 */
  setDirty: (v: boolean) => void;
  /**
   * 네비게이션 시도. dirty 상태이면 확인 모달을 띄우고,
   * 사용자가 '나가기'를 선택한 경우에만 navigate() 실행.
   * dirty 상태가 아니면 바로 navigate() 실행.
   */
  requestNavigation: (navigate: () => void) => void;
}

const GuardContext = createContext<GuardContextType>({
  isDirty: false,
  setDirty: () => {},
  requestNavigation: (nav) => nav(),
});

export function useNavigationGuard() {
  return useContext(GuardContext);
}

interface PendingNav {
  go: () => void;
}

/** 앱 전체를 감싸는 Provider. layout.tsx에서 사용. */
export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const [pending, setPending] = useState<PendingNav | null>(null);

  const setDirty = useCallback((v: boolean) => setIsDirty(v), []);

  const requestNavigation = useCallback(
    (navigate: () => void) => {
      if (!isDirty) {
        navigate();
        return;
      }
      setPending({ go: navigate });
    },
    [isDirty],
  );

  function handleConfirm() {
    if (pending) pending.go();
    setPending(null);
    setIsDirty(false);
  }

  function handleCancel() {
    setPending(null);
  }

  return (
    <GuardContext.Provider value={{ isDirty, setDirty, requestNavigation }}>
      {children}
      {/* 확인 모달 — portal로 body에 직접 렌더 */}
      {pending && typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={handleCancel}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(28,30,48,0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              animation: 'fadeIn 0.2s ease both',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--color-surface)',
                borderRadius: '1.5rem',
                padding: '2rem 1.75rem 1.5rem',
                width: 'min(92vw, 380px)',
                boxShadow: '0 24px 80px rgba(28,30,48,0.3)',
                animation: 'scaleIn 0.22s ease both',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* 아이콘 + 제목 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✏️</div>
                <h2
                  style={{
                    fontFamily: "'Gowun Batang', serif",
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '0.4rem',
                  }}
                >
                  작성 중인 내용이 있어요
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.65,
                  }}
                >
                  저장하지 않고 나가면 내용이 사라져요.
                  <br />
                  그래도 나갈까요?
                </p>
              </div>

              {/* 버튼 */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  className="btn-ghost"
                  onClick={handleCancel}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  계속 작성하기
                </button>
                <button
                  onClick={handleConfirm}
                  style={{
                    flex: 1,
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-btn)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    background: '#c0392b',
                    color: '#fff',
                    transition: 'background 0.2s',
                  }}
                >
                  나가기
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </GuardContext.Provider>
  );
}
