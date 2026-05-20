export type PaginationItem =
  | { type: 'page'; level: number }
  | { type: 'ellipsis' };

const MAX_VISIBLE_PAGES = 7;
const MIDDLE_WINDOW = 5;

export function getPaginationWindow(
  activeLevel: number,
  totalLevels: number,
): { start: number; end: number } {
  if (totalLevels <= MAX_VISIBLE_PAGES) {
    return { start: 1, end: totalLevels };
  }

  if (activeLevel <= MAX_VISIBLE_PAGES) {
    return { start: 1, end: MAX_VISIBLE_PAGES };
  }

  if (activeLevel >= totalLevels - (MIDDLE_WINDOW - 1)) {
    return { start: totalLevels - (MIDDLE_WINDOW - 1), end: totalLevels };
  }

  const half = Math.floor(MIDDLE_WINDOW / 2);
  return { start: activeLevel - half, end: activeLevel + half };
}

export function getPaginationItems(activeLevel: number, totalLevels: number): PaginationItem[] {
  if (totalLevels <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalLevels }, (_, index) => ({
      type: 'page' as const,
      level: index + 1,
    }));
  }

  if (activeLevel <= MAX_VISIBLE_PAGES) {
    const items: PaginationItem[] = [];
    const end = activeLevel <= 6 ? 6 : MAX_VISIBLE_PAGES;
    for (let level = 1; level <= end; level++) {
      items.push({ type: 'page', level });
    }
    if (totalLevels > end) {
      if (end < totalLevels - 1) {
        items.push({ type: 'ellipsis' });
      }
      items.push({ type: 'page', level: totalLevels });
    }
    return items;
  }

  const { start, end } = getPaginationWindow(activeLevel, totalLevels);
  const items: PaginationItem[] = [];

  if (start > 1) {
    items.push({ type: 'page', level: 1 });
    if (start > 2) {
      items.push({ type: 'ellipsis' });
    }
  }

  for (let level = start; level <= end; level++) {
    items.push({ type: 'page', level });
  }

  if (end < totalLevels) {
    if (end < totalLevels - 1) {
      items.push({ type: 'ellipsis' });
    }
    items.push({ type: 'page', level: totalLevels });
  }

  return items;
}
