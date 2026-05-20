import { describe, expect, it } from 'vitest';
import { layouts } from './registry';
import { validateTileGrouping } from './tileGrouping';

describe('tile grouping rules', () => {
  it('all catalog layouts pass grouping validation', () => {
    for (const layout of layouts) {
      expect(validateTileGrouping(layout.slots)).toEqual([]);
    }
  });
});
