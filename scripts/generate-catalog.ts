/**
 * Generates unique 5×5 tilings and puzzle content (short words, readable decoys).
 * Run: npx tsx scripts/generate-catalog.ts
 */
import { writeFileSync, mkdirSync, unlinkSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { canStep } from '../src/engine/seamGraph';
import type { TileDef } from '../src/engine/types';
import { GRID_SIZE } from '../src/layouts/constants';
import { isPlacementAllowed } from '../src/layouts/tileGrouping';
import { validateLayout } from '../src/layouts/validateLayout';
import type { LayoutDef, LayoutSlot } from '../src/layouts/types';
import { mergePuzzleContent } from '../src/layouts/mergePuzzle';
import { validatePuzzle } from '../src/engine/puzzle';
import type { PuzzleContent } from '../src/layouts/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LAYOUTS_DIR = join(ROOT, 'src/layouts/generated');
const CONTENT_DIR = join(ROOT, 'src/puzzles/content');
const CATALOG_SIZE = 25;
const LAYOUT_CANDIDATE_POOL_SIZE = 1200;

const PIECES = [
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 2, rowSpan: 1 },
  { colSpan: 1, rowSpan: 2 },
  { colSpan: 1, rowSpan: 1 },
] as const;

/** Every word ≤ 5 letters. Puzzles use 3 words minimum; ~⅓ use 4. */
const PHRASES_3: string[][] = [
  ['TIME', 'WILL', 'TELL'],
  ['LET', 'IT', 'GO'],
  ['ON', 'MY', 'WAY'],
  ['ONE', 'BY', 'ONE'],
  ['DAY', 'BY', 'DAY'],
  ['LIVE', 'AND', 'LEARN'],
  ['COME', 'WHAT', 'MAY'],
  ['KEEP', 'IT', 'REAL'],
  ['FIND', 'A', 'WAY'],
  ['DO', 'YOUR', 'BEST'],
  ['HIT', 'THE', 'ROAD'],
  ['SEIZE', 'THE', 'DAY'],
  ['SAFE', 'AND', 'SOUND'],
  ['FREE', 'AND', 'CLEAR'],
  ['DOWN', 'TO', 'EARTH'],
  ['RISE', 'AND', 'SHINE'],
  ['GO', 'WITH', 'FLOW'],
  ['TAKE', 'A', 'STAND'],
  ['MAKE', 'A', 'PLAN'],
  ['LOST', 'IN', 'SPACE'],
  ['PLAY', 'BY', 'EAR'],
  ['EDGE', 'OF', 'GLORY'],
  ['SIGN', 'OF', 'LIFE'],
  ['WAVE', 'OF', 'HOPE'],
  ['STAY', 'IN', 'FORM'],
  ['RUN', 'THE', 'SHOW'],
  ['READ', 'THE', 'ROOM'],
  ['PASS', 'THE', 'TEST'],
  ['FACE', 'THE', 'MUSIC'],
  ['BREAK', 'THE', 'ICE'],
];

const PHRASES_4: string[][] = [
  ['ONE', 'STEP', 'AT', 'TIME'],
  ['LIVE', 'FOR', 'THE', 'DAY'],
  ['DO', 'WHAT', 'YOU', 'CAN'],
  ['GO', 'WITH', 'THE', 'FLOW'],
  ['TIME', 'TO', 'MOVE', 'ON'],
  ['LESS', 'TALK', 'MORE', 'DO'],
  ['WORD', 'TO', 'THE', 'WISE'],
  ['STAY', 'ON', 'THE', 'PATH'],
  ['MAKE', 'THE', 'BEST', 'OF'],
  ['LOST', 'IN', 'THE', 'FOG'],
  ['KEEP', 'YOUR', 'HEAD', 'UP'],
  ['PLAY', 'BY', 'THE', 'RULES'],
  ['RUN', 'FOR', 'YOUR', 'LIFE'],
  ['SIGN', 'OF', 'THE', 'TIMES'],
  ['FIND', 'THE', 'RIGHT', 'WAY'],
  ['TAKE', 'THE', 'HIGH', 'ROAD'],
  ['MIND', 'YOUR', 'OWN', 'PACE'],
  ['WORK', 'WITH', 'YOUR', 'TEAM'],
  ['GIVE', 'IT', 'YOUR', 'ALL'],
  ['STAY', 'IN', 'THE', 'GAME'],
];

