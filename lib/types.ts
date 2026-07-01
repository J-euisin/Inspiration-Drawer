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
  /**
   * 'quote' = 책·영화·명언 등에서 수집한 문장 (출처/저자 있음)
   * 'thought' = 떠오르는 단상 (출처/저자 없음)
   * undefined = 기존 데이터 → 'quote' 로 처리
   */
  type?: 'quote' | 'thought';
}

export interface DailyQuote {
  id: string;
  text: string;
  source: string;
  author?: string;
  genre: '소설' | '시' | '영화' | '에세이' | '명언' | '칼럼';
}

/** 단상: 짧은 일기처럼 떠오르는 생각을 가볍게 적는 메모 */
export interface Thought {
  id: string;
  text: string;
  createdAt: string;  // ISO string
  updatedAt?: string; // 수정 시 갱신
  convertedToCard?: boolean; // 카드로 만든 경우 true
}
