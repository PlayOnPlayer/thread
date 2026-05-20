import type { Direction, TileDef } from './types';

function rowOverlapLength(a: TileDef, b: TileDef): number {
  const top = Math.max(a.row, b.row);
  const bottom = Math.min(a.row + a.rowSpan, b.row + b.rowSpan);
  return Math.max(0, bottom - top);
}

function colOverlapLength(a: TileDef, b: TileDef): number {
  const left = Math.max(a.col, b.col);
  const right = Math.min(a.col + a.colSpan, b.col + b.colSpan);
  return Math.max(0, right - left);
}

function validRightStep(from: TileDef, to: TileDef): boolean {
  if (from.col + from.colSpan !== to.col) return false;
  return rowOverlapLength(from, to) > 0;
}

function validLeftStep(from: TileDef, to: TileDef): boolean {
  if (to.col + to.colSpan !== from.col) return false;
  return rowOverlapLength(from, to) > 0;
}

function validDownStep(from: TileDef, to: TileDef): boolean {
  if (from.row + from.rowSpan !== to.row) return false;
  return colOverlapLength(from, to) > 0;
}

function validUpStep(from: TileDef, to: TileDef): boolean {
  if (to.row + to.rowSpan !== from.row) return false;
  return colOverlapLength(from, to) > 0;
}

export function directionBetween(a: TileDef, b: TileDef): Direction | null {
  if (validRightStep(a, b)) return 'right';
  if (validLeftStep(a, b)) return 'left';
  if (validDownStep(a, b)) return 'down';
  if (validUpStep(a, b)) return 'up';
  return null;
}

export function neighborsInDirection(
  tile: TileDef,
  tiles: TileDef[],
  direction: Direction,
): TileDef[] {
  return tiles.filter((other) => {
    if (other.id === tile.id) return false;
    return directionBetween(tile, other) === direction;
  });
}

export function canStep(from: TileDef, to: TileDef, tiles: TileDef[]): boolean {
  void tiles;
  return directionBetween(from, to) !== null;
}

export function getLegalNextTiles(from: TileDef, tiles: TileDef[], visited: Set<string>): TileDef[] {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  const next: TileDef[] = [];
  for (const dir of directions) {
    const neighbors = neighborsInDirection(from, tiles, dir);
    for (const candidate of neighbors) {
      if (!visited.has(candidate.id) && canStep(from, candidate, tiles)) {
        next.push(candidate);
      }
    }
  }
  return next;
}

export function pathToLetters(path: TileDef[]): string {
  return path.map((t) => t.letters).join('');
}

export function isPathConnected(path: TileDef[], tiles: TileDef[]): boolean {
  if (path.length === 0) return false;
  for (let i = 1; i < path.length; i++) {
    if (!canStep(path[i - 1]!, path[i]!, tiles)) return false;
  }
  return true;
}
