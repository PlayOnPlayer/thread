/* AUTO-GENERATED — 25 rotating layouts */
import type { PuzzleDef } from '../engine/types';
import { validatePuzzle } from '../engine/puzzle';
import { buildPuzzleFromContent } from '../layouts/buildPuzzle';
import type { PuzzleContent } from '../layouts/types';
import day_01 from './content/day-01.json';
import day_02 from './content/day-02.json';
import day_03 from './content/day-03.json';
import day_04 from './content/day-04.json';
import day_05 from './content/day-05.json';
import day_06 from './content/day-06.json';
import day_07 from './content/day-07.json';
import day_08 from './content/day-08.json';
import day_09 from './content/day-09.json';
import day_10 from './content/day-10.json';
import day_11 from './content/day-11.json';
import day_12 from './content/day-12.json';
import day_13 from './content/day-13.json';
import day_14 from './content/day-14.json';
import day_15 from './content/day-15.json';
import day_16 from './content/day-16.json';
import day_17 from './content/day-17.json';
import day_18 from './content/day-18.json';
import day_19 from './content/day-19.json';
import day_20 from './content/day-20.json';
import day_21 from './content/day-21.json';
import day_22 from './content/day-22.json';
import day_23 from './content/day-23.json';
import day_24 from './content/day-24.json';
import day_25 from './content/day-25.json';

const contentFiles: PuzzleContent[] = [
  day_01 as PuzzleContent,
  day_02 as PuzzleContent,
  day_03 as PuzzleContent,
  day_04 as PuzzleContent,
  day_05 as PuzzleContent,
  day_06 as PuzzleContent,
  day_07 as PuzzleContent,
  day_08 as PuzzleContent,
  day_09 as PuzzleContent,
  day_10 as PuzzleContent,
  day_11 as PuzzleContent,
  day_12 as PuzzleContent,
  day_13 as PuzzleContent,
  day_14 as PuzzleContent,
  day_15 as PuzzleContent,
  day_16 as PuzzleContent,
  day_17 as PuzzleContent,
  day_18 as PuzzleContent,
  day_19 as PuzzleContent,
  day_20 as PuzzleContent,
  day_21 as PuzzleContent,
  day_22 as PuzzleContent,
  day_23 as PuzzleContent,
  day_24 as PuzzleContent,
  day_25 as PuzzleContent,
];

export const puzzles: PuzzleDef[] = contentFiles.map((c) => buildPuzzleFromContent(c));

for (const puzzle of puzzles) {
  const errors = validatePuzzle(puzzle);
  if (errors.length > 0) {
    throw new Error(`Invalid puzzle "${puzzle.id}":\n${errors.join('\n')}`);
  }
}

export function getPuzzleById(id: string): PuzzleDef | undefined {
  return puzzles.find((p) => p.id === id);
}

export function getDailyPuzzle(date = new Date()): PuzzleDef {
  const start = new Date('2026-01-01T12:00:00');
  const dayIndex = Math.floor(
    (date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
  );
  const index = ((dayIndex % puzzles.length) + puzzles.length) % puzzles.length;
  return puzzles[index]!;
}

export function getRandomPuzzle(): PuzzleDef {
  const index = Math.floor(Math.random() * puzzles.length);
  return puzzles[index]!;
}

export function listPuzzleIds(): string[] {
  return puzzles.map((p) => p.id);
}
