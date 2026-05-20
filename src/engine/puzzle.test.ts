import { describe, expect, it } from 'vitest';
import { canStep } from './seamGraph';
import { applyGuessResult, createInitialState, scoreGuess } from './guessScorer';
import { puzzles } from '../puzzles';
import { validatePuzzle } from './puzzle';
import type { PuzzleDef } from './types';

function layoutShapeSignature(puzzle: (typeof puzzles)[number]): string {
  return puzzle.tiles
    .map((tile) => `${tile.col},${tile.row},${tile.colSpan},${tile.rowSpan}`)
    .sort()
    .join('|');
}

describe('puzzle catalog', () => {
  it('has 75 puzzles on unique 5x5 layouts and unique phrases', () => {
    const layoutIds = new Set<string>();
    const layoutShapes = new Set<string>();
    const phrases = new Set<string>();
    for (const puzzle of puzzles) {
      expect(puzzle.gridCols).toBe(5);
      expect(puzzle.gridRows).toBe(5);
      layoutIds.add(puzzle.layoutId);
      layoutShapes.add(layoutShapeSignature(puzzle));
      phrases.add(puzzle.phrase);
      expect(validatePuzzle(puzzle)).toEqual([]);
      expect(puzzle.words.length).toBeGreaterThanOrEqual(3);
      expect(puzzle.words.length).toBeLessThanOrEqual(4);
      for (const word of puzzle.words) {
        expect(word.length).toBeLessThanOrEqual(5);
      }
    }
    expect(puzzles.length).toBe(75);
    expect(layoutIds.size).toBe(75);
    expect(layoutShapes.size).toBe(75);
    expect(phrases.size).toBe(75);
  });
});

describe('day-01 gameplay', () => {
  const puzzle = puzzles.find((p) => p.id === 'day-01')!;

  it('reveals each word in order until win', () => {
    expect(puzzle).toBeDefined();
    let state = createInitialState(puzzle);

    for (let i = 0; i < puzzle.words.length; i++) {
      const path = puzzle.solutions[i]!.path.map(
        (id) => puzzle.tiles.find((t) => t.id === id)!,
      );
      const result = scoreGuess(state, path);
      if (i < puzzle.words.length - 1) {
        expect(result.phraseFeedback).toBe('solved');
      } else {
        expect(result.isWin).toBe(true);
      }
      state = applyGuessResult(state, result);
    }
  });

  it('reveals words out of order', () => {
    expect(puzzle.words.length).toBeGreaterThanOrEqual(3);
    let state = createInitialState(puzzle);
    const lastIndex = puzzle.words.length - 1;
    const lastPath = puzzle.solutions[lastIndex]!.path.map(
      (id) => puzzle.tiles.find((t) => t.id === id)!,
    );

    const result = scoreGuess(state, lastPath);
    expect(result.phraseFeedback).toBe('solved');
    expect(result.revealedWordIndex).toBe(lastIndex);

    state = applyGuessResult(state, result);
    expect(state.revealedWords[lastIndex]).toBe(true);
    expect(state.currentWordIndex).toBe(0);
    expect(state.won).toBe(false);
  });
});

