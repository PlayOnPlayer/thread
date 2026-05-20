import type { PuzzleDef } from '../engine/types';
import { getLayout } from './registry';
import type { PuzzleContent } from './types';
import { mergePuzzleContent } from './mergePuzzle';

export function buildPuzzleFromContent(content: PuzzleContent): PuzzleDef {
  const layout = getLayout(content.layoutId);
  if (!layout) {
    throw new Error(`Unknown layout "${content.layoutId}"`);
  }
  return mergePuzzleContent(content, layout);
}
