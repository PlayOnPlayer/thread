import type { PuzzleDef, TileDef } from '../engine/types';
import { validateLetterAssignment } from './validateLetters';
import type { LayoutDef, PuzzleContent } from './types';

export function mergePuzzleContent(content: PuzzleContent, layout: LayoutDef): PuzzleDef {
  const letterErrors = validateLetterAssignment(layout, content.letters);
  if (letterErrors.length > 0) {
    throw new Error(`Invalid letters for puzzle "${content.id}":\n${letterErrors.join('\n')}`);
  }

  const tiles: TileDef[] = layout.slots.map((slot) => ({
    ...slot,
    letters: content.letters[slot.id]!.toUpperCase(),
  }));

  return {
    id: content.id,
    title: content.title,
    layoutId: content.layoutId,
    gridCols: layout.gridCols,
    gridRows: layout.gridRows,
    phrase: content.phrase,
    words: content.words,
    tiles,
    solutions: content.solutions.map((s) => ({
      word: s.word.toUpperCase(),
      path: s.path,
    })),
  };
}