/** Prefer 4 words on half the catalog; fall back to 3 if the layout cannot fit. */
function phrasesToTry(puzzleIndex: number): string[][] {
  const preferFour = puzzleIndex % 2 === 1;
  const primary = preferFour ? PHRASES_4 : PHRASES_3;
  const secondary = preferFour ? PHRASES_3 : PHRASES_4;
  const ordered: string[][] = [];
  const offset = puzzleIndex * 7;
  for (let a = 0; a < primary.length; a++) {
    ordered.push(primary[(offset + a) % primary.length]!);
  }
  for (let a = 0; a < secondary.length; a++) {
    ordered.push(secondary[(offset + a) % secondary.length]!);
  }
  return ordered;
}

const DECOY_SINGLES = 'BCDFGHJKLMNPQRSTVWXYZ';
const DECOY_PAIRS = ['TH', 'ST', 'ND', 'CK', 'PL', 'GR', 'BR', 'FL', 'TR', 'SK', 'SP', 'CH', 'SH', 'QU', 'PR', 'CL', 'BL', 'DR', 'FR', 'GL'];

function layoutSignature(slots: LayoutSlot[]): string {
  return slots
    .map((s) => `${s.col},${s.row},${s.colSpan},${s.rowSpan}`)
    .sort()
    .join('|');
}

function visualSignature(slots: LayoutSlot[]): string {
  const cellTypes: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill('?'),
  );
  const cellSlots: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill('?'),
  );

  for (const slot of slots) {
    const type = `${slot.colSpan}x${slot.rowSpan}`;
    for (let row = slot.row; row < slot.row + slot.rowSpan; row++) {
      for (let col = slot.col; col < slot.col + slot.colSpan; col++) {
        cellTypes[row]![col] = type;
        cellSlots[row]![col] = slot.id;
      }
    }
  }

  const parts: string[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      parts.push(cellTypes[row]![col]!);
      if (col < GRID_SIZE - 1) {
        parts.push(cellSlots[row]![col] === cellSlots[row]![col + 1] ? '=' : '|');
      }
      if (row < GRID_SIZE - 1) {
        parts.push(cellSlots[row]![col] === cellSlots[row + 1]![col] ? '=' : '-');
      }
    }
  }
  return parts.join('');
}

function signatureDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let distance = Math.abs(a.length - b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) distance++;
  }
  return distance;
}

function selectDiverseTilings(candidates: LayoutSlot[][], count: number): LayoutSlot[][] {
  if (candidates.length <= count) return candidates;

  const signatures = candidates.map(visualSignature);
  const selectedIndexes = [0];
  const remaining = new Set(candidates.map((_, index) => index).slice(1));

  while (selectedIndexes.length < count && remaining.size > 0) {
    let bestIndex = -1;
    let bestScore = -1;

    for (const candidateIndex of remaining) {
      const score = selectedIndexes.reduce((minDistance, selectedIndex) => {
        const distance = signatureDistance(signatures[candidateIndex]!, signatures[selectedIndex]!);
        return Math.min(minDistance, distance);
      }, Number.POSITIVE_INFINITY);

      if (score > bestScore) {
        bestScore = score;
        bestIndex = candidateIndex;
      }
    }

    selectedIndexes.push(bestIndex);
    remaining.delete(bestIndex);
  }

  return selectedIndexes.map((index) => candidates[index]!);
}

