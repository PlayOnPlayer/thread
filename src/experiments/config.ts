/**
 * Feature flags for UX experiments. Flip to false to revert without hunting through components.
 */
export const EXPERIMENTS = {
  sharpHint: true,
  legalNextHighlight: true,
  firstVisitDemo: true,
  vowelAwareDecoys: true,
  wordProgressLabel: true,
  clearWrongMessages: true,
} as const;
