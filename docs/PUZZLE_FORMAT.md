# Puzzle & layout format

## Two-layer model

1. **Layout** (`src/layouts/*.json`) — fixed 5×5 geometry only: slot positions and sizes.  
   All puzzles currently use the **`classic`** layout (Figma screenshot topology).

2. **Puzzle content** (`src/puzzles/content/*.json`) — letters on each slot + phrase + solution paths.

This separates *how blocks fit together* from *what letters they carry*.

## Grid rules (every puzzle)

| Rule | Detail |
|------|--------|
| Grid | Always **5×5** (25 unit cells) |
| Tile sizes | `1×1`, `2×1`, `1×2`, `2×2` only |
| Letters | **1 letter** on `1×1`, `2×1`, `1×2` |
| | **2 letters** on `2×2` only (paired, e.g. `CH`, `OO`) |
| Coverage | Tiles must fill the grid with no gaps or overlaps |

## Content file schema

```json
{
  "id": "the-end",
  "layoutId": "classic",
  "phrase": "TIME WILL TELL",
  "words": ["TIME", "WILL", "TELL"],
  "letters": {
    "s00": "T",
    "s20": "QU"
  },
  "solutions": [
    { "word": "THE", "path": ["s00", "s10", "s11"] }
  ]
}
```

Slot ids come from the layout file (`s00`, `s10`, `s20`, …).

## Authoring checklist

1. Copy an existing content file or start from `classic` slot ids.
2. Assign **decoy letters** on unused slots — avoid spelling the phrase in reading order.
3. Route each word through **non-obvious paths** (not a straight row/column for 3+ letter words).
4. Run `npm test` — validation checks seams, spelling, and path quality.

## Helper: find paths

Use `findPathsForWord()` in `src/layouts/findPath.ts` (BFS) while authoring.

## Future: more 5×5 tilings

The `classic` layout is one valid tiling. Other tilings can be added under `src/layouts/` if they pass `validateLayout()`. Enumerating *all* tilings is a separate catalog problem; v1 uses one curated layout so every daily puzzle shares the same block **feel** as the Figma mock.
