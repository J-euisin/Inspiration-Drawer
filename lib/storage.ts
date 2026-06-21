import { Card } from './types';

const STORAGE_KEY = 'inspiration-drawer-cards';

export function getCards(): Card[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCard(card: Card): void {
  const cards = getCards();
  cards.unshift(card);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function deleteCard(id: string): void {
  const cards = getCards().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function groupCardsByDate(cards: Card[]): { date: string; cards: Card[] }[] {
  const map: Record<string, Card[]> = {};
  const order: string[] = [];

  for (const card of cards) {
    const dateLabel = new Date(card.createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
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
