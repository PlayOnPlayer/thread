import { GRID_SIZE } from '../layouts/constants';
import { validateLetterAssignment } from '../layouts/validateLetters';
import type { PuzzleDef, TileDef } from './types';
import { canStep, isPathConnected } from './seamGraph';

function isAllowedTileSize(colSpan: number, rowSpan: number): boolean {
  return (
    (colSpan === 1 && rowSpan === 1) ||
    (colSpan === 2 && rowSpan === 1) ||
    (colSpan === 1 && rowSpan === 2) ||
    (colSpan === 2 && rowSpan === 2)
  );
}

/** Reject paths that only move right (letters read left-to-right on the board). */
function validatePathInterest(pathTiles: TileDef[], word: string): string[] {
  if (word.length < 3) return [];
  let onlyRight = true;
  for (let j = 1; j < pathTiles.length; j++) {
    const a = pathTiles[j - 1]!;
    const b = pathTiles[j]!;
    if (b.col !== a.col + a.colSpan || a.row !== b.row || a.rowSpan !== b.rowSpan) {
      onlyRight = false;
    }
  }
  if (onlyRight) {
    return [
      `path for "${word}" only moves right across the board — weave a less obvious route`,
    ];
  }
  return [];
}

export function validatePuzzle(puzzle: PuzzleDef): string[] {
  const errors: string[] = [];
  const tileIds = new Set(puzzle.tiles.map((t) => t.id));

  if (puzzle.gridCols !== GRID_SIZE || puzzle.gridRows !== GRID_SIZE) {
    errors.push(`puzzle grid must be ${GRID_SIZE}×${GRID_SIZE}`);
  }

  if (puzzle.words.join(' ') !== puzzle.phrase) {
    errors.push(`phrase "${puzzle.phrase}" does not match words [${puzzle.words.join(', ')}]`);
  }

  if (puzzle.solutions.length !== puzzle.words.length) {
    errors.push('solutions length must match words length');
  }

  const letters: Record<string, string> = {};
  for (const tile of puzzle.tiles) {
    letters[tile.id] = tile.letters;
    if (!isAllowedTileSize(tile.colSpan, tile.rowSpan)) {
      errors.push(`tile ${tile.id}: size ${tile.colSpan}×${tile.rowSpan} not allowed`);
    }
    const isDouble = tile.colSpan === 2 && tile.rowSpan === 2;
    if (isDouble && tile.letters.length !== 2) {
      errors.push(`tile ${tile.id}: 2×2 must have exactly 2 letters`);
    }
    if (!isDouble && tile.letters.length !== 1) {
      errors.push(`tile ${tile.id}: non-2×2 tiles must have exactly 1 letter`);
    }
  }

  const layoutLike = {
    id: puzzle.layoutId,
    gridCols: puzzle.gridCols,
    gridRows: puzzle.gridRows,
    slots: puzzle.tiles.map(({ id, col, row, colSpan, rowSpan }) => ({
      id,
      col,
      row,
      colSpan,
      rowSpan,
    })),
  };
  errors.push(...validateLetterAssignment(layoutLike, letters));

  for (let i = 0; i < puzzle.solutions.length; i++) {
    const sol = puzzle.solutions[i]!;
    const word = puzzle.words[i]!;
    if (sol.word.toUpperCase() !== word.toUpperCase()) {
      errors.push(`solution[${i}] word "${sol.word}" !== "${word}"`);
    }
    for (const id of sol.path) {
      if (!tileIds.has(id)) errors.push(`solution[${i}]: unknown tile id ${id}`);
    }
    const pathTiles = sol.path.map((id) => puzzle.tiles.find((t) => t.id === id)!);
    const spelled = pathTiles.map((t) => t.letters).join('');
    if (spelled.toUpperCase() !== word.toUpperCase()) {
      errors.push(`solution[${i}]: path spells "${spelled}" not "${word}"`);
    }
    if (!isPathConnected(pathTiles, puzzle.tiles)) {
      errors.push(`solution[${i}]: path is not connected by valid seams`);
    }
    for (let j = 1; j < pathTiles.length; j++) {
      if (!canStep(pathTiles[j - 1]!, pathTiles[j]!, puzzle.tiles)) {
        errors.push(`solution[${i}]: invalid seam at step ${j}`);
      }
    }
    errors.push(...validatePathInterest(pathTiles, word));
  }

  return errors;
}

export function getTileById(puzzle: PuzzleDef, id: string): TileDef | undefined {
  return puzzle.tiles.find((t) => t.id === id);
}
