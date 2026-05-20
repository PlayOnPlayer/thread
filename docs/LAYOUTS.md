# 5×5 layout catalog

## Rules (every puzzle)

- **5×5 grid**, fully tiled
- Pieces: `1×1`, `2×1`, `1×2`, `2×2` only
- **2×2** → exactly **2 letters** (e.g. `CH`, `ST`)
- All other sizes → **1 letter**
- Decoys stay **readable** (clear consonants / common pairs)
- **Tile grouping:** `2×2` blocks never touch another `2×2`
- **Tile grouping:** each other size may form **at most one** adjacent pair (no chains of 3+ same-sized tiles)
- **Board:** tiles touch with **0px gap** (shared borders only)

## 25 rotating layouts

Layouts live in [`src/layouts/generated/`](../src/layouts/generated/) as `layout-01` … `layout-25`.

- **layout-01 … layout-25** are valid tilings from the same piece set

Each daily puzzle pairs **one layout** with **one phrase** (unique letters on the board).

## Regenerating the catalog

```bash
npm run generate
```

This runs [`scripts/generate-catalog.ts`](../scripts/generate-catalog.ts), which:

1. Backtracking-searches valid 5×5 tilings
2. Assigns short phrases (3–4 words, each ≤ 5 letters)
3. Finds non–left-to-right solution paths
4. Fills decoys with readable letters
5. Rewrites `src/layouts/registry.ts` and `src/puzzles/index.ts`

## Adding more layouts later

Increase `CATALOG_SIZE` in [`scripts/generate-catalog.ts`](../scripts/generate-catalog.ts) or add hand-authored JSON under `src/layouts/generated/` and import in `registry.ts`.

Enumerating *all* possible tilings is possible but huge; we curate a rotating set of 25.
