import type { LayoutSlot } from './types';

export function tileTypeKey(slot: LayoutSlot): string {
  return `${slot.colSpan}x${slot.rowSpan}`;
}

function rangesOverlap(a0: number, a1: number, b0: number, b1: number): boolean {
  return a0 < b1 && b0 < a1;
}

/** True if two slots share any edge segment (touching neighbors). */
export function slotsShareEdge(a: LayoutSlot, b: LayoutSlot): boolean {
  if (a.col + a.colSpan === b.col && rangesOverlap(a.row, a.row + a.rowSpan, b.row, b.row + b.rowSpan)) {
    return true;
  }
  if (b.col + b.colSpan === a.col && rangesOverlap(a.row, a.row + a.rowSpan, b.row, b.row + b.rowSpan)) {
    return true;
  }
  if (a.row + a.rowSpan === b.row && rangesOverlap(a.col, a.col + a.colSpan, b.col, b.col + b.colSpan)) {
    return true;
  }
  if (b.row + b.rowSpan === a.row && rangesOverlap(a.col, a.col + a.colSpan, b.col, b.col + b.colSpan)) {
    return true;
  }
  return false;
}

export function validateTileGrouping(slots: LayoutSlot[]): string[] {
  const errors: string[] = [];
  const byType = new Map<string, LayoutSlot[]>();

  for (const slot of slots) {
    const key = tileTypeKey(slot);
    if (!byType.has(key)) byType.set(key, []);
    byType.get(key)!.push(slot);
  }

  for (const [type, group] of byType) {
  const is2x2 = type === '2x2';

    if (is2x2) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          if (slotsShareEdge(group[i]!, group[j]!)) {
            errors.push(`2×2 tiles must not touch (${group[i]!.id} ↔ ${group[j]!.id})`);
          }
        }
      }
      continue;
    }

    const adj = new Map<string, string[]>();
    for (const slot of group) {
      adj.set(
        slot.id,
        group.filter((other) => other.id !== slot.id && slotsShareEdge(slot, other)).map((o) => o.id),
      );
    }

    const visited = new Set<string>();
    const components: string[][] = [];

    for (const slot of group) {
      if (visited.has(slot.id)) continue;
      const stack = [slot.id];
      const component: string[] = [];
      visited.add(slot.id);
      while (stack.length) {
        const id = stack.pop()!;
        component.push(id);
        for (const next of adj.get(id) ?? []) {
          if (!visited.has(next)) {
            visited.add(next);
            stack.push(next);
          }
        }
      }
      components.push(component);
    }

    const multi = components.filter((c) => c.length > 1);
    if (multi.length > 1) {
      errors.push(`tile type ${type}: more than one adjacent group`);
    }
    if (multi.some((c) => c.length > 2)) {
      errors.push(`tile type ${type}: group has more than two tiles`);
    }
  }

  return errors;
}

export function isPlacementAllowed(candidate: LayoutSlot, slots: LayoutSlot[]): boolean {
  const combined = [...slots, candidate];
  return validateTileGrouping(combined).length === 0;
}
