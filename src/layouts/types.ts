export interface LayoutSlot {
  id: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export interface LayoutDef {
  id: string;
  name?: string;
  gridCols: number;
  gridRows: number;
  slots: LayoutSlot[];
}

/** Puzzle content layered on a shared layout (letters + solutions only). */
export interface PuzzleContent {
  id: string;
  title?: string;
  layoutId: string;
  phrase: string;
  words: string[];
  /** slot id → letters (1 char on 1×1/2×1/1×2; exactly 2 chars on 2×2) */
  letters: Record<string, string>;
  solutions: { word: string; path: string[] }[];
}
