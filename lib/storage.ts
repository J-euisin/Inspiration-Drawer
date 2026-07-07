import { Card, Thought } from './types';

/* ─── Cards ─── */

const CARDS_KEY = 'inspiration-drawer-cards';

export function getCards(): Card[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CARDS_KEY);
    const cards: Card[] = data ? JSON.parse(data) : [];
    // 하위호환: type 필드가 없는 기존 데이터는 'quote'로 처리
    return cards.map((c) => ({ ...c, type: c.type ?? 'quote' }));
  } catch {
    return [];
  }
}

export function saveCard(card: Card): void {
  const raw = getRawCards();
  raw.unshift(card);
  localStorage.setItem(CARDS_KEY, JSON.stringify(raw));
}

export function deleteCard(id: string): void {
  const raw = getRawCards().filter((c) => c.id !== id);
  localStorage.setItem(CARDS_KEY, JSON.stringify(raw));
}

/** 원본 데이터 그대로 읽기 (저장 시 기존 데이터 보존용) */
function getRawCards(): Card[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CARDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function formatDateEn(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}. ${year}`;
}

export function groupCardsByDate(cards: Card[]): { date: string; cards: Card[] }[] {
  const map: Record<string, Card[]> = {};
  const order: string[] = [];

  for (const card of cards) {
    const dateLabel = formatDateEn(card.createdAt);
    if (!map[dateLabel]) {
      map[dateLabel] = [];
      order.push(dateLabel);
    }
    map[dateLabel].push(card);
  }

  return order.map((date) => ({ date, cards: map[date] }));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ─── Thoughts ─── */

const THOUGHTS_KEY = 'inspiration-drawer-thoughts';

export function getThoughts(): Thought[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(THOUGHTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveThought(thought: Thought): void {
  const thoughts = getThoughts();
  thoughts.unshift(thought);
  localStorage.setItem(THOUGHTS_KEY, JSON.stringify(thoughts));
}

export function updateThought(id: string, text: string): void {
  const thoughts = getThoughts().map((t) =>
    t.id === id ? { ...t, text, updatedAt: new Date().toISOString() } : t
  );
  localStorage.setItem(THOUGHTS_KEY, JSON.stringify(thoughts));
}

export function deleteThought(id: string): void {
  const thoughts = getThoughts().filter((t) => t.id !== id);
  localStorage.setItem(THOUGHTS_KEY, JSON.stringify(thoughts));
}

export function markThoughtConverted(id: string): void {
  const thoughts = getThoughts().map((t) =>
    t.id === id ? { ...t, convertedToCard: true } : t
  );
  localStorage.setItem(THOUGHTS_KEY, JSON.stringify(thoughts));
}
