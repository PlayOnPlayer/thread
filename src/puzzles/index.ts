/* AUTO-GENERATED — 75 rotating layouts */
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
import day_26 from './content/day-26.json';
import day_27 from './content/day-27.json';
import day_28 from './content/day-28.json';
import day_29 from './content/day-29.json';
import day_30 from './content/day-30.json';
import day_31 from './content/day-31.json';
import day_32 from './content/day-32.json';
import day_33 from './content/day-33.json';
import day_34 from './content/day-34.json';
import day_35 from './content/day-35.json';
import day_36 from './content/day-36.json';
import day_37 from './content/day-37.json';
import day_38 from './content/day-38.json';
import day_39 from './content/day-39.json';
import day_40 from './content/day-40.json';
import day_41 from './content/day-41.json';
import day_42 from './content/day-42.json';
import day_43 from './content/day-43.json';
import day_44 from './content/day-44.json';
import day_45 from './content/day-45.json';
import day_46 from './content/day-46.json';
import day_47 from './content/day-47.json';
import day_48 from './content/day-48.json';
import day_49 from './content/day-49.json';
import day_50 from './content/day-50.json';
import day_51 from './content/day-51.json';
import day_52 from './content/day-52.json';
import day_53 from './content/day-53.json';
import day_54 from './content/day-54.json';
import day_55 from './content/day-55.json';
import day_56 from './content/day-56.json';
import day_57 from './content/day-57.json';
import day_58 from './content/day-58.json';
import day_59 from './content/day-59.json';
import day_60 from './content/day-60.json';
import day_61 from './content/day-61.json';
import day_62 from './content/day-62.json';
import day_63 from './content/day-63.json';
import day_64 from './content/day-64.json';
import day_65 from './content/day-65.json';
import day_66 from './content/day-66.json';
import day_67 from './content/day-67.json';
import day_68 from './content/day-68.json';
import day_69 from './content/day-69.json';
import day_70 from './content/day-70.json';
import day_71 from './content/day-71.json';
import day_72 from './content/day-72.json';
import day_73 from './content/day-73.json';
import day_74 from './content/day-74.json';
import day_75 from './content/day-75.json';

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
  day_26 as PuzzleContent,
  day_27 as PuzzleContent,
  day_28 as PuzzleContent,
  day_29 as PuzzleContent,
  day_30 as PuzzleContent,
  day_31 as PuzzleContent,
  day_32 as PuzzleContent,
  day_33 as PuzzleContent,
  day_34 as PuzzleContent,
  day_35 as PuzzleContent,
  day_36 as PuzzleContent,
  day_37 as PuzzleContent,
  day_38 as PuzzleContent,
  day_39 as PuzzleContent,
  day_40 as PuzzleContent,
  day_41 as PuzzleContent,
  day_42 as PuzzleContent,
  day_43 as PuzzleContent,
  day_44 as PuzzleContent,
  day_45 as PuzzleContent,
  day_46 as PuzzleContent,
  day_47 as PuzzleContent,
  day_48 as PuzzleContent,
  day_49 as PuzzleContent,
  day_50 as PuzzleContent,
  day_51 as PuzzleContent,
  day_52 as PuzzleContent,
  day_53 as PuzzleContent,
  day_54 as PuzzleContent,
  day_55 as PuzzleContent,
  day_56 as PuzzleContent,
  day_57 as PuzzleContent,
  day_58 as PuzzleContent,
  day_59 as PuzzleContent,
  day_60 as PuzzleContent,
  day_61 as PuzzleContent,
  day_62 as PuzzleContent,
  day_63 as PuzzleContent,
  day_64 as PuzzleContent,
  day_65 as PuzzleContent,
  day_66 as PuzzleContent,
  day_67 as PuzzleContent,
  day_68 as PuzzleContent,
  day_69 as PuzzleContent,
  day_70 as PuzzleContent,
  day_71 as PuzzleContent,
  day_72 as PuzzleContent,
  day_73 as PuzzleContent,
  day_74 as PuzzleContent,
  day_75 as PuzzleContent,
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
