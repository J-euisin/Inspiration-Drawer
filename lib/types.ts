export type FontStyle = 'gothic' | 'myeongjo' | 'cursive' | 'handwriting';

export const FONT_LABELS: Record<FontStyle, string> = {
  gothic: '고딕',
  myeongjo: '명조',
  cursive: '필기체',
  handwriting: '손글씨',
};

export const FONT_CLASSNAMES: Record<FontStyle, string> = {
  gothic: 'font-gothic',
  myeongjo: 'font-myeongjo',
  cursive: 'font-cursive-card',
  handwriting: 'font-handwriting',
};

export interface Card {
  id: string;
  text: string;
  fontStyle: FontStyle;
  backgroundColor: string;
  backgroundImage: string | null;
  source?: string;
  author?: string;
  createdAt: string; // ISO string
}

export interface DailyQuote {
  id: string;
  text: string;
  source: string;
  author?: string;
  genre: '소설' | '시' | '영화' | '에세이' | '명언' | '칼럼';
}
