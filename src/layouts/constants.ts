export const GRID_SIZE = 5;

export const ALLOWED_SIZES = [
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 2, rowSpan: 1 },
  { colSpan: 1, rowSpan: 2 },
  { colSpan: 2, rowSpan: 2 },
] as const;

export type AllowedSize = (typeof ALLOWED_SIZES)[number];
