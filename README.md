# Seam

Trace the phrase through the fractures — but only where the seams align.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Validate all puzzles + engine tests |
| `npm run generate` | Rebuild 25 layouts + 25 puzzle content files |

## Daily play

- **25 rotating puzzles** — each day uses the next puzzle in the catalog (`day-01` … `day-25`), then wraps.
- Every puzzle is a **5×5** board with mixed block sizes (Figma style).
- **Letters change every puzzle**; layout geometry rotates too.
- Phrases use **short words only** (≤ 5 letters per word).

Override: `/?level=7` or `/?puzzle=day-07`

## Docs

- [Puzzle format](docs/PUZZLE_FORMAT.md)
- [Layout catalog](docs/LAYOUTS.md)
