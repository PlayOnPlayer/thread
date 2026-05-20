import { ALLOWED_SIZES, GRID_SIZE } from './constants';
import { validateTileGrouping } from './tileGrouping';
import type { LayoutDef, LayoutSlot } from './types';

function isAllowedSize(colSpan: number, rowSpan: number): boolean {
  return ALLOWED_SIZES.some((s) => s.colSpan === colSpan && s.rowSpan === rowSpan);
}

/** Every cell in the 5×5 grid must be covered exactly once. */
export function validateLayout(layout: LayoutDef): string[] {
  const errors: string[] = [];

  if (layout.gridCols !== GRID_SIZE || layout.gridRows !== GRID_SIZE) {
    errors.push(`layout must be ${GRID_SIZE}×${GRID_SIZE}`);
  }

  const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null),
  );

  for (const slot of layout.slots) {
    if (!isAllowedSize(slot.colSpan, slot.rowSpan)) {
      errors.push(
        `slot ${slot.id}: size ${slot.colSpan}×${slot.rowSpan} not allowed (use 1×1, 2×1, 1×2, or 2×2)`,
      );
    }

    for (let r = slot.row; r < slot.row + slot.rowSpan; r++) {
      for (let c = slot.col; c < slot.col + slot.colSpan; c++) {
        if (r >= GRID_SIZE || c >= GRID_SIZE) {
          errors.push(`slot ${slot.id}: extends outside grid`);
          continue;
        }
        if (grid[r]![c]) {
          errors.push(`slot ${slot.id}: overlaps ${grid[r]![c]} at (${c},${r})`);
        } else {
          grid[r]![c] = slot.id;
        }
      }
    }
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r]![c]) {
        errors.push(`uncovered cell at (${c},${r})`);
      }
    }
  }

  const ids = new Set<string>();
  for (const slot of layout.slots) {
    if (ids.has(slot.id)) errors.push(`duplicate slot id ${slot.id}`);
    ids.add(slot.id);
  }

  errors.push(...validateTileGrouping(layout.slots));

  return errors;
}

export function slotArea(slot: LayoutSlot): number {
  return slot.colSpan * slot.rowSpan;
}