describe('guess feedback', () => {
  const duplicateWordPuzzle: PuzzleDef = {
    id: 'duplicate-word-test',
    layoutId: 'duplicate-layout-test',
    gridCols: 5,
    gridRows: 5,
    phrase: 'A A',
    words: ['A', 'A'],
    tiles: [
      { id: 'first-a', letters: 'A', col: 0, row: 0, colSpan: 1, rowSpan: 1 },
      { id: 'second-a', letters: 'A', col: 1, row: 0, colSpan: 1, rowSpan: 1 },
    ],
    solutions: [
      { word: 'A', path: ['first-a'] },
      { word: 'A', path: ['second-a'] },
    ],
  };

  const alternatePathPuzzle: PuzzleDef = {
    id: 'alternate-path-test',
    layoutId: 'alternate-layout-test',
    gridCols: 5,
    gridRows: 5,
    phrase: 'THE',
    words: ['THE'],
    tiles: [
      { id: 'preferred-t', letters: 'T', col: 0, row: 0, colSpan: 1, rowSpan: 1 },
      { id: 'alternate-t', letters: 'T', col: 0, row: 1, colSpan: 1, rowSpan: 1 },
      { id: 'he', letters: 'HE', col: 1, row: 1, colSpan: 2, rowSpan: 2 },
    ],
    solutions: [
      { word: 'THE', path: ['preferred-t', 'he'] },
    ],
  };

  it('keeps duplicate words usable until all matching words are solved', () => {
    let state = createInitialState(duplicateWordPuzzle);

    const firstResult = scoreGuess(state, [duplicateWordPuzzle.tiles[0]!]);
    expect(firstResult.revealedWordIndex).toBe(0);
    expect(firstResult.tileFeedback).toEqual(['perfect']);
    state = applyGuessResult(state, firstResult);

    const duplicateResult = scoreGuess(state, [duplicateWordPuzzle.tiles[0]!]);
    expect(duplicateResult.revealedWordIndex).toBe(1);
    expect(duplicateResult.tileFeedback).toEqual(['perfect']);
    state = applyGuessResult(state, duplicateResult);

    const usedUpResult = scoreGuess(state, [duplicateWordPuzzle.tiles[0]!]);
    expect(usedUpResult.revealedWordIndex).toBeNull();
    expect(usedUpResult.tileFeedback).toEqual(['dead']);
  });

  it('solves an unused word from any connected path that spells it', () => {
    const state = createInitialState(alternatePathPuzzle);
    const alternatePath = [alternatePathPuzzle.tiles[1]!, alternatePathPuzzle.tiles[2]!];

    const result = scoreGuess(state, alternatePath);
    expect(result.phraseFeedback).toBe('solved');
    expect(result.revealedWordIndex).toBe(0);
    expect(result.isWin).toBe(true);
  });

  it('marks possibly-correct tiles green on failed guesses', () => {
    const reorderPuzzle: PuzzleDef = {
      id: 'reorder-test',
      layoutId: 'reorder-layout-test',
      gridCols: 5,
      gridRows: 5,
      phrase: 'AB',
      words: ['AB'],
      tiles: [
        { id: 'tile-a', letters: 'A', col: 0, row: 0, colSpan: 1, rowSpan: 1 },
        { id: 'tile-b', letters: 'B', col: 1, row: 0, colSpan: 1, rowSpan: 1 },
      ],
      solutions: [{ word: 'AB', path: ['tile-a', 'tile-b'] }],
    };

    const state = createInitialState(reorderPuzzle);
    const wrongOrder = [reorderPuzzle.tiles[1]!, reorderPuzzle.tiles[0]!];
    const result = scoreGuess(state, wrongOrder);

    expect(result.revealedWordIndex).toBeNull();
    expect(result.tileFeedback).toEqual(['ghost', 'ghost']);
  });

  it('marks every tile perfect when a word is revealed', () => {
    const puzzle = puzzles.find((p) => p.id === 'day-01')!;
    const state = createInitialState(puzzle);
    const timePath = puzzle.solutions[0]!.path.map(
      (id) => puzzle.tiles.find((t) => t.id === id)!,
    );
    const result = scoreGuess(state, timePath);

    expect(result.revealedWordIndex).toBe(0);
    expect(result.tileFeedback.every((fb) => fb === 'perfect')).toBe(true);
  });

  it('ghosts in-solution tiles on partial wrong guesses', () => {
    const puzzle = puzzles.find((p) => p.id === 'day-01')!;
    const state = createInitialState(puzzle);
    const timePath = puzzle.solutions[0]!.path;
    const first = puzzle.tiles.find((t) => t.id === timePath[0])!;
    const third = puzzle.tiles.find((t) => t.id === timePath[2])!;
    const result = scoreGuess(state, [third, first]);

    expect(result.revealedWordIndex).toBeNull();
    expect(result.tileFeedback).toEqual(['ghost', 'ghost']);
  });
});

describe('layout-01 seam rules', () => {
  const puzzle = puzzles.find((p) => p.layoutId === 'layout-01')!;

  it('allows a valid equal-height seam step', () => {
    const tiles = puzzle.tiles;
    let found = false;
    for (const a of tiles) {
      for (const b of tiles) {
        if (a.id !== b.id && canStep(a, b, tiles)) {
          found = true;
          break;
        }
      }
      if (found) break;
    }
    expect(found).toBe(true);
  });
});