function generateTilings(count: number): LayoutSlot[][] {
  const seen = new Set<string>();
  const results: LayoutSlot[][] = [];
  const grid: boolean[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false),
  );

  function place(slot: LayoutSlot): void {
    for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
      for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
        grid[r]![c] = true;
      }
    }
  }

  function unplace(slot: LayoutSlot): void {
    for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
      for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
        grid[r]![c] = false;
      }
    }
  }

  function firstEmpty(): [number, number] | null {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!grid[r]![c]) return [c, r];
      }
    }
    return null;
  }

  function backtrack(slots: LayoutSlot[], slotIndex: number, pieces = PIECES): void {
    if (results.length >= count) return;

    const empty = firstEmpty();
    if (!empty) {
      const sig = layoutSignature(slots);
      if (!seen.has(sig)) {
        seen.add(sig);
        results.push(slots.map((s) => ({ ...s })));
      }
      return;
    }

    const [col, row] = empty;

    for (const piece of pieces) {
      if (col + piece.colSpan > GRID_SIZE || row + piece.rowSpan > GRID_SIZE) continue;

      let fits = true;
      for (let r = row; r < row + piece.rowSpan && fits; r++) {
        for (let c = col; c < col + piece.colSpan; c++) {
          if (grid[r]![c]) fits = false;
        }
      }
      if (!fits) continue;

      const slot: LayoutSlot = {
        id: `s${slotIndex}`,
        col,
        row,
        colSpan: piece.colSpan,
        rowSpan: piece.rowSpan,
      };
      if (!isPlacementAllowed(slot, slots)) continue;
      place(slot);
      backtrack([...slots, slot], slotIndex + 1, pieces);
      unplace(slot);
    }
  }

  const pieceOrders = [
    PIECES,
    [PIECES[0], PIECES[2], PIECES[1], PIECES[3]],
    [PIECES[3], PIECES[1], PIECES[2], PIECES[0]],
    [PIECES[1], PIECES[3], PIECES[0], PIECES[2]],
  ];

  for (const order of pieceOrders) {
    if (results.length >= count) break;
    grid.forEach((row) => row.fill(false));
    backtrack([], 0, order);
  }

  let attempts = 0;
  while (results.length < count && attempts < 50000) {
    attempts++;
    grid.forEach((row) => row.fill(false));
    backtrack([], 0, PIECES);
  }

  return results;
}

function slotsToTiles(slots: LayoutSlot[]): TileDef[] {
  return slots.map((s) => ({ ...s, letters: '?' }));
}

function letterCapacity(slot: LayoutSlot): number {
  return slot.colSpan === 2 && slot.rowSpan === 2 ? 2 : 1;
}

function canSpellOnPath(word: string, pathSlots: LayoutSlot[]): boolean {
  let wi = 0;
  for (const slot of pathSlots) {
    const cap = letterCapacity(slot);
    if (wi + cap > word.length) return false;
    wi += cap;
  }
  return wi === word.length;
}

function assignWordLetters(word: string, pathSlots: LayoutSlot[]): Record<string, string> {
  const map: Record<string, string> = {};
  let wi = 0;
  for (const slot of pathSlots) {
    const cap = letterCapacity(slot);
    map[slot.id] = word.slice(wi, wi + cap).toUpperCase();
    wi += cap;
  }
  return map;
}

function pathOnlyRight(pathSlots: LayoutSlot[]): boolean {
  for (let i = 1; i < pathSlots.length; i++) {
    const a = pathSlots[i - 1]!;
    const b = pathSlots[i]!;
    if (b.col !== a.col + a.colSpan || a.row !== b.row || a.rowSpan !== b.rowSpan) {
      return false;
    }
  }
  return true;
}

