/* AUTO-GENERATED — run: npx tsx scripts/generate-catalog.ts */
import type { LayoutDef } from './types';
import { validateLayout } from './validateLayout';
import layout_01 from './generated/layout-01.json';
import layout_02 from './generated/layout-02.json';
import layout_03 from './generated/layout-03.json';
import layout_04 from './generated/layout-04.json';
import layout_05 from './generated/layout-05.json';
import layout_06 from './generated/layout-06.json';
import layout_07 from './generated/layout-07.json';
import layout_08 from './generated/layout-08.json';
import layout_09 from './generated/layout-09.json';
import layout_10 from './generated/layout-10.json';
import layout_11 from './generated/layout-11.json';
import layout_12 from './generated/layout-12.json';
import layout_13 from './generated/layout-13.json';
import layout_14 from './generated/layout-14.json';
import layout_15 from './generated/layout-15.json';
import layout_16 from './generated/layout-16.json';
import layout_17 from './generated/layout-17.json';
import layout_18 from './generated/layout-18.json';
import layout_19 from './generated/layout-19.json';
import layout_20 from './generated/layout-20.json';
import layout_21 from './generated/layout-21.json';
import layout_22 from './generated/layout-22.json';
import layout_23 from './generated/layout-23.json';
import layout_24 from './generated/layout-24.json';
import layout_25 from './generated/layout-25.json';

export const layouts: LayoutDef[] = [
  layout_01 as LayoutDef,
  layout_02 as LayoutDef,
  layout_03 as LayoutDef,
  layout_04 as LayoutDef,
  layout_05 as LayoutDef,
  layout_06 as LayoutDef,
  layout_07 as LayoutDef,
  layout_08 as LayoutDef,
  layout_09 as LayoutDef,
  layout_10 as LayoutDef,
  layout_11 as LayoutDef,
  layout_12 as LayoutDef,
  layout_13 as LayoutDef,
  layout_14 as LayoutDef,
  layout_15 as LayoutDef,
  layout_16 as LayoutDef,
  layout_17 as LayoutDef,
  layout_18 as LayoutDef,
  layout_19 as LayoutDef,
  layout_20 as LayoutDef,
  layout_21 as LayoutDef,
  layout_22 as LayoutDef,
  layout_23 as LayoutDef,
  layout_24 as LayoutDef,
  layout_25 as LayoutDef,
];

for (const layout of layouts) {
  const errors = validateLayout(layout);
  if (errors.length > 0) {
    throw new Error(`Invalid layout "${layout.id}":\n${errors.join('\n')}`);
  }
}

export function getLayout(id: string): LayoutDef | undefined {
  return layouts.find((l) => l.id === id);
}

export function listLayoutIds(): string[] {
  return layouts.map((l) => l.id);
}
