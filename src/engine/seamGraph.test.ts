import { describe, expect, it } from 'vitest';
import { canStep, directionBetween, neighborsInDirection } from './seamGraph';
import type { TileDef } from './types';

function tile(
  id: string,
  letters: string,
  col: number,
  row: number,
  colSpan: number,
  rowSpan: number,
): TileDef {
  return { id, letters, col, row, colSpan, rowSpan };
}

describe('seam overlap rules', () => {
  it('allows any shared edge overlap in both directions', () => {
    const b = tile('b', 'B', 0, 1, 2, 1);
    const o = tile('o', 'O', 2, 1, 1, 2);
    expect(canStep(b, o, [b, o])).toBe(true);
    expect(canStep(o, b, [b, o])).toBe(true);
  });

  it('1×1 can step to 2×2 on a full 1×1 seam', () => {
    const ck = tile('ck', 'CK', 0, 3, 2, 2);
    const l = tile('l', 'L', 2, 4, 1, 1);
    expect(canStep(l, ck, [ck, l])).toBe(true);
  });

  it('allows moving from a 2×2 into a 1×1 when their edges touch', () => {
    const wa = tile('wa', 'WA', 2, 2, 2, 2);
    const n = tile('n', 'N', 4, 2, 1, 1);
    expect(canStep(wa, n, [wa, n])).toBe(true);
    expect(canStep(n, wa, [wa, n])).toBe(true);
  });

  it('allows partial edge overlap', () => {
    const tall = tile('t', 'T', 1, 1, 1, 2);
    const wide = tile('w', 'W', 2, 2, 2, 1);
    expect(canStep(tall, wide, [tall, wide])).toBe(true);
    expect(canStep(wide, tall, [tall, wide])).toBe(true);
  });

  it('allows split seams with multiple neighbors in one direction', () => {
    const tall = tile('tall', 'T', 2, 0, 1, 2);
    const leftA = tile('a', 'A', 1, 0, 1, 1);
    const leftB = tile('b', 'B', 1, 1, 1, 1);
    const tiles = [tall, leftA, leftB];
    expect(neighborsInDirection(tall, tiles, 'left').length).toBe(2);
    expect(canStep(tall, leftA, tiles)).toBe(true);
    expect(canStep(tall, leftB, tiles)).toBe(true);
  });
});

describe('shared-edge seams in mixed layouts', () => {
  it('allows a 2×2 tile to move to every touching neighbor', () => {
    const rt = tile('rt', 'RT', 0, 0, 2, 2);
    const a = tile('a', 'A', 2, 0, 2, 1);
    const e = tile('e', 'E', 2, 1, 2, 1);
    const h = tile('h', 'H', 0, 2, 2, 1);
    const tiles = [rt, a, e, h];

    expect(canStep(rt, a, tiles)).toBe(true);
    expect(canStep(rt, e, tiles)).toBe(true);
    expect(canStep(rt, h, tiles)).toBe(true);
  });

  it('allows a smaller tile to move to each touching larger neighbor', () => {
    const n = tile('n', 'N', 0, 2, 2, 1);
    const tr = tile('tr', 'TR', 0, 0, 2, 2);
    const inside = tile('in', 'IN', 2, 2, 2, 2);
    const a = tile('a', 'A', 0, 3, 1, 2);
    const p = tile('p', 'P', 1, 3, 1, 2);
    const tiles = [n, tr, inside, a, p];

    expect(canStep(n, tr, tiles)).toBe(true);
    expect(directionBetween(n, tr)).toBe('up');
    expect(canStep(n, inside, tiles)).toBe(true);
    expect(directionBetween(n, inside)).toBe('right');
    expect(canStep(n, a, tiles)).toBe(true);
    expect(canStep(n, p, tiles)).toBe(true);
  });
});