function findPathsForWordSlots(slots: LayoutSlot[], word: string): string[][] {
  const tiles = slotsToTiles(slots);
  const targetLen = word.length;
  const results: string[][] = [];
  const maxPaths = 400;

  function search(path: TileDef[]) {
    if (results.length >= maxPaths) return;

    const pathSlots = path.map((t) => slots.find((s) => s.id === t.id)!);
    const spelledLen = pathSlots.reduce((n, s) => n + letterCapacity(s), 0);

    if (spelledLen === targetLen) {
      if (canSpellOnPath(word, pathSlots)) {
        results.push(path.map((t) => t.id));
      }
      return;
    }
    if (spelledLen > targetLen) return;

    const visited = new Set(path.map((t) => t.id));
    const last = path[path.length - 1]!;
    for (const next of tiles) {
      if (visited.has(next.id)) continue;
      if (!canStep(last, next, tiles)) continue;
      search([...path, next]);
    }
  }

  for (const start of tiles) {
    search([start]);
  }

  return results;
}

function pickPath(
  slots: LayoutSlot[],
  word: string,
  reservedTiles: Set<string>,
): string[] | null {
  const candidates = findPathsForWordSlots(slots, word).filter((path) => {
    if (path.some((id) => reservedTiles.has(id))) return false;
    const pathSlots = path.map((id) => slots.find((s) => s.id === id)!);
    if (word.length >= 3 && pathOnlyRight(pathSlots)) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  const scored = candidates.map((path) => ({
    path,
    score: path.length + Math.random() * 5,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0]!.path;
}

function fillDecoys(
  slots: LayoutSlot[],
  assigned: Record<string, string>,
  seed: number,
): Record<string, string> {
  const letters = { ...assigned };
  let di = seed;

  for (const slot of slots) {
    if (letters[slot.id]) continue;
    const cap = letterCapacity(slot);
    if (cap === 2) {
      letters[slot.id] = DECOY_PAIRS[di % DECOY_PAIRS.length]!;
      di++;
    } else {
      letters[slot.id] = DECOY_SINGLES[di % DECOY_SINGLES.length]!;
      di++;
    }
  }
  return letters;
}

function buildContent(layout: LayoutDef, words: string[]): PuzzleContent | null {
  if (words.length < 3 || words.length > 4) return null;
  if (words.some((w) => w.length > 5)) return null;

  const phrase = words.join(' ');
  const solutions: PuzzleContent['solutions'] = [];
  const letterMap: Record<string, string> = {};
  const reservedTiles = new Set<string>();

  for (const word of words) {
    const path = pickPath(layout.slots, word, reservedTiles);
    if (!path) return null;
    const pathSlots = path.map((id) => layout.slots.find((s) => s.id === id)!);
    Object.assign(letterMap, assignWordLetters(word, pathSlots));
    solutions.push({ word, path });
    for (const id of path) reservedTiles.add(id);
  }

  const fullLetters = fillDecoys(layout.slots, letterMap, words.join('').length);

  return {
    id: layout.id.replace('layout-', 'day-'),
    title: phrase,
    layoutId: layout.id,
    phrase,
    words,
    letters: fullLetters,
    solutions,
  };
}

function main() {
  mkdirSync(LAYOUTS_DIR, { recursive: true });
  mkdirSync(CONTENT_DIR, { recursive: true });

  const tilingCandidates = generateTilings(LAYOUT_CANDIDATE_POOL_SIZE);
  if (tilingCandidates.length < CATALOG_SIZE) {
    throw new Error(
      `Only generated ${tilingCandidates.length} layouts, need ${CATALOG_SIZE} (try npm run generate again)`,
    );
  }
  const tilings = selectDiverseTilings(tilingCandidates, CATALOG_SIZE);

  const layouts: LayoutDef[] = [];
  const contents: PuzzleContent[] = [];
  const usedPhrases = new Set<string>();

  for (let i = 0; i < CATALOG_SIZE; i++) {
    const id = `layout-${String(i + 1).padStart(2, '0')}`;
    const slots = tilings[i]!.map((s, idx) => ({ ...s, id: `s${idx}` }));
    const layout: LayoutDef = {
      id,
      name: `Seam grid ${i + 1}`,
      gridCols: GRID_SIZE,
      gridRows: GRID_SIZE,
      slots,
    };

    const layoutErrors = validateLayout(layout);
    if (layoutErrors.length) {
      throw new Error(`Layout ${id}: ${layoutErrors.join(', ')}`);
    }

    let content: PuzzleContent | null = null;
    for (const words of phrasesToTry(i)) {
      const phrase = words.join(' ');
      if (usedPhrases.has(phrase)) continue;
      content = buildContent(layout, words);
      if (content) {
        usedPhrases.add(phrase);
        break;
      }
    }
    if (!content) {
      throw new Error(`Failed to build content for ${id}`);
    }

    const puzzleErrors = validatePuzzle(mergePuzzleContent(content, layout));
    if (puzzleErrors.length) {
      throw new Error(`Puzzle ${content.id}: ${puzzleErrors.join('; ')}`);
    }

    layouts.push(layout);
    contents.push(content);
  }

  for (const layout of layouts) {
    writeFileSync(
      join(LAYOUTS_DIR, `${layout.id}.json`),
      JSON.stringify(layout, null, 2),
    );
  }

  for (const content of contents) {
    writeFileSync(
      join(CONTENT_DIR, `${content.id}.json`),
      JSON.stringify(content, null, 2),
    );
  }

  const layoutImports = layouts
    .map((l) => `import ${l.id.replace(/-/g, '_')} from './generated/${l.id}.json';`)
    .join('\n');
  const layoutArray = layouts.map((l) => `  ${l.id.replace(/-/g, '_')} as LayoutDef,`).join('\n');

  writeFileSync(
    join(ROOT, 'src/layouts/registry.ts'),
    `/* AUTO-GENERATED — run: npx tsx scripts/generate-catalog.ts */
import type { LayoutDef } from './types';
import { validateLayout } from './validateLayout';
${layoutImports}

export const layouts: LayoutDef[] = [
${layoutArray}
];

for (const layout of layouts) {
  const errors = validateLayout(layout);
  if (errors.length > 0) {
    throw new Error(\`Invalid layout "\${layout.id}":\\n\${errors.join('\\n')}\`);
  }
}

export function getLayout(id: string): LayoutDef | undefined {
  return layouts.find((l) => l.id === id);
}

export function listLayoutIds(): string[] {
  return layouts.map((l) => l.id);
}
`,
  );

  const contentImports = contents
    .map((c) => {
      const v = c.id.replace(/-/g, '_');
      return `import ${v} from './content/${c.id}.json';`;
    })
    .join('\n');
  const contentArray = contents.map((c) => `  ${c.id.replace(/-/g, '_')} as PuzzleContent,`).join('\n');

  writeFileSync(
    join(ROOT, 'src/puzzles/index.ts'),
    `/* AUTO-GENERATED — ${CATALOG_SIZE} rotating layouts */
import type { PuzzleDef } from '../engine/types';
import { validatePuzzle } from '../engine/puzzle';
import { buildPuzzleFromContent } from '../layouts/buildPuzzle';
import type { PuzzleContent } from '../layouts/types';
${contentImports}

const contentFiles: PuzzleContent[] = [
${contentArray}
];

export const puzzles: PuzzleDef[] = contentFiles.map((c) => buildPuzzleFromContent(c));

for (const puzzle of puzzles) {
  const errors = validatePuzzle(puzzle);
  if (errors.length > 0) {
    throw new Error(\`Invalid puzzle "\${puzzle.id}":\\n\${errors.join('\\n')}\`);
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

export function listPuzzleIds(): string[] {
  return puzzles.map((p) => p.id);
}
`,
  );

  for (const file of readdirSync(CONTENT_DIR)) {
    if (file.endsWith('.json') && !file.startsWith('day-')) {
      unlinkSync(join(CONTENT_DIR, file));
    }
  }

  console.log(`Generated ${layouts.length} layouts and ${contents.length} puzzles.`);
}

main();
