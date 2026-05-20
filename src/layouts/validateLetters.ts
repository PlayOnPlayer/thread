import type { LayoutDef } from './types';

export function validateLetterAssignment(
  layout: LayoutDef,
  letters: Record<string, string>,
): string[] {
  const errors: string[] = [];
  const slotIds = new Set(layout.slots.map((s) => s.id));

  for (const slot of layout.slots) {
    const value = letters[slot.id];
    if (!value) {
      errors.push(`missing letters for slot ${slot.id}`);
      continue;
    }
    const upper = value.toUpperCase();
    if (!/^[A-Z]+$/.test(upper)) {
      errors.push(`slot ${slot.id}: invalid letters "${value}"`);
    }

    const isDouble = slot.colSpan === 2 && slot.rowSpan === 2;
    if (isDouble) {
      if (upper.length !== 2) {
        errors.push(`slot ${slot.id}: 2×2 tiles must have exactly 2 letters`);
      }
    } else if (upper.length !== 1) {
      errors.push(`slot ${slot.id}: ${slot.colSpan}×${slot.rowSpan} tiles must have exactly 1 letter`);
    }
  }

  for (const id of Object.keys(letters)) {
    if (!slotIds.has(id)) {
      errors.push(`unknown slot id in letters: ${id}`);
    }
  }

  return errors;
}
