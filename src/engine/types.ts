export type Direction = 'up' | 'down' | 'left' | 'right';

export interface TileDef {
  id: string;
  letters: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export interface WordSolution {
  word: string;
  path: string[];
}

export interface PuzzleDef {
  id: string;
  title?: string;
  /** Shared geometry template (e.g. classic 5×5 Figma tiling). */
  layoutId: string;
  gridCols: number;
  gridRows: number;
  phrase: string;
  words: string[];
  tiles: TileDef[];
  solutions: WordSolution[];
}

export type TileFeedback = 'perfect' | 'ghost' | 'dead';
export type SeamFeedback = 'perfect' | 'fractured';
export type PhraseFeedback = 'solved' | 'wrongChapter' | 'notInPhrase' | null;

export interface GuessResult {
  letters: string;
  tileFeedback: TileFeedback[];
  seamFeedback: SeamFeedback[];
  phraseFeedback: PhraseFeedback;
  revealedWordIndex: number | null;
  isWin: boolean;
}

export interface GameState {
  puzzle: PuzzleDef;
  currentWordIndex: number;
  revealedWords: boolean[];
  guesses: number;
  lastResult: GuessResult | null;
  won: boolean;
}
